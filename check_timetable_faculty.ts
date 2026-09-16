import { PrismaClient } from '@prisma/client'; 
const prisma = new PrismaClient(); 
async function main() { 
  const entries = await prisma.timetableEntry.findMany({ select: { facultyName: true }, distinct: ['facultyName'] }); 
  console.log(entries); 
} 
main().finally(() => console.log('Done'));
