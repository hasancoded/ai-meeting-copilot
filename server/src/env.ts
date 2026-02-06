import dotenv from "dotenv";
import { z } from "zod";

// Load environment-specific .env file
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";

dotenv.config({ path: envFile });

const EnvSchema = z.object({
  PORT: z.string().default("4000"),
  NODE_ENV: z.string().default("development"),
  JWT_SECRET: z.string().min(16),
  DATABASE_URL: z.string(),
  AI_PROVIDER: z.enum(["stub", "openai", "gemini"]).default("stub"),
  OPENAI_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  TRANSCRIBE_PROVIDER: z.enum(["stub", "whisper", "gemini"]).default("stub"),
});

export const env = EnvSchema.parse(process.env);
