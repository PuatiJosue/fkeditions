import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('fkeditions2024', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'editionsfk@gmail.com' },
    update: {},
    create: {
      email: 'editionsfk@gmail.com',
      password: hash,
      name: 'Fortune Khonde',
      role: 'ADMIN',
    },
  })

  console.log('✅ Compte admin créé :', admin.email)
  console.log('   Email    : editionsfk@gmail.com')
  console.log('   Password : fkeditions2024')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
