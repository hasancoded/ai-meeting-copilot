// FILE: server/src/tests/meetings.test.ts
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { auth } from "../routes/auth";
import { meetings } from "../routes/meetings";
import { prisma } from "../db";
import "./setup";

// Create test app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", auth);
app.use("/api/meetings", meetings);

// Helper to create authenticated user and get token
async function createAuthUser() {
  const response = await request(app)
    .post("/api/auth/register")
    .send({
      email: `test-${Date.now()}@example.com`,
      password: "password123",
      name: "Test User",
    });

  const cookies = response.headers["set-cookie"];
  const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
  const tokenCookie = cookieArray.find((cookie) => cookie.startsWith("token="));
  return tokenCookie || "";
}

// Helper to create a test audio file
function createTestAudioFile(): string {
  const uploadsDir = path.join(process.cwd(), "server", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const testFilePath = path.join(uploadsDir, `test-audio-${Date.now()}.mp3`);
  // Create a minimal MP3 file (just a header)
  const mp3Header = Buffer.from([
    0xff, 0xfb, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
  ]);
  fs.writeFileSync(testFilePath, mp3Header);
  return testFilePath;
}

describe("Meeting Routes", () => {
  let authCookie: string;
  let testAudioPath: string;

  beforeEach(async () => {
    authCookie = await createAuthUser();
    testAudioPath = createTestAudioFile();
  });

  afterEach(() => {
    // Clean up test audio files
    if (testAudioPath && fs.existsSync(testAudioPath)) {
      try {
        fs.unlinkSync(testAudioPath);
      } catch (err) {
        // File might have been moved/deleted by upload handler
      }
    }

    // Clean up any uploaded files from tests
    const uploadsDir = path.join(process.cwd(), "server", "uploads");
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach((file) => {
        if (
          file.startsWith("test-audio") ||
          (!file.includes(".gitkeep") && file !== ".gitkeep")
        ) {
          try {
            fs.unlinkSync(path.join(uploadsDir, file));
          } catch (err) {
            // Ignore cleanup errors
          }
        }
      });
    }
  });

  describe("GET /api/meetings", () => {
    it("should return empty list for new user", async () => {
      const response = await request(app)
        .get("/api/meetings")
        .set("Cookie", authCookie)
        .expect(200);

      expect(response.body).toHaveProperty("items");
      expect(response.body.items).toEqual([]);
    });

    it("should require authentication", async () => {
      await request(app).get("/api/meetings").expect(401);
    });

    it("should return user's meetings", async () => {
      // Create a meeting first
      await request(app)
        .post("/api/meetings")
        .set("Cookie", authCookie)
        .send({ title: "Test Meeting" });

      const response = await request(app)
        .get("/api/meetings")
        .set("Cookie", authCookie)
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0].title).toBe("Test Meeting");
    });
  });

  describe("POST /api/meetings", () => {
    it("should create a new meeting", async () => {
      const response = await request(app)
        .post("/api/meetings")
        .set("Cookie", authCookie)
        .send({ title: "New Meeting" })
        .expect(201);

      expect(response.body).toHaveProperty("item");
      expect(response.body.item.title).toBe("New Meeting");
      expect(response.body.item).toHaveProperty("id");
      expect(response.body.item).toHaveProperty("createdAt");
    });

    it("should require authentication", async () => {
      await request(app)
        .post("/api/meetings")
        .send({ title: "Test" })
        .expect(401);
    });

    it("should fail with empty title", async () => {
      const response = await request(app)
        .post("/api/meetings")
        .set("Cookie", authCookie)
        .send({ title: "" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should fail with missing title", async () => {
      const response = await request(app)
        .post("/api/meetings")
        .set("Cookie", authCookie)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should fail with title too long", async () => {
      const longTitle = "a".repeat(201);
      const response = await request(app)
        .post("/api/meetings")
        .set("Cookie", authCookie)
        .send({ title: longTitle })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/meetings/:id/upload", () => {
    let meetingId: number;

    beforeEach(async () => {
      const response = await request(app)
        .post("/api/meetings")
        .set("Cookie", authCookie)
        .send({ title: "Upload Test" });
      meetingId = response.body.item.id;
    });

    it("should upload audio file successfully", async () => {
      const response = await request(app)
        .post(`/api/meetings/${meetingId}/upload`)
        .set("Cookie", authCookie)
        .attach("audio", testAudioPath)
        .expect(200);

      expect(response.body).toHaveProperty("ok");
      expect(response.body.ok).toBe(true);
      expect(response.body).toHaveProperty("audioPath");
      // Normalize path for cross-platform comparison
      const normalizedPath = response.body.audioPath.replace(/\\/g, "/");
      expect(normalizedPath).toContain("uploads/");
    });

    it("should require authentication", async () => {
      // Do not attach a file — the server rejects unauthenticated requests
      // before multer reads the body. Uploading a file here causes ECONNRESET
      // because the server closes the socket mid-stream.
      await request(app).post(`/api/meetings/${meetingId}/upload`).expect(401);
    });

    it("should fail with invalid meeting ID", async () => {
      await request(app)
        .post("/api/meetings/invalid/upload")
        .set("Cookie", authCookie)
        .attach("audio", testAudioPath)
        .expect(400);
    });

    it("should fail with non-existent meeting", async () => {
      await request(app)
        .post("/api/meetings/99999/upload")
        .set("Cookie", authCookie)
        .attach("audio", testAudioPath)
        .expect(404);
    });

    it("should fail without audio file", async () => {
      const response = await request(app)
        .post(`/api/meetings/${meetingId}/upload`)
        .set("Cookie", authCookie)
        .expect(400);

      expect(response.body.error).toContain("No audio file");
    });

    it("should replace existing audio file", async () => {
      // Upload first file
      await request(app)
        .post(`/api/meetings/${meetingId}/upload`)
        .set("Cookie", authCookie)
        .attach("audio", testAudioPath);

      // Upload second file (create new test file)
      const secondTestFile = createTestAudioFile();
      const response = await request(app)
        .post(`/api/meetings/${meetingId}/upload`)
        .set("Cookie", authCookie)
        .attach("audio", secondTestFile)
        .expect(200);

      expect(response.body.ok).toBe(true);

      // Clean up second test file
      if (fs.existsSync(secondTestFile)) {
        fs.unlinkSync(secondTestFile);
      }
    });
  });

  describe("POST /api/meetings/:id/process", () => {
    let meetingId: number;

    beforeEach(async () => {
      // Create meeting and upload audio
      const createResponse = await request(app)
        .post("/api/meetings")
        .set("Cookie", authCookie)
        .send({ title: "Process Test" });
      meetingId = createResponse.body.item.id;

      await request(app)
        .post(`/api/meetings/${meetingId}/upload`)
        .set("Cookie", authCookie)
        .attach("audio", testAudioPath);
    });

    it("should process meeting with stub providers", async () => {
      const response = await request(app)
        .post(`/api/meetings/${meetingId}/process`)
        .set("Cookie", authCookie)
        .expect(200);

      expect(response.body).toHaveProperty("item");
      expect(response.body.item).toHaveProperty("transcript");
      expect(response.body.item).toHaveProperty("summary");
      expect(response.body.item).toHaveProperty("actionItems");
      expect(response.body.item).toHaveProperty("decisions");
      expect(Array.isArray(response.body.item.actionItems)).toBe(true);
      expect(Array.isArray(response.body.item.decisions)).toBe(true);
    });

    it("should require authentication", async () => {
      await request(app).post(`/api/meetings/${meetingId}/process`).expect(401);
    });

    it("should fail with invalid meeting ID", async () => {
      await request(app)
        .post("/api/meetings/invalid/process")
        .set("Cookie", authCookie)
        .expect(400);
    });

    it("should fail with non-existent meeting", async () => {
      await request(app)
        .post("/api/meetings/99999/process")
        .set("Cookie", authCookie)
        .expect(404);
    });

    it("should fail without uploaded audio", async () => {
      // Create meeting without uploading audio
      const createResponse = await request(app)
        .post("/api/meetings")
        .set("Cookie", authCookie)
        .send({ title: "No Audio" });
      const newMeetingId = createResponse.body.item.id;

      const response = await request(app)
        .post(`/api/meetings/${newMeetingId}/process`)
        .set("Cookie", authCookie)
        .expect(400);

      expect(response.body.error).toContain("audio");
    });

    it("should return 403 when non-stub provider is configured and no API key is saved", async () => {
      // Temporarily switch env to non-stub to trigger the guard
      const originalAI = process.env.AI_PROVIDER;
      const originalTranscribe = process.env.TRANSCRIBE_PROVIDER;
      process.env.AI_PROVIDER = "gemini";
      process.env.TRANSCRIBE_PROVIDER = "gemini";

      try {
        const response = await request(app)
          .post(`/api/meetings/${meetingId}/process`)
          .set("Cookie", authCookie)
          .expect(403);

        expect(response.body).toHaveProperty("error", "No API key configured");
      } finally {
        // Always restore env values
        process.env.AI_PROVIDER = originalAI;
        process.env.TRANSCRIBE_PROVIDER = originalTranscribe;
      }
    });
  });

  describe("GET /api/meetings/:id", () => {
    let meetingId: number;

    beforeEach(async () => {
      const response = await request(app)
        .post("/api/meetings")
        .set("Cookie", authCookie)
        .send({ title: "Detail Test" });
      meetingId = response.body.item.id;
    });

    it("should get meeting details", async () => {
      const response = await request(app)
        .get(`/api/meetings/${meetingId}`)
        .set("Cookie", authCookie)
        .expect(200);

      expect(response.body).toHaveProperty("item");
      expect(response.body.item.id).toBe(meetingId);
      expect(response.body.item.title).toBe("Detail Test");
    });

    it("should require authentication", async () => {
      await request(app).get(`/api/meetings/${meetingId}`).expect(401);
    });

    it("should fail with invalid meeting ID", async () => {
      await request(app)
        .get("/api/meetings/invalid")
        .set("Cookie", authCookie)
        .expect(400);
    });

    it("should fail with non-existent meeting", async () => {
      await request(app)
        .get("/api/meetings/99999")
        .set("Cookie", authCookie)
        .expect(404);
    });

    it("should parse JSON fields correctly", async () => {
      // Upload and process meeting
      await request(app)
        .post(`/api/meetings/${meetingId}/upload`)
        .set("Cookie", authCookie)
        .attach("audio", testAudioPath);

      await request(app)
        .post(`/api/meetings/${meetingId}/process`)
        .set("Cookie", authCookie);

      const response = await request(app)
        .get(`/api/meetings/${meetingId}`)
        .set("Cookie", authCookie)
        .expect(200);

      expect(Array.isArray(response.body.item.actionItems)).toBe(true);
      expect(Array.isArray(response.body.item.decisions)).toBe(true);
    });

    it("should not allow access to other users' meetings", async () => {
      // Create another user
      const otherUserCookie = await createAuthUser();

      // Try to access first user's meeting
      await request(app)
        .get(`/api/meetings/${meetingId}`)
        .set("Cookie", otherUserCookie)
        .expect(404);
    });
  });
});
