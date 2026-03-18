import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true }
  })
  
  console.log('\n=== USUARIOS ===\n')
  console.table(users)
  console.log('\nTotal:', users.length, 'usuarios\n')
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect())
