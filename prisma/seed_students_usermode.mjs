import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs";

const prisma = new PrismaClient();

async function seedStudentsToUserMode() {
  console.log("Seeding student accounts into UserMode & User tables...");

  const students = JSON.parse(fs.readFileSync("prisma/pdf_students.json", "utf-8"));
  console.log(`Processing ${students.length} students...`);

  let count = 0;
  for (const s of students) {
    const cleanName = s.name.trim();
    const email = `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, "")}@veltechmultitech.org`;
    const regNoPassword = s.regNo.trim(); // password is REG NO
    const hashedPassword = await bcrypt.hash(regNoPassword, 10);

    try {
      // 1. Insert into UserMode table
      await prisma.userMode.upsert({
        where: { vmno: s.vmNo },
        update: {
          emailid: email,
          password: hashedPassword,
          usermode: "student",
        },
        create: {
          vmno: s.vmNo,
          emailid: email,
          password: hashedPassword,
          usermode: "student",
        },
      });

      // 2. Insert into User & StudentProfile tables for portal functionality
      const user = await prisma.user.upsert({
        where: { email: email },
        update: {
          vmNo: s.vmNo,
          name: cleanName,
          password: hashedPassword,
          role: "STUDENT",
        },
        create: {
          vmNo: s.vmNo,
          email: email,
          name: cleanName,
          password: hashedPassword,
          role: "STUDENT",
          status: "ACTIVE",
        },
      });

      await prisma.studentProfile.upsert({
        where: { userEmail: email },
        update: {
          rollNumber: s.regNo,
          department: `CSE (Sec ${s.sec})`,
        },
        create: {
          userEmail: email,
          rollNumber: s.regNo,
          department: `CSE (Sec ${s.sec})`,
          semester: 3,
          batch: "2025-2029",
        },
      });

      count++;
    } catch (err) {
      console.error(`Error for ${s.name} (VM ${s.vmNo}):`, err.message);
    }
  }

  console.log(`✅ SUCCESSFULLY SEEDED ALL ${count} STUDENTS INTO UserMode & User TABLES!`);

  // Verify HARIZITH record
  const harizUserMode = await prisma.userMode.findFirst({
    where: { usermode: "student", emailid: { contains: "harizith" } },
  });
  console.log("Verified HARIZITH in UserMode:", harizUserMode);
}

seedStudentsToUserMode()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
