import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.string().default("4000"),
  NODE_ENV: z.string().default("development"),
  JWT_SECRET: z.string().min(16),
  DATABASE_URL: z.string(),
  AI_PROVIDER: z.enum(["stub", "openai"]).default("stub"),
  OPENAI_API_KEY: z.string().optional(),
  TRANSCRIBE_PROVIDER: z.enum(["stub", "whisper"]).default("stub"),
});

export const env = EnvSchema.parse(process.env);
