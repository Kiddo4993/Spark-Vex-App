import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { confidenceFromUncertainty, INITIAL_UNCERTAINTY } from "@/lib/bayesian";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const myTeam = await prisma.team.findUnique({
        where: { id: (session.user as any).teamId },
    });
    if (!myTeam) return NextResponse.json({ error: "Team not found" }, { status: 404 });

    // Get all potential partners
    const allTeams = await prisma.team.findMany({
        where: { id: { not: myTeam.id } },
    });

    const results = allTeams.map((other) => {
        // 1. Auto Compatibility
        let autoScore = 75; // Default/Unknown/Skills
        const s1 = myTeam.autonomousSide?.toLowerCase();
        const s2 = other.autonomousSide?.toLowerCase();

        const missingScouting = other.autoStrength === null || other.driverStrength === null;
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
        const r1 = myTeam.performanceRating;
        const r2 = other.performanceRating;
        // Formula: min(50, (r1+r2)/6)
        // If ratings are around 100, sum=200, /6 = 33.
        // If ratings are 150 (strong), sum=300, /6 = 50 (max).
        const baseScore = Math.min(50, (r1 + r2) / 6);

        const as1 = myTeam.autoStrength || 0;
        const as2 = other.autoStrength || 0;
        const autoBonus = (as1 + as2) / 0.8; // Max 25

        const ds1 = myTeam.driverStrength || 0;
        const ds2 = other.driverStrength || 0;
        const driverBonus = (ds1 + ds2) / 0.8; // Max 25

        const strengthScore = baseScore + Math.min(25, autoBonus) + Math.min(25, driverBonus);

        const synergyScore = autoScore + strengthScore;

        const confidence = confidenceFromUncertainty(
            other.ratingUncertainty,
            INITIAL_UNCERTAINTY
        );

        return {
            team: {
                id: other.id,
                teamNumber: other.teamNumber,
                autonomousSide: other.autonomousSide,
                autoStrength: other.autoStrength,
                driverStrength: other.driverStrength,
                performanceRating: other.performanceRating,
            },
            synergyScore,
            autoCompatibility: autoScore,
            strengthScore,
            confidence,
            missingScouting,
            autoConflict,
        };
    });

    // Sort by synergy descending
    results.sort((a, b) => b.synergyScore - a.synergyScore);

    return NextResponse.json(results);
}
