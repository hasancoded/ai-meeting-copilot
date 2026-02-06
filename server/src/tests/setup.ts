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
