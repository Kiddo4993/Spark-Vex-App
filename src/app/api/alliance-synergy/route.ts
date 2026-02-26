import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { confidenceFromUncertainty, INITIAL_UNCERTAINTY } from "@/lib/bayesian";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const myTeamId = (session.user as any).teamId;

    const myTeam = await prisma.team.findUnique({
        where: { id: myTeamId },
    });
    if (!myTeam) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    // Get only teams that have been imported (have CalculatedRating records from this uploader)
    const importedRatings = await prisma.calculatedRating.findMany({
        where: { uploaderId: myTeamId, subjectTeamId: { not: myTeam.id } },
        select: { subjectTeamId: true },
    });
    const importedTeamIds = importedRatings.map(r => r.subjectTeamId);

    if (importedTeamIds.length === 0) {
        return NextResponse.json([]);
    }

    const allTeams = await prisma.team.findMany({
        where: { id: { in: importedTeamIds }, teamNumber: { not: "ADMIN" } },
    });

    // Lookup scoped data
    const calcRatings = await prisma.calculatedRating.findMany({
        where: { uploaderId: myTeamId }
    });
    const scoutingDataList = await prisma.scoutingData.findMany({
        where: { scouterId: myTeamId }
    });

    const calcMap = new Map(calcRatings.map(c => [c.subjectTeamId, c]));
    const scoutMap = new Map(scoutingDataList.map(s => [s.subjectTeamId, s]));

    const myRating = calcMap.get(myTeam.id);
    const myScout = scoutMap.get(myTeam.id);

    const r1 = myRating?.performanceRating ?? 100;
    const as1 = myScout?.autoStrength ?? 0;
    const ds1 = myScout?.driverStrength ?? 0;

    const results = allTeams.map((other) => {
        const otherRating = calcMap.get(other.id);
        const otherScout = scoutMap.get(other.id);

        // 1. Auto Compatibility
        let autoScore = 75; // Default/Unknown/Skills
        const s1 = myTeam.autonomousSide?.toLowerCase();
        const s2 = other.autonomousSide?.toLowerCase();

        const missingScouting = (otherScout?.autoStrength ?? null) === null || (otherScout?.driverStrength ?? null) === null;
        let autoConflict = false;

        if (s1 && s2 && s1 !== "skills" && s2 !== "skills") {
            if (s1 === s2) {
                autoScore = 50;
                autoConflict = true;
            } else {
                autoScore = 100;
            }
        } else if (s1 && s2 && (s1 === "skills" || s2 === "skills")) {
            autoScore = 75;
        }

        // 2. Strength Score
        const r2 = otherRating?.performanceRating ?? 100;
        const baseScore = Math.min(50, (r1 + r2) / 6);

        const as2 = otherScout?.autoStrength ?? 0;
        const autoBonus = (as1 + as2) / 0.8; // Max 25

        const ds2 = otherScout?.driverStrength ?? 0;
        const driverBonus = (ds1 + ds2) / 0.8; // Max 25

        const strengthScore = baseScore + Math.min(25, autoBonus) + Math.min(25, driverBonus);

        const synergyScore = autoScore + strengthScore;

        const confidence = confidenceFromUncertainty(
            otherRating?.ratingUncertainty ?? 50,
            INITIAL_UNCERTAINTY
        );

        return {
            team: {
                id: other.id,
                teamNumber: other.teamNumber,
                autonomousSide: other.autonomousSide,
                autoStrength: otherScout?.autoStrength ?? null,
                driverStrength: otherScout?.driverStrength ?? null,
                performanceRating: otherRating?.performanceRating ?? 100,
            },
            synergyScore,
            autoCompatibility: autoScore,
            strengthScore,
            confidence,
            missingScouting,
            autoConflict,
        };
    });

    results.sort((a, b) => b.synergyScore - a.synergyScore);

    return NextResponse.json(results);
}
