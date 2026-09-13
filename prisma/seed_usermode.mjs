import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdminEntry() {
  console.log("Creating first entry in UserMode table...");

  const passwordHash = await bcrypt.hash("administrator", 10);

  const entry = await prisma.userMode.upsert({
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

  console.log("✅ Successfully created UserMode admin entry:", entry);
}

createAdminEntry()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
