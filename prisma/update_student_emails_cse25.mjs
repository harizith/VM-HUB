import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function transformEmail(oldEmail) {
  const [username, domain] = oldEmail.split("@");
  return `${username}.cse25@${domain}`;
}

async function updateAllStudentEmailsToCse25() {
  console.log("Updating student emails in UserMode table...");

  const students = await prisma.userMode.findMany({
    where: { usermode: "student" },
  });

  let updatedCount = 0;

  for (const student of students) {
    const oldEmail = student.emailid;
    if (oldEmail.includes(".cse25@")) continue;

    const newEmail = transformEmail(oldEmail);

    // Update UserMode emailid directly
    await prisma.userMode.update({
      where: { vmno: student.vmno },
      data: { emailid: newEmail },
    });

    // Update StudentProfile userEmail if present
    await prisma.studentProfile.updateMany({
      where: { userEmail: oldEmail },
      data: { userEmail: newEmail },
    });

    // Update User email if present
    await prisma.user.updateMany({
      where: { email: oldEmail },
      data: { email: newEmail },
    });

    updatedCount++;
  }

  console.log(`✅ Successfully updated ${updatedCount} student email IDs to username.cse25@veltechmultitech.org!`);
}

updateAllStudentEmailsToCse25()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
