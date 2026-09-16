import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.$executeRawUnsafe(`UPDATE "StudentProfile" SET department = REPLACE(department, 'B.E CSE', 'CSE') WHERE department LIKE '%B.E CSE%'`);
  const entries = await prisma.studentProfile.findMany({ select: { department: true }, distinct: ['department'] });
  console.log(entries);
}
main().finally(() => prisma.$disconnect());
