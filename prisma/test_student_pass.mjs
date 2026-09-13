import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function checkRollNumberMatch() {
  const email = "aarthia@veltechmultitech.org";
  const roll = "113125UG03001";
  
  const user = await prisma.userMode.findUnique({ where: { emailid: email } });
  if (user) {
    const isMatch = await bcrypt.compare(roll, user.password);
    console.log(`Email: ${email} | Roll (Pass): ${roll} | Password Match: ${isMatch}`);
  }
}

checkRollNumberMatch()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
