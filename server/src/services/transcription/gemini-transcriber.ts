import { TranscriptionProvider } from "./provider";
import { env } from "../../env";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

export class GeminiTranscriber implements TranscriptionProvider {
  private apiKey: string;
  private model: string;
  private genAI: GoogleGenerativeAI;
  private maxRetries = 3;
  private retryDelay = 1000; // milliseconds

  /**
   * @param apiKey - The user's decrypted API key.
   * @param model  - The model name selected by the user (e.g. "models/gemini-2.5-flash").
   */
  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey ?? env.GEMINI_API_KEY ?? "";
    this.model = model ?? "models/gemini-2.5-flash";
    if (!this.apiKey) {
      console.warn(
        "No Gemini API key provided. Set TRANSCRIBE_PROVIDER=stub for development.",
      );
    }
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".m4a": "audio/mp4",
      ".mp4": "video/mp4",
      ".webm": "audio/webm",
      ".mpeg": "video/mpeg",
    };
    return mimeTypes[ext] || "audio/mpeg";
  }

  private fileToGenerativePart(filePath: string, mimeType: string) {
    return {
      inlineData: {
        data: fs.readFileSync(filePath).toString("base64"),
        mimeType,
      },
    };
  }

  async transcribe({
    filePath,
  }: {
    filePath: string;
  }): Promise<{ text: string }> {
    if (!this.apiKey) {
      throw new Error(
        "GEMINI_API_KEY is required for Gemini transcription. Set TRANSCRIBE_PROVIDER=stub to use development mode.",
      );
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`Audio file not found: ${filePath}`);
    }

    let lastError: Error | null = null;

    try {
      const mimeType = this.getMimeType(filePath);
      const audioPart = this.fileToGenerativePart(filePath, mimeType);

      // Retry loop for transient failures
      for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
        try {
          const model = this.genAI.getGenerativeModel({
            model: this.model,
          });

          const result = await model.generateContent([
            audioPart,
            {
              text: "Please transcribe this audio/video file. Provide only the transcription text without any additional commentary or formatting.",
            },
          ]);

          const response = result.response;
          const text = response.text();

          if (!text || text.trim().length === 0) {
            throw new Error("No transcription text returned from Gemini");
          }

          return { text: text.trim() };
        } catch (error: any) {
          lastError = error;

          // Handle specific error cases
          if (
            error.message?.includes("API key") ||
            error.message?.includes("API_KEY_INVALID")
          ) {
            throw new Error("Invalid Gemini API key");
          }

          // Check for rate limiting
          if (
            error.message?.includes("429") ||
            error.message?.includes("quota") ||
            error.message?.includes("rate limit") ||
            error.message?.includes("RATE_LIMIT_EXCEEDED")
          ) {
            if (attempt < this.maxRetries) {
              console.warn(
                `Rate limited by Gemini (attempt ${attempt}/${this.maxRetries}). Retrying...`,
              );
              await this.sleep(this.retryDelay * attempt);
              continue;
            }
            throw new Error("Rate limit exceeded. Please try again later.");
          }

          // Check for server errors
          if (
            error.message?.includes("500") ||
            error.message?.includes("503") ||
            error.message?.includes("INTERNAL")
          ) {
            if (attempt < this.maxRetries) {
              console.warn(
                `Gemini server error (attempt ${attempt}/${this.maxRetries}). Retrying...`,
              );
              await this.sleep(this.retryDelay * attempt);
              continue;
            }
            throw new Error("Gemini service temporarily unavailable");
          }

          // Retry on network/transient errors
          if (attempt < this.maxRetries) {
            console.warn(
              `Transcription request failed (attempt ${attempt}/${this.maxRetries}): ${error.message}`,
            );
            await this.sleep(this.retryDelay * attempt);
          }
        }
      }

      // All retries exhausted
      throw lastError || new Error("Failed to transcribe audio after retries");
    } catch (error: any) {
      // Re-throw with context if not already a structured error
      if (
        error.message?.includes("Gemini") ||
        error.message?.includes("API key")
      ) {
        throw error;
      }

      console.error("Unexpected error during transcription:", error);
      throw new Error(
        `Failed to transcribe audio: ${error.message || "Unknown error"}`,
      );
    }
  }
}
