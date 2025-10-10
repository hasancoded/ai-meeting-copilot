// FILE: server/src/services/transcription/whisper.ts
import { TranscriptionProvider } from "./provider";
import { env } from "../../env";
import fs from "fs";
import FormData from "form-data";

export class WhisperTranscriber implements TranscriptionProvider {
  private apiKey: string;
  private apiUrl = "https://api.openai.com/v1/audio/transcriptions";

  constructor() {
    if (!env.OPENAI_API_KEY) {
      console.warn(
        "OPENAI_API_KEY not set. Whisper transcription will fail. Set TRANSCRIBE_PROVIDER=stub for development."
      );
    }
    this.apiKey = env.OPENAI_API_KEY || "";
  }

  async transcribe({
    filePath,
  }: {
    filePath: string;
  }): Promise<{ text: string }> {
    if (!this.apiKey) {
      throw new Error(
        "OPENAI_API_KEY is required for Whisper transcription. Set TRANSCRIBE_PROVIDER=stub to use development mode."
      );
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`Audio file not found: ${filePath}`);
    }

    try {
      // Create form data with audio file
      const form = new FormData();
      form.append("file", fs.createReadStream(filePath));
      form.append("model", "whisper-1");
      form.append("language", "en"); // Can be made configurable
      form.append("response_format", "json");

      // Make API request
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          ...form.getHeaders(),
        },
        body: form as any,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Whisper API error:", errorText);

        // Handle specific error cases
        if (response.status === 401) {
          throw new Error("Invalid OpenAI API key");
        } else if (response.status === 413) {
          throw new Error(
            "Audio file too large. Maximum size is 25MB for Whisper API."
          );
        } else if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }

        throw new Error(
          `Whisper API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.text) {
        throw new Error("No transcription text returned from Whisper API");
      }

      return { text: data.text };
    } catch (error: any) {
      // Re-throw with context if not already a structured error
      if (
        error.message?.includes("Whisper") ||
        error.message?.includes("OpenAI")
      ) {
        throw error;
      }

      console.error("Unexpected error during transcription:", error);
      throw new Error(
        `Failed to transcribe audio: ${error.message || "Unknown error"}`
      );
    }
  }
}

// Commit message: feat(transcription): implement Whisper API integration
// PR title: feat: Add OpenAI Whisper transcription with error handling
// Notes: Implements real Whisper API calls using FormData to upload audio files. Handles API errors (401, 413, 429), validates file existence, and provides helpful error messages. Falls back gracefully when OPENAI_API_KEY is missing. Requires 'form-data' package to be installed.
