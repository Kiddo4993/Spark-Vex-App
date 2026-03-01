import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

function generatePassword(length = 6): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
    if (!currentUser?.isAdmin) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const teams = await prisma.team.findMany({
        include: { user: true },
        orderBy: { teamNumber: "asc" },
    });

    const credentials = [];

    for (const t of teams) {
        if (t.user && t.user.isAdmin) continue; // Skip admins

        let hasAccount = !!t.user;
        let password = t.generatedPassword || "—";


        if (!t.user) {
            const plainPassword = generatePassword(6);
            const hashedPassword = await hash(plainPassword, 10); // using 10 rounds for faster bulk generation
            await prisma.user.create({
                data: {
                    password: hashedPassword,
                    teamId: t.id,
                }
            });
            await prisma.team.update({
                where: { id: t.id },
                data: { generatedPassword: plainPassword },
            });
            password = plainPassword;
            hasAccount = true;
        }

        credentials.push({
            teamNumber: t.teamNumber,
            password: password,
            hasAccount: hasAccount,
        });
    }

    return NextResponse.json({ credentials });
}


export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const currentUser = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
    if (!currentUser?.isAdmin) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const teams = await prisma.team.findMany({
        include: { user: true },
    });

    const regenerated: { teamNumber: string; password: string }[] = [];

    for (const team of teams) {
        if (team.user && !team.user.isAdmin) {
            const plainPassword = generatePassword(6);
            const hashedPassword = await hash(plainPassword, 12);

            await prisma.user.update({
                where: { id: team.user.id },
                data: { password: hashedPassword },
            });

            await prisma.team.update({
                where: { id: team.id },
                data: { generatedPassword: plainPassword },
            });

            regenerated.push({ teamNumber: team.teamNumber, password: plainPassword });
        }
    }

    return NextResponse.json({ success: true, regenerated });
}
