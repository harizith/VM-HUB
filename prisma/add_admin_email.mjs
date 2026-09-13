import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function addBothAdminEmails() {
  console.log("Upserting admin accounts in UserMode database table...");

  const passwordHash = await bcrypt.hash("administrator", 10);

  // 1. adminmode@veltechmultitech.org
  await prisma.userMode.upsert({
    where: { vmno: "00000" },
    update: {
      emailid: "adminmode@veltechmultitech.org",
      password: passwordHash,
      usermode: "admin",
    },
    create: {
      vmno: "00000",
      emailid: "adminmode@veltechmultitech.org",
      password: passwordHash,
      usermode: "admin",
    },
  });

  // 2. admin@veltechmultitech.org
  await prisma.userMode.upsert({
    where: { vmno: "00001" },
    update: {
      emailid: "admin@veltechmultitech.org",
      password: passwordHash,
      usermode: "admin",
    },
    create: {
      vmno: "00001",
      emailid: "admin@veltechmultitech.org",
      password: passwordHash,
      usermode: "admin",
    },
  });

  console.log("✅ Successfully created both admin accounts in UserMode table!");
}

addBothAdminEmails()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
