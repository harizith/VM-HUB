import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.$executeRaw`UPDATE "StudentProfile" SET department = REPLACE(department, 'CSE', 'B.E CSE') WHERE department LIKE '%CSE%' AND department NOT LIKE '%B.E CSE%';`
  
  console.log(`Updated ${result} students via raw SQL.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
