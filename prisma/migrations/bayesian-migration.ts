import { PrismaClient } from "@prisma/client";
import { computeBayesianMatchUpdate, K, W, U_MATCH, U_MIN } from "../../src/lib/bayesian";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting Bayesian migration...");

    // 1. Reset all teams
    console.log("Resetting team ratings...");
    await prisma.team.updateMany({
        data: {
            performanceRating: 100,
            ratingUncertainty: 50,
            matchCount: 0,
        }
    });

    // 2. Clear history
    console.log("Clearing performance history...");
    await prisma.performanceHistory.deleteMany({});

    // 3. Replay matches
    console.log("Fetching matches...");
    const matches = await prisma.match.findMany({
        orderBy: { date: "asc" },
        include: {
            redTeam1: true,
            redTeam2: true,
            redTeam3: true,
            blueTeam1: true,
            blueTeam2: true,
            blueTeam3: true
        }
    });

    console.log(`Found ${matches.length} matches. Replaying...`);

    for (const match of matches) {
        // Get current team states
        // We need to fetch FRESH team data because previous loop iterations updated them.
        // Or we can track in memory for speed, but DB is safer.
        const teamIds = [
            match.redTeam1Id, match.redTeam2Id, match.redTeam3Id,
            match.blueTeam1Id, match.blueTeam2Id, match.blueTeam3Id
        ];

        const teams = await prisma.team.findMany({
            where: { id: { in: teamIds } }
        });

        const getTeam = (id: string) => teams.find(t => t.id === id);

        const redTeamsRaw = [match.redTeam1Id, match.redTeam2Id, match.redTeam3Id].map(getTeam).filter(Boolean);
        const blueTeamsRaw = [match.blueTeam1Id, match.blueTeam2Id, match.blueTeam3Id].map(getTeam).filter(Boolean);

        if (redTeamsRaw.length !== 3 || blueTeamsRaw.length !== 3) {
            console.warn(`Match ${match.id} has invalid teams count. Skipping.`);
            continue;
        }

        // Map to Bayesian Input
        const redTeams = redTeamsRaw.map(t => ({ id: t!.id, rating: t!.performanceRating, uncertainty: t!.ratingUncertainty }));
        const blueTeams = blueTeamsRaw.map(t => ({ id: t!.id, rating: t!.performanceRating, uncertainty: t!.ratingUncertainty }));

        const redWins = match.redScore > match.blueScore;
        const { winning, losing } = redWins
            ? computeBayesianMatchUpdate(redTeams, blueTeams, { k: K, w: W, uMatch: U_MATCH, uMin: U_MIN })
            : computeBayesianMatchUpdate(blueTeams, redTeams, { k: K, w: W, uMatch: U_MATCH, uMin: U_MIN });

        const allUpdates = [...winning, ...losing];

        for (const update of allUpdates) {
            await prisma.team.update({
                where: { id: update.teamId },
                data: {
                    performanceRating: update.ratingAfter,
                    ratingUncertainty: update.uncertaintyAfter,
                    matchCount: { increment: 1 },
                },
            });

            await prisma.performanceHistory.create({
                data: {
                    teamId: update.teamId,
                    performanceRating: update.ratingAfter,
                    uncertainty: update.uncertaintyAfter,
                    matchId: match.id,
                },
            });

            // Update Stats
            // We try to update existing TeamMatchStats rather than delete/create to preserve IDs if referenced elsewhere?
            // Actually TeamMatchStats has unique (matchId, teamId).
            // We can upsert.
            const isRed = [match.redTeam1Id, match.redTeam2Id, match.redTeam3Id].includes(update.teamId);
            await prisma.teamMatchStats.upsert({
                where: {
                    matchId_teamId: { matchId: match.id, teamId: update.teamId }
                },
                create: {
                    matchId: match.id,
                    teamId: update.teamId,
                    alliance: isRed ? "red" : "blue",
                    score: isRed ? match.redScore : match.blueScore,
                    performanceBefore: update.ratingBefore,
                    performanceAfter: update.ratingAfter,
                    uncertaintyBefore: update.uncertaintyBefore,
                    uncertaintyAfter: update.uncertaintyAfter,
                    expectedOutcome: update.expectedOutcome,
                    carryFactor: update.creditFactor,
                    surpriseFactor: update.surpriseFactor
                },
                update: {
                    performanceBefore: update.ratingBefore,
                    performanceAfter: update.ratingAfter,
                    uncertaintyBefore: update.uncertaintyBefore,
                    uncertaintyAfter: update.uncertaintyAfter,
                    expectedOutcome: update.expectedOutcome,
                    carryFactor: update.creditFactor,
                    surpriseFactor: update.surpriseFactor
                }
            });
        }
    }

    console.log("Migration complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
