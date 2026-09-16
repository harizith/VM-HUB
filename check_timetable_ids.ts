import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const entries = await prisma.timetableEntry.findMany({ select: { classId: true }, distinct: ['classId'] });
  console.log(entries);
}
main().finally(() => prisma.$disconnect());
