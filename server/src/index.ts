import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { env } from "./env";
import { auth } from "./routes/auth";
import { meetings } from "./routes/meetings";
import { health } from "./routes/health";
import { apiKey } from "./routes/apiKey";

const app = express();

// CORS — support comma-separated list of allowed origins
// e.g. FRONTEND_URL=https://app.vercel.app,http://localhost:5173
const allowedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve uploaded audio files at /uploads/<filename>
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "server", "uploads")),
);

// API routes
app.use("/api/health", health);
app.use("/api/auth", auth);
app.use("/api/meetings", meetings);
app.use("/api/user", apiKey);

// Root info endpoint
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use(
  (
    error: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", error);
    res.status(500).json({ error: "Internal server error" });
  },
);

const port = Number(env.PORT);
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
  console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
  console.log(`AI Provider: ${env.AI_PROVIDER}`);
  console.log(`Transcription Provider: ${env.TRANSCRIBE_PROVIDER}`);
});
