import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateEmailsViaRawSQL() {
  console.log("Updating all student emails in raw SQL in correct FK order...");

  // 1. Update User table first
  await prisma.$executeRawUnsafe(`
    UPDATE "User"
    SET "email" = REPLACE("email", '@veltechmultitech.org', '.cse25@veltechmultitech.org')
    WHERE "email" NOT LIKE '%.cse25@%' AND "role" = 'STUDENT';
  `);

  // 2. Update StudentProfile userEmail (which references User.email)
  await prisma.$executeRawUnsafe(`
    UPDATE "StudentProfile"
    SET "userEmail" = REPLACE("userEmail", '@veltechmultitech.org', '.cse25@veltechmultitech.org')
    WHERE "userEmail" NOT LIKE '%.cse25@%';
  `);

  // 3. Update UserMode table emailid
  const result = await prisma.$executeRawUnsafe(`
    UPDATE "UserMode"
    SET "emailid" = REPLACE("emailid", '@veltechmultitech.org', '.cse25@veltechmultitech.org')
    WHERE "emailid" NOT LIKE '%.cse25@%' AND "usermode" = 'student';
  `);

  console.log("✅ Raw SQL update complete! Rows affected in UserMode:", result);
}

updateEmailsViaRawSQL()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
