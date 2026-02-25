import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const teamNumber = "1421A".toUpperCase()
    const email = "testsignup@example.com"
    const password = "password"

    // 1. Simulate an import creating the team first without a user
    let existingTeam = await prisma.team.findUnique({ where: { teamNumber } })
    if (!existingTeam) {
        existingTeam = await prisma.team.create({
            data: {
                teamNumber,
            }
        })
        console.log("Mock import created team:", existingTeam.id)
    }

    // 2. Now run the signup logic exactly as the route does
    console.log("Looking up team during signup:", teamNumber)
    const finalExistingTeam = await prisma.team.findUnique({ where: { teamNumber } })
    console.log("Found team:", !!finalExistingTeam, finalExistingTeam?.id)

    if (finalExistingTeam) {
        const hasUser = await prisma.user.findUnique({ where: { teamId: finalExistingTeam.id } })
        console.log("Has user:", !!hasUser)
        if (hasUser) return console.log("Team has user, blocking")
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } })
    console.log("Has email:", !!existingEmail)
    if (existingEmail) return console.log("Email taken")

    console.log("Creating/linking team...")
    try {
        const team = finalExistingTeam ?? await prisma.team.create({
            data: {
                teamNumber,
            },
        })
        console.log("Team ID for user:", team.id)

        const user = await prisma.user.create({
            data: {
                email,
                password,
                teamId: team.id,
            },
        })
        console.log("Success! Linked User:", user.id)

        // Cleanup
        await prisma.user.delete({ where: { id: user.id } })
        await prisma.team.delete({ where: { id: team.id } })
    } catch (e: any) {
        console.error("Failed!", e)
    }
}

main().catch(console.error).finally(() => prisma.$disconnect())
