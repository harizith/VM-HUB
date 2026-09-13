import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fetchSampleStudent() {
  const student = await prisma.userMode.findFirst({
    where: { usermode: "student" },
  });
  console.log("SAMPLE_STUDENT:", JSON.stringify(student, null, 2));
}

fetchSampleStudent()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
