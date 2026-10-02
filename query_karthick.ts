import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const timetable = await prisma.timetableEntry.findMany({
    where: {
      facultyName: {
        contains: "Karthick",
        mode: "insensitive"
      }
    },
    select: { facultyName: true },
    distinct: ['facultyName']
  });
  console.log(timetable);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
