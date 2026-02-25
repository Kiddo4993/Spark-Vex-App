import { PrismaClient } from '@prisma/client'
import pkg from 'bcryptjs'
const { hash } = pkg
const prisma = new PrismaClient()
async function main() {
    let team = await prisma.team.findFirst();
    if (!team) {
        team = await prisma.team.create({
            data: {
                teamNumber: "9999Z",
            }
        });
    }
    const hashedPassword = await hash("password", 10);
    const user = await prisma.user.create({
        data: {
            email: "test@example.com",
            password: hashedPassword,
            teamId: team.id,
        }
    });
    console.log("Created user:", user.email)
}
main()
