// FILE: server/src/tests/setup.ts
import { prisma } from "../db";

// Force stub providers for all tests. Individual tests that need non-stub
// can temporarily override process.env and restore it in a finally block.
process.env.AI_PROVIDER = "stub";
process.env.TRANSCRIBE_PROVIDER = "stub";

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
