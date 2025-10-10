// FILE: server/src/tests/setup.ts
import { prisma } from "../db";

// Clean up database before each test
beforeEach(async () => {
  // Delete in correct order due to foreign key constraints
  await prisma.meeting.deleteMany();
  await prisma.user.deleteMany();
});

// Close database connection after all tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Commit message: test(setup): add database cleanup for tests
// PR title: test: Add test setup with database cleanup
// Notes: Ensures clean database state before each test. Properly disconnects Prisma client after test suite completes.

// Commit message: fix(tests): ensure proper cleanup order for foreign keys
// PR title: fix: Delete meetings before users in test cleanup
// Notes: Ensures meetings are deleted before users to avoid foreign key constraint violations.
