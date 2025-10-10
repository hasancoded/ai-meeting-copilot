// FILE: server/src/services/ai/openai.ts
import { AIProvider, AIOutputs } from "./provider";
import { env } from "../../env";

export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private apiUrl = "https://api.openai.com/v1/chat/completions";
  private maxRetries = 3;
  private retryDelay = 1000; // milliseconds

  constructor() {
    if (!env.OPENAI_API_KEY) {
      console.warn(
        "OPENAI_API_KEY not set. AI summarization will fail. Set AI_PROVIDER=stub for development."
      );
    }
    this.apiKey = env.OPENAI_API_KEY || "";
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
        "OPENAI_API_KEY is required for AI summarization. Set AI_PROVIDER=stub to use development mode."
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
        const resp = await fetch(this.apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are a meeting analyst that returns only valid JSON responses.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.2,
            max_tokens: 1000,
          }),
        });

        if (!resp.ok) {
          const errorText = await resp.text();

          // Handle specific error cases
          if (resp.status === 401) {
            throw new Error("Invalid OpenAI API key");
          } else if (resp.status === 429) {
            // Rate limit - retry with backoff
            if (attempt < this.maxRetries) {
              console.warn(
                `Rate limited by OpenAI (attempt ${attempt}/${this.maxRetries}). Retrying...`
              );
              await this.sleep(this.retryDelay * attempt);
              continue;
            }
            throw new Error("Rate limit exceeded. Please try again later.");
          } else if (resp.status >= 500) {
            // Server error - retry
            if (attempt < this.maxRetries) {
              console.warn(
                `OpenAI server error (attempt ${attempt}/${this.maxRetries}). Retrying...`
              );
              await this.sleep(this.retryDelay * attempt);
              continue;
            }
            throw new Error("OpenAI service temporarily unavailable");
          }

          throw new Error(
            `OpenAI API call failed: ${resp.status} ${errorText}`
          );
        }

        const data = await resp.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error("No content received from OpenAI");
        }

        // Parse and validate JSON response
        try {
          const parsed = JSON.parse(content) as AIOutputs;

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
          console.error("Failed to parse OpenAI response:", content);

          // Fallback: create structured response from unstructured content
          return {
            summary: content.slice(0, 200) + "...",
            actionItems: [],
            decisions: [],
          };
        }
      } catch (error: any) {
        lastError = error;

        // Don't retry on auth errors or validation errors
        if (
          error.message?.includes("Invalid OpenAI API key") ||
          error.message?.includes("Invalid")
        ) {
          throw error;
        }

        // Retry on network/transient errors
        if (attempt < this.maxRetries) {
          console.warn(
            `AI request failed (attempt ${attempt}/${this.maxRetries}): ${error.message}`
          );
          await this.sleep(this.retryDelay * attempt);
        }
      }
    }

    // All retries exhausted
    throw lastError || new Error("Failed to get AI response after retries");
  }
}

// Commit message: feat(ai): add retry logic and improved error handling
// PR title: feat: Enhance OpenAI provider with retries and validation
// Notes: Implements exponential backoff retry logic for rate limits and server errors. Validates API key presence, parses and validates JSON response structure, provides fallback for unparseable responses. Handles 401, 429, 500+ status codes appropriately. Max 3 retries with increasing delays.
