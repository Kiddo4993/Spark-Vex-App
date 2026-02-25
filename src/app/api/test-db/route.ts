import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const teamId = "cmm1oyuvu0000sbsa8bkl3pri"; // ID from our mock import
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: {
                performanceHistory: { orderBy: { createdAt: "desc" }, take: 20 },
            },
        });
        
        const calcRating = await prisma.calculatedRating.findUnique({
            where: { uploaderId_subjectTeamId: { uploaderId: teamId, subjectTeamId: teamId } }
        });
        
        const scoutData = await prisma.scoutingData.findUnique({
            where: { scouterId_subjectTeamId: { scouterId: teamId, subjectTeamId: teamId } }
        });

        const recentMatches = await prisma.match.findMany({
            where: {
                OR: [
                    { redTeam1Id: teamId }, { redTeam2Id: teamId }, { redTeam3Id: teamId },
                    { blueTeam1Id: teamId }, { blueTeam2Id: teamId }, { blueTeam3Id: teamId },
                ],
            },
            take: 2,
        });

        return NextResponse.json({ success: true, team, calcRating, scoutData, recentMatches });
    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
