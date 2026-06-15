import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const bootstrapEnabled = process.env.BOOTSTRAP_DEFAULT_ADMIN !== "false"
const defaultAdminEmail =
  process.env.DEFAULT_ADMIN_EMAIL || "admin@dlaenvios.com"
const defaultAdminPassword =
  process.env.DEFAULT_ADMIN_PASSWORD || "Wd0z*666"
const defaultAdminName = process.env.DEFAULT_ADMIN_NAME || "Admin"

async function main() {
  if (!bootstrapEnabled) {
    console.log("Default admin bootstrap disabled")
    return
  }

  let adminsCount

  try {
    adminsCount = await prisma.user.count({
      where: { role: "ADMIN" },
    })
  } catch (error) {
    if (error?.code === "P2021" && error?.meta?.table === 'public.User') {
      console.warn(
        'User table is missing in the current database. Skipping default admin bootstrap.'
      )
      return
    }

    throw error
  }

  if (adminsCount > 0) {
    console.log("Admin user already exists, skipping bootstrap")
    return
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: defaultAdminEmail },
  })

  if (existingUser) {
    console.warn(
      `User ${defaultAdminEmail} already exists but is not an admin. Skipping automatic admin creation.`
    )
    return
  }

  const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10)

  await prisma.user.create({
    data: {
      email: defaultAdminEmail,
      password: hashedPassword,
      name: defaultAdminName,
      role: "ADMIN",
      isActive: true,
    },
  })

  console.log(`Default admin created: ${defaultAdminEmail}`)
}

main()
  .catch((error) => {
    console.error("Default admin bootstrap failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
