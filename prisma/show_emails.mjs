import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function showCurrentStudentEmails() {
  const students = await prisma.userMode.findMany({
    where: { usermode: "student" },
    take: 10,
  });

  console.log(students.map((s) => ({ vmno: s.vmno, emailid: s.emailid })));
}

showCurrentStudentEmails()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
