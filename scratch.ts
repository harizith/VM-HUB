import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  console.log('Timetable:', await prisma.timetableEntry.findFirst());
  console.log('Student:', await prisma.studentProfile.findFirst());
}
main().catch(console.error).finally(() => prisma.$disconnect());
