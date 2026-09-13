import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function testPassword() {
  const admin = await prisma.userMode.findUnique({
    where: { emailid: "admin@veltechmultitech.org" }
  });

  console.log("DB Record for admin@veltechmultitech.org:", admin);

  if (admin) {
    const match = await bcrypt.compare("administrator", admin.password);
    console.log("Password match result for 'administrator':", match);
  }
}

testPassword().finally(() => prisma.$disconnect());
