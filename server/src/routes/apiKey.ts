import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db";
import { requireAuth } from "../middleware/auth";
import { encrypt, decrypt } from "../utils/encryption";

export const apiKey = Router();

// All routes require authentication
apiKey.use(requireAuth);

const saveKeySchema = z.object({
  key: z.string().min(1, "API key is required"),
  provider: z.enum(["openai", "gemini"], {
    errorMap: () => ({ message: "Provider must be 'openai' or 'gemini'" }),
  }),
  model: z.string().min(1, "Model is required"),
});

/**
 * PUT /api/user/api-key
 * Save or update the authenticated user's encrypted API key, provider, and model.
 * Body: { key: string, provider: "openai" | "gemini", model: string }
 */
apiKey.put("/api-key", async (req, res) => {
  try {
    const userId = (req as any).user.id as number;

    const validation = saveKeySchema.safeParse(req.body);
    if (!validation.success) {
      return res
        .status(400)
        .json({ error: validation.error.errors[0].message });
    }

    const { key, provider, model } = validation.data;

    // Encrypt before storing — raw key is immediately discarded
    const apiKeyEncrypted = encrypt(key);

    await prisma.user.update({
      where: { id: userId },
      data: { apiKeyEncrypted, apiKeyProvider: provider, apiKeyModel: model },
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error saving API key:", err);
    return res.status(500).json({ error: "Failed to save API key" });
  }
});

/**
 * DELETE /api/user/api-key
 * Remove the stored API key for the authenticated user.
 */
apiKey.delete("/api-key", async (req, res) => {
  try {
    const userId = (req as any).user.id as number;

    await prisma.user.update({
      where: { id: userId },
      data: { apiKeyEncrypted: null, apiKeyProvider: null, apiKeyModel: null },
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error removing API key:", err);
    return res.status(500).json({ error: "Failed to remove API key" });
  }
});

/**
 * GET /api/user/api-key/status
 * Returns whether the user has a saved API key, which provider, and which model.
 * Never returns the actual key value.
 */
apiKey.get("/api-key/status", async (req, res) => {
  try {
    const userId = (req as any).user.id as number;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        apiKeyEncrypted: true,
        apiKeyProvider: true,
        apiKeyModel: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      saved: !!user.apiKeyEncrypted,
      provider: user.apiKeyProvider ?? null,
      model: user.apiKeyModel ?? null,
    });
  } catch (err) {
    console.error("Error fetching API key status:", err);
    return res.status(500).json({ error: "Failed to fetch API key status" });
  }
});

/**
 * Internal helper used by the meetings route.
 * Retrieves and decrypts the user's stored API key, provider, and model.
 * Returns null if no key is saved.
 * NOTE: The decrypted key must never be logged or returned to the client.
 */
export async function getUserApiKey(
  userId: number,
): Promise<{ key: string; provider: string; model: string } | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { apiKeyEncrypted: true, apiKeyProvider: true, apiKeyModel: true },
  });

  if (!user || !user.apiKeyEncrypted || !user.apiKeyProvider) {
    return null;
  }

  const key = decrypt(user.apiKeyEncrypted);
  return {
    key,
    provider: user.apiKeyProvider,
    model: user.apiKeyModel ?? getDefaultModel(user.apiKeyProvider),
  };
}

/** Fallback model names for users who saved a key before model selection was added. */
function getDefaultModel(provider: string): string {
  return provider === "gemini" ? "models/gemini-2.5-flash" : "gpt-4o-mini";
}
