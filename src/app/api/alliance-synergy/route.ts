import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { confidenceFromUncertainty, INITIAL_UNCERTAINTY } from "@/lib/bayesian";

/**
 * ==========================================
 * ALLIANCE SYNERGY ENGINE (AKA THE MATCHMAKER)
 * ==========================================
 * Basically figuring out if we're actually compatible with these guys 
 * or if it's gonna be a disaster in auto lmao.
 * 
 * We check a bunch of stuff:
 * - Did they self-report? (sus, but we'll use it if we have to)
 * - Do we have scouting data on them? (way better, iykyk)
 * - Do our autonomous paths collide? (if they do, RIP)
 * 
 * Honestly this math is kinda wild but it works ok lol. 
 */
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const myTeamId = (session.user as any).teamId;

    const myTeam = await prisma.team.findUnique({
        where: { id: myTeamId },
    });
    if (!myTeam) return NextResponse.json({ error: "Team not found" }, { status: 404 });

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
    const calcRatings = await prisma.calculatedRating.findMany({
        where: { uploaderId: myTeamId }
    });
    const scoutingDataList = await prisma.scoutingData.findMany({
        where: { scouterId: myTeamId }
    });

    // Fetch ALL scouting data to find self-reported ratings (where subjectTeamId === scouterId)
    const allScoutingData = await prisma.scoutingData.findMany({
        where: { subjectTeamId: { in: importedTeamIds } }
    });

    const selfScoutMap = new Map<string, typeof allScoutingData[0]>();
    for (const s of allScoutingData) {
        if (s.scouterId === s.subjectTeamId) {
            selfScoutMap.set(s.subjectTeamId, s);
        }
    }

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
        const theirSelfScout = selfScoutMap.get(other.id);

        // Resolve auto/driver: prefer current user's scouting, fallback to their self-reported public rating
        // lmao basically if we scouted them, trust our scouts over whatever they claim they can do 
        const resolvedAuto = otherScout?.autoStrength ?? theirSelfScout?.autoStrength ?? null;
        const resolvedDriver = otherScout?.driverStrength ?? theirSelfScout?.driverStrength ?? null;

        let autoScore = 75; 
        const s1 = myTeam.autonomousSide?.toLowerCase();
        const s2 = other.autonomousSide?.toLowerCase();

        // Missing data: only flag if the team has NO autonomous side AND no scouting data at all
        const hasAutoInfo = !!other.autonomousSide;
        const hasAnyScouting = resolvedAuto !== null || resolvedDriver !== null;
        const missingScouting = !hasAutoInfo && !hasAnyScouting;
        let autoConflict = false;

        if (s1 && s2 && s1 !== "skills" && s2 !== "skills") {
            if (s1 === s2) {
                // Bruh if we're both on the same side of the field in auto we're cooked 💀
                autoScore = 50;
                autoConflict = true;
            } else {
                // Free real estate lmao
                autoScore = 100;
            }
        } else if (s1 && s2 && (s1 === "skills" || s2 === "skills")) {
            autoScore = 75;
        }

        const r2 = otherRating?.performanceRating ?? 100;
        const baseScore = Math.min(50, (r1 + r2) / 6);

        const as2 = resolvedAuto ?? 0;
        const autoBonus = (as1 + as2) / 0.8; 

        const ds2 = resolvedDriver ?? 0;
        const driverBonus = (ds1 + ds2) / 0.8;

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
                autoStrength: resolvedAuto,
                driverStrength: resolvedDriver,
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

    return NextResponse.json({
        myTeam: {
            teamNumber: myTeam.teamNumber,
            autonomousSide: myTeam.autonomousSide,
            drivetrainType: myTeam.drivetrainType,
            autoStrength: myScout?.autoStrength ?? null,
            driverStrength: myScout?.driverStrength ?? null,
        },
        results,
    });
}
