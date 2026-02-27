import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth } from "../middleware/auth";
import { env } from "../env";
import { getUserApiKey } from "./apiKey";
import { StubProvider } from "../services/ai/stub";
import { OpenAIProvider } from "../services/ai/openai";
import { GeminiProvider } from "../services/ai/gemini";
import { StubTranscriber } from "../services/transcription/stub";
import { WhisperTranscriber } from "../services/transcription/whisper";
import { GeminiTranscriber } from "../services/transcription/gemini-transcriber";

const uploadsDir = path.join(process.cwd(), "server", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer with file size limit and file type validation
const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
  fileFilter: (_req, file, cb) => {
    // Accept common audio/video formats
    const allowedMimes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/m4a",
      "audio/x-m4a",
      "video/mp4",
      "video/mpeg",
      "audio/webm",
      "video/webm",
    ];
    if (
      allowedMimes.includes(file.mimetype) ||
      file.originalname.match(/\.(mp3|wav|m4a|mp4|mpeg|webm)$/i)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only audio/video files are allowed."));
    }
  },
});

export const meetings = Router();

// Validation schemas
const createMeetingSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
});

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, "Invalid meeting ID"),
});

function getAI(apiKey?: string, model?: string) {
  if (env.AI_PROVIDER === "openai") return new OpenAIProvider(apiKey, model);
  if (env.AI_PROVIDER === "gemini") return new GeminiProvider(apiKey, model);
  return new StubProvider();
}

function getTranscriber(apiKey?: string, model?: string) {
  if (env.TRANSCRIBE_PROVIDER === "whisper")
    return new WhisperTranscriber(apiKey);
  if (env.TRANSCRIBE_PROVIDER === "gemini")
    return new GeminiTranscriber(apiKey, model);
  return new StubTranscriber();
}

// Helper to normalize path separators to forward slashes (cross-platform)
function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

// All meeting routes require authentication
meetings.use(requireAuth);

/**
 * GET /api/meetings
 * List all meetings for authenticated user
 */
meetings.get("/", async (req, res) => {
  try {
    const userId = (req as any).user.id as number;
    const items = await prisma.meeting.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        audioPath: true,
        summary: true,
        createdAt: true,
        updatedAt: true,
        // Don't send full transcript in list view for performance
      },
    });
    res.json({ items });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).json({ error: "Failed to fetch meetings" });
  }
});

/**
 * POST /api/meetings
 * Create new meeting metadata (without audio)
 */
meetings.post("/", async (req, res) => {
  try {
    const userId = (req as any).user.id as number;

    // Validate request body
    const validation = createMeetingSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.error.errors,
      });
    }

    const { title } = validation.data;
    const item = await prisma.meeting.create({
      data: { title, ownerId: userId },
    });

    res.status(201).json({ item });
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ error: "Failed to create meeting" });
  }
});

/**
 * POST /api/meetings/:id/upload
 * Upload audio file for a meeting
 */
meetings.post("/:id/upload", upload.single("audio"), async (req, res) => {
  try {
    const userId = (req as any).user.id as number;

    // Validate ID parameter
    const paramValidation = idParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      // Clean up uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        error: "Invalid meeting ID format",
      });
    }

    const id = Number(paramValidation.data.id);

    // Check if meeting exists and belongs to user
    const meeting = await prisma.meeting.findFirst({
      where: { id, ownerId: userId },
    });

    if (!meeting) {
      // Clean up uploaded file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: "Meeting not found" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    // Delete old audio file if exists
    if (meeting.audioPath) {
      const oldPath = path.join(process.cwd(), "server", meeting.audioPath);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Store relative path for serving via express.static
    const relativePath = path.relative(
      path.join(process.cwd(), "server"),
      req.file.path,
    );

    // Normalize path separators for cross-platform compatibility
    const normalizedPath = normalizePath(relativePath);

    await prisma.meeting.update({
      where: { id },
      data: { audioPath: normalizedPath },
    });

    res.json({
      ok: true,
      audioPath: normalizedPath,
      message: "Audio file uploaded successfully",
    });
  } catch (error: any) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error("Failed to clean up file:", unlinkError);
      }
    }

    if (error.message?.includes("Invalid file type")) {
      return res.status(400).json({ error: error.message });
    }

    console.error("Error uploading audio:", error);
    res.status(500).json({ error: "Failed to upload audio file" });
  }
});

/**
 * POST /api/meetings/:id/process
 * Transcribe and analyze meeting with AI
 */
meetings.post("/:id/process", async (req, res) => {
  try {
    const userId = (req as any).user.id as number;

    // Validate ID parameter
    const paramValidation = idParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({
        error: "Invalid meeting ID format",
      });
    }

    const id = Number(paramValidation.data.id);

    // Check if meeting exists and belongs to user
    const meeting = await prisma.meeting.findFirst({
      where: { id, ownerId: userId },
    });

    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    if (!meeting.audioPath) {
      return res.status(400).json({
        error: "No audio file found. Please upload audio first.",
      });
    }

    // Enforce per-user API key for non-stub providers.
    // Read from process.env directly so test overrides take effect.
    const isStub =
      (process.env.AI_PROVIDER ?? env.AI_PROVIDER) === "stub" &&
      (process.env.TRANSCRIBE_PROVIDER ?? env.TRANSCRIBE_PROVIDER) === "stub";
    const userApiKey = isStub ? null : await getUserApiKey(userId);

    if (!isStub && !userApiKey) {
      return res.status(403).json({ error: "No API key configured" });
    }

    const apiKeyValue = userApiKey?.key;
    const modelValue = userApiKey?.model;

    const absolutePath = path.join(process.cwd(), "server", meeting.audioPath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(400).json({
        error: "Audio file not found on server. Please re-upload.",
      });
    }

    // Step 1: Transcribe audio
    let transcriptText: string;
    try {
      const transcriber = getTranscriber(apiKeyValue, modelValue);
      const { text } = await transcriber.transcribe({ filePath: absolutePath });
      transcriptText = text;
    } catch (transcribeError: any) {
      console.error("Transcription error:", transcribeError);
      return res.status(500).json({
        error: "Failed to transcribe audio",
        details: transcribeError.message,
      });
    }

    // Step 2: AI analysis
    let aiOutput;
    try {
      const ai = getAI(apiKeyValue, modelValue);
      aiOutput = await ai.summarizeAndExtract({
        transcript: transcriptText,
        title: meeting.title,
      });
    } catch (aiError: any) {
      console.error("AI processing error:", aiError);
      return res.status(500).json({
        error: "Failed to analyze transcript with AI",
        details: aiError.message,
      });
    }

    // Step 3: Save results
    const updated = await prisma.meeting.update({
      where: { id },
      data: {
        transcript: transcriptText,
        summary: aiOutput.summary,
        actionItems: JSON.stringify(aiOutput.actionItems ?? []),
        decisions: JSON.stringify(aiOutput.decisions ?? []),
      },
    });

    res.json({
      item: {
        ...updated,
        actionItems: aiOutput.actionItems,
        decisions: aiOutput.decisions,
      },
      message: "Meeting processed successfully",
    });
  } catch (error) {
    console.error("Error processing meeting:", error);
    res.status(500).json({ error: "Failed to process meeting" });
  }
});

/**
 * GET /api/meetings/:id
 * Get detailed meeting information
 */
meetings.get("/:id", async (req, res) => {
  try {
    const userId = (req as any).user.id as number;

    // Validate ID parameter
    const paramValidation = idParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({
        error: "Invalid meeting ID format",
      });
    }

    const id = Number(paramValidation.data.id);

    const meeting = await prisma.meeting.findFirst({
      where: { id, ownerId: userId },
    });

    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    res.json({
      item: {
        ...meeting,
        actionItems: meeting.actionItems ? JSON.parse(meeting.actionItems) : [],
        decisions: meeting.decisions ? JSON.parse(meeting.decisions) : [],
      },
    });
  } catch (error) {
    console.error("Error fetching meeting:", error);
    res.status(500).json({ error: "Failed to fetch meeting details" });
  }
});

/**
 * DELETE /api/meetings/:id
 * Delete a meeting and its associated audio file
 */
meetings.delete("/:id", async (req, res) => {
  try {
    const userId = (req as any).user.id as number;

    // Validate ID parameter
    const paramValidation = idParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({
        error: "Invalid meeting ID format",
      });
    }

    const id = Number(paramValidation.data.id);

    // Check if meeting exists and belongs to user
    const meeting = await prisma.meeting.findFirst({
      where: { id, ownerId: userId },
    });

    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    // Delete associated audio file if it exists
    if (meeting.audioPath) {
      const audioFilePath = path.join(
        process.cwd(),
        "server",
        meeting.audioPath,
      );
      if (fs.existsSync(audioFilePath)) {
        try {
          fs.unlinkSync(audioFilePath);
        } catch (fileError) {
          console.error("Error deleting audio file:", fileError);
          // Continue with database deletion even if file deletion fails
        }
      }
    }

    // Delete meeting from database
    await prisma.meeting.delete({
      where: { id },
    });

    res.json({
      ok: true,
      message: "Meeting deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting meeting:", error);
    res.status(500).json({ error: "Failed to delete meeting" });
  }
});
