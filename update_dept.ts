import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const students = await prisma.studentProfile.findMany({
    where: {
      department: {
        contains: 'CSE',
      }
    }
  })

  let count = 0;
  for (const student of students) {
    if (!student.department.includes('B.E CSE')) {
      const newDept = student.department.replace('CSE', 'B.E CSE');
      await prisma.studentProfile.update({
        where: { userEmail: student.userEmail },
        data: { department: newDept }
      });
      count++;
    }
  }

  console.log(`Updated ${count} students.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
