import { Router, CookieOptions } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "../db";
import { signJwt } from "../utils/jwt";

export const auth = Router();

// Schemas
const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

/**
 * Returns consistent cookie options for set and clear operations.
 * Cross-origin (Vercel → Railway) requires sameSite=none + secure=true.
 */
function cookieOptions(): CookieOptions {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  };
}

// POST /api/auth/register
auth.post("/register", async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        name: data.name,
      },
    });

    const token = signJwt({ id: user.id, email: user.email });
    res.cookie("token", token, cookieOptions());

    return res.status(200).json({ id: user.id, email: user.email });
  } catch (err: any) {
    console.error("Register error:", err);

    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }

    return res.status(400).json({ error: "Registration failed" });
  }
});

// POST /api/auth/login
auth.post("/login", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signJwt({ id: user.id, email: user.email });
    res.cookie("token", token, cookieOptions());

    return res.status(200).json({
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (err: any) {
    console.error("Login error:", err);

    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors[0].message });
    }

    return res.status(400).json({ error: "Login failed" });
  }
});

// POST /api/auth/logout
auth.post("/logout", (req, res) => {
  // clearCookie must receive the same options as the original Set-Cookie
  // so the browser knows which cookie to invalidate
  res.clearCookie("token", cookieOptions());
  return res.status(200).json({ message: "Logged out" });
});
