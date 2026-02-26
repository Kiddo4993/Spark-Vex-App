import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const scoutSchema = z.object({
    autoStrength: z.number().min(0).max(10).nullable(),
    driverStrength: z.number().min(0).max(10).nullable(),
    notes: z.string().optional().nullable(),
});

export async function PATCH(
    req: Request,
    { params }: { params: { teamNumber: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { teamNumber } = params;
        const body = await req.json();
        const parsed = scoutSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
        }

        const subjectTeam = await prisma.team.findFirst({
            where: { teamNumber: { equals: teamNumber, mode: "insensitive" } },
        });

        if (!subjectTeam) {
            return NextResponse.json({ error: "Subject team not found" }, { status: 404 });
        }

        const scoutingData = await prisma.scoutingData.upsert({
            where: {
                scouterId_subjectTeamId: {
                    scouterId: session.user.teamId,
                    subjectTeamId: subjectTeam.id,
                },
            },
            update: {
                autoStrength: parsed.data.autoStrength,
                driverStrength: parsed.data.driverStrength,
                notes: parsed.data.notes,
                lastUpdated: new Date()
            },
            create: {
                scouterId: session.user.teamId,
                subjectTeamId: subjectTeam.id,
                autoStrength: parsed.data.autoStrength,
                driverStrength: parsed.data.driverStrength,
                notes: parsed.data.notes,
            },
        });

        return NextResponse.json(scoutingData);
    } catch (e: any) {
        console.error("Scouting Save Error:", e);
        return NextResponse.json({ error: "Failed to save scouting data" }, { status: 500 });
    }
}
