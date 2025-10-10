// FILE: server/src/tests/auth.test.ts
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { auth } from "../routes/auth";
import { prisma } from "../db";
import "./setup";

// Create test app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", auth);

describe("Authentication Routes", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@example.com",
          password: "password123",
          name: "Test User",
        })
        .expect(200);

      expect(response.body).toHaveProperty("id");
      expect(response.body.email).toBe("test@example.com");
      expect(response.headers["set-cookie"]).toBeDefined();

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: "test@example.com" },
      });
      expect(user).toBeTruthy();
      expect(user?.name).toBe("Test User");
    });

    it("should fail with duplicate email", async () => {
      // Create user first
      await request(app).post("/api/auth/register").send({
        email: "duplicate@example.com",
        password: "password123",
      });

      // Try to register again with same email
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "duplicate@example.com",
          password: "different123",
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("already in use");
    });

    it("should fail with invalid email format", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "not-an-email",
          password: "password123",
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should fail with short password", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@example.com",
          password: "12345", // Less than 6 characters
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should fail with missing fields", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({
          email: "test@example.com",
          // Missing password
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Create a test user for each login test
      await request(app).post("/api/auth/register").send({
        email: "login@example.com",
        password: "password123",
        name: "Login Test",
      });
    });

    it("should login successfully with correct credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "login@example.com",
          password: "password123",
        })
        .expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe("login@example.com");
      expect(response.headers["set-cookie"]).toBeDefined();

      // Verify JWT cookie is set
      const cookies = response.headers["set-cookie"];
      const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
      expect(cookieArray.some((cookie) => cookie.startsWith("token="))).toBe(
        true
      );
    });

    it("should fail with wrong password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "login@example.com",
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Invalid credentials");
    });

    it("should fail with non-existent user", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "password123",
        })
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Invalid credentials");
    });

    it("should fail with invalid email format", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "not-an-email",
          password: "password123",
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should set httpOnly cookie", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "login@example.com",
          password: "password123",
        })
        .expect(200);

      const cookies = response.headers["set-cookie"];
      const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
      const tokenCookie = cookieArray.find((cookie) =>
        cookie.startsWith("token=")
      );
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie).toContain("HttpOnly");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should clear authentication cookie", async () => {
      const response = await request(app).post("/api/auth/logout").expect(200);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("Logged out");

      // Verify cookie is cleared
      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
      const tokenCookie = cookieArray.find((cookie) =>
        cookie.startsWith("token=")
      );
      expect(tokenCookie).toBeDefined();
      // Cookie should be expired or empty
      expect(
        tokenCookie?.includes("token=;") || tokenCookie?.includes("Max-Age=0")
      ).toBe(true);
    });
  });
});

// Commit message: test(auth): add comprehensive auth route tests
// PR title: test: Add authentication tests with coverage
// Notes: Tests register (success, duplicate email, validation), login (success, wrong password, non-existent user), and logout. Verifies JWT cookies are set correctly with httpOnly flag. Uses supertest for HTTP assertions.

// Commit message: fix(tests): correct cookie header type handling in auth tests
// PR title: fix: Handle set-cookie header type correctly in tests
//Notes: Fixed type conversion error by properly checking if set-cookie is array before casting. Supertest returns set-cookie as string | string[] depending on Express version, so we normalize it to array.

// Commit message: fix(tests): use beforeAll for login test user creation
// PR title: fix: Prevent database cleanup from interfering with login tests
// Notes: Changed from beforeEach to beforeAll in login tests to create user once before all tests in that suite. This prevents the global beforeEach cleanup from deleting the user before login tests run.

// Commit message: fix(tests): revert to beforeEach for login test user
// PR title: fix: Create login user in beforeEach to work with global cleanup
// Notes: Reverted back to beforeEach for creating login test user. This works with the global beforeEach cleanup that runs before each test.
