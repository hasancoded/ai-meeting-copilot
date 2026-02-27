import { AIProvider, AIOutputs } from "./provider";
import { env } from "../../env";
import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiProvider implements AIProvider {
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
        "No Gemini API key provided. Set AI_PROVIDER=stub for development.",
      );
    }
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async summarizeAndExtract({
    transcript,
    title,
  }: {
    transcript: string;
    title?: string;
  }): Promise<AIOutputs> {
    if (!this.apiKey) {
      throw new Error(
        "GEMINI_API_KEY is required for AI summarization. Set AI_PROVIDER=stub to use development mode.",
      );
    }

    const prompt = `You are a Meeting Analyst. Given the transcript below, produce a JSON response with:
1) A concise executive summary (<= 120 words)
2) Action items as an array of objects with {owner?, task, due?}
3) Decisions as an array of strings

Return ONLY valid JSON in this exact format:
{
  "summary": "...",
  "actionItems": [{"owner": "John", "task": "Review document", "due": "Tomorrow"}],
  "decisions": ["Approved budget", "Postponed feature X"]
}

Meeting Title: ${title || "Meeting"}
Transcript: ${transcript}`;

    let lastError: Error | null = null;

    // Retry loop for transient failures
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const model = this.genAI.getGenerativeModel({
          model: this.model,
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2000,
            responseMimeType: "application/json",
          },
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        if (!text) {
          throw new Error("No content received from Gemini");
        }

        // Parse and validate JSON response
        try {
          const parsed = JSON.parse(text) as AIOutputs;

          // Validate structure
          if (!parsed.summary || typeof parsed.summary !== "string") {
            throw new Error("Invalid summary in response");
          }
          if (!Array.isArray(parsed.actionItems)) {
            throw new Error("Invalid actionItems in response");
          }
          if (!Array.isArray(parsed.decisions)) {
            throw new Error("Invalid decisions in response");
          }

          return parsed;
        } catch (parseError: any) {
          console.error("Failed to parse Gemini response:", text);

          // Fallback: create structured response from unstructured content
          return {
            summary: text.slice(0, 200) + "...",
            actionItems: [],
            decisions: [],
          };
        }
      } catch (error: any) {
        lastError = error;

        // Handle specific error cases
        if (error.message?.includes("API key")) {
          throw new Error("Invalid Gemini API key");
        }

        // Don't retry on validation errors
        if (error.message?.includes("Invalid")) {
          throw error;
        }

        // Check for rate limiting
        if (
          error.message?.includes("429") ||
          error.message?.includes("quota") ||
          error.message?.includes("rate limit")
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
        if (error.message?.includes("500") || error.message?.includes("503")) {
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
            `AI request failed (attempt ${attempt}/${this.maxRetries}): ${error.message}`,
          );
          await this.sleep(this.retryDelay * attempt);
        }
      }
    }

    // All retries exhausted
    throw lastError || new Error("Failed to get AI response after retries");
  }
}
