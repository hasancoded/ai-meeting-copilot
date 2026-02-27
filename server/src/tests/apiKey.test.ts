import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { auth } from "../routes/auth";
import { apiKey } from "../routes/apiKey";
import { prisma } from "../db";
import "./setup";

// Create test app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", auth);
app.use("/api/user", apiKey);

// Helper: register a user and return the auth cookie
async function createAuthUser(): Promise<string> {
  const response = await request(app)
    .post("/api/auth/register")
    .send({
      email: `test-${Date.now()}@example.com`,
      password: "password123",
      name: "Test User",
    });

  const cookies = response.headers["set-cookie"];
  const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
  return cookieArray.find((c: string) => c.startsWith("token=")) || "";
}

describe("API Key Routes", () => {
  let authCookie: string;

  beforeEach(async () => {
    authCookie = await createAuthUser();
  });

  // ─────────────────────────────────────────
  // GET /api/user/api-key/status
  // ─────────────────────────────────────────
  describe("GET /api/user/api-key/status", () => {
    it("should return saved:false for a fresh user", async () => {
      const response = await request(app)
        .get("/api/user/api-key/status")
        .set("Cookie", authCookie)
        .expect(200);

      expect(response.body).toHaveProperty("saved", false);
      expect(response.body).toHaveProperty("provider", null);
    });

    it("should require authentication", async () => {
      await request(app).get("/api/user/api-key/status").expect(401);
    });

    it("should return saved:true after saving a key", async () => {
      await request(app)
        .put("/api/user/api-key")
        .set("Cookie", authCookie)
        .send({
          key: "test-api-key-abc123",
          provider: "gemini",
          model: "models/gemini-2.5-flash",
        })
        .expect(200);

      const response = await request(app)
        .get("/api/user/api-key/status")
        .set("Cookie", authCookie)
        .expect(200);

      expect(response.body).toHaveProperty("saved", true);
      expect(response.body).toHaveProperty("provider", "gemini");
      expect(response.body).toHaveProperty("model", "models/gemini-2.5-flash");
      // CRITICAL: the raw key must never be in the response
      expect(response.body).not.toHaveProperty("key");
      expect(JSON.stringify(response.body)).not.toContain(
        "test-api-key-abc123",
      );
    });
  });

  // ─────────────────────────────────────────
  // PUT /api/user/api-key
  // ─────────────────────────────────────────
  describe("PUT /api/user/api-key", () => {
    it("should save a key successfully", async () => {
      const response = await request(app)
        .put("/api/user/api-key")
        .set("Cookie", authCookie)
        .send({
          key: "my-gemini-key-xyz",
          provider: "gemini",
          model: "models/gemini-2.5-flash",
        })
        .expect(200);

      expect(response.body).toHaveProperty("ok", true);

      // Verify it was actually encrypted in the DB (not stored plaintext)
      const users = await prisma.user.findMany({
        select: { apiKeyEncrypted: true },
      });
      const savedEncrypted = users[0]?.apiKeyEncrypted;
      expect(savedEncrypted).toBeTruthy();
      expect(savedEncrypted).not.toContain("my-gemini-key-xyz");
    });

    it("should require authentication", async () => {
      await request(app)
        .put("/api/user/api-key")
        .send({ key: "some-key", provider: "gemini" })
        .expect(401);
    });

    it("should reject an invalid provider", async () => {
      const response = await request(app)
        .put("/api/user/api-key")
        .set("Cookie", authCookie)
        .send({ key: "some-key", provider: "unknownprovider" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should reject an empty key", async () => {
      const response = await request(app)
        .put("/api/user/api-key")
        .set("Cookie", authCookie)
        .send({ key: "", provider: "gemini" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should allow overwriting an existing key", async () => {
      // Save first key
      await request(app)
        .put("/api/user/api-key")
        .set("Cookie", authCookie)
        .send({
          key: "first-key",
          provider: "gemini",
          model: "models/gemini-2.5-flash",
        });

      // Overwrite with second key
      const response = await request(app)
        .put("/api/user/api-key")
        .set("Cookie", authCookie)
        .send({ key: "second-key", provider: "openai", model: "gpt-4o-mini" })
        .expect(200);

      expect(response.body.ok).toBe(true);

      const statusResponse = await request(app)
        .get("/api/user/api-key/status")
        .set("Cookie", authCookie);

      expect(statusResponse.body.provider).toBe("openai");
    });
  });

  // ─────────────────────────────────────────
  // DELETE /api/user/api-key
  // ─────────────────────────────────────────
  describe("DELETE /api/user/api-key", () => {
    it("should remove the stored key", async () => {
      // First save a key
      await request(app)
        .put("/api/user/api-key")
        .set("Cookie", authCookie)
        .send({
          key: "key-to-delete",
          provider: "gemini",
          model: "models/gemini-2.5-flash",
        });

      // Verify it's saved
      const beforeDelete = await request(app)
        .get("/api/user/api-key/status")
        .set("Cookie", authCookie);
      expect(beforeDelete.body.saved).toBe(true);

      // Delete it
      const deleteResponse = await request(app)
        .delete("/api/user/api-key")
        .set("Cookie", authCookie)
        .expect(200);
      expect(deleteResponse.body.ok).toBe(true);

      // Verify it's gone
      const afterDelete = await request(app)
        .get("/api/user/api-key/status")
        .set("Cookie", authCookie);
      expect(afterDelete.body.saved).toBe(false);
      expect(afterDelete.body.provider).toBeNull();
    });

    it("should require authentication", async () => {
      await request(app).delete("/api/user/api-key").expect(401);
    });

    it("should succeed even if no key was saved", async () => {
      // Deleting when nothing is stored should still return 200
      await request(app)
        .delete("/api/user/api-key")
        .set("Cookie", authCookie)
        .expect(200);
    });
  });
});
