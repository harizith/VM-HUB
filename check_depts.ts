import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const depts = await prisma.studentProfile.groupBy({
    by: ['department'],
    _count: {
      department: true,
    },
  })
  console.log('Departments found in StudentProfile:')
  console.dir(depts, { depth: null })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
