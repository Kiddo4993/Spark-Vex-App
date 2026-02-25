import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createAdmin() {
    const adminEmail = "admin@sparkvex.com";
    const adminPassword = "admin123";
    const adminTeamNumber = "ADMIN";

    // Check if admin team exists
    let team = await prisma.team.findUnique({ where: { teamNumber: adminTeamNumber } });
    if (!team) {
        team = await prisma.team.create({
            data: {
                teamNumber: adminTeamNumber,
            },
        });
        console.log("Created admin team:", adminTeamNumber);
    }

    // Check if admin user exists
    const existingUser = await prisma.user.findFirst({ where: { teamId: team.id } });
    if (existingUser) {
        // Update to admin
        await prisma.user.update({
            where: { id: existingUser.id },
            data: { isAdmin: true, email: adminEmail },
        });
        console.log("Updated existing user to admin");
    } else {
        const hashedPassword = await hash(adminPassword, 12);
        await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                teamId: team.id,
                isAdmin: true,
            },
        });
        console.log("Created admin user");
    }

    console.log("\n=== ADMIN CREDENTIALS ===");
    console.log("Email:    ", adminEmail);
    console.log("Password: ", adminPassword);
    console.log("Team:     ", adminTeamNumber);
    console.log("========================\n");
    console.log("You can log in with either the email or team number.");

    await prisma.$disconnect();
}

createAdmin().catch(console.error);
