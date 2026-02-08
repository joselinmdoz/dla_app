import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Wd0z*666', 10)
  
  const user = await prisma.user.create({
    data: {
      email: 'admin@dlaenvios.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN'
    }
  })
  
  console.log('✅ Usuario creado exitosamente!')
  console.log('Email:', user.email)
  console.log('Rol:', user.role)
}

main()
  .catch((e) => console.error('❌ Error:', e.message))
  .finally(() => prisma.$disconnect())
