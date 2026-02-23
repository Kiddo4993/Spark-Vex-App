import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeBayesianMatchUpdate, computeBayesianTieUpdate, BayesianMatchUpdate, K, W, U_MATCH, U_MIN } from "@/lib/bayesian";

type ColumnMapping = {
    eventName?: string;
    date?: string;
    redTeam1?: string;
    redTeam2?: string;
    redTeam3?: string;
    blueTeam1?: string;
    blueTeam2?: string;
    blueTeam3?: string;
    redScore?: string;
    blueScore?: string;
    // Skills
    rank?: string;
    team?: string;
    driverScore?: string;
    programmingScore?: string;
    highestScore?: string;
};

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { importType = "match" } = body;

        if (importType === "skills") {
            return await processSkills(body);
        } else {
            return await processMatches(body);
        }
    } catch (e: any) {
        console.error("Import Error:", e);
        return NextResponse.json({ error: "Process failed: " + e.message }, { status: 500 });
    }
}

async function processSkills(body: any) {
    const { fileData, mapping, dryRun } = body;
    const rows = fileData.slice(1);
    const parsedSkills = [];

    const getVal = (row: any[], colIdx?: string) => {
        if (!colIdx) return null;
        return row[parseInt(colIdx, 10)];
    };

    const cleanTeam = (val: any) => String(val).trim().replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

    for (const row of rows) {
        if (!row || row.length === 0) continue;

        const teamStr = getVal(row, mapping.team);
        if (!teamStr) continue;

        const teamNum = cleanTeam(teamStr);
        if (!teamNum) continue;

        const rank = parseInt(getVal(row, mapping.rank) || "0");
        const driver = parseInt(getVal(row, mapping.driverScore) || "0");
        const prog = parseInt(getVal(row, mapping.programmingScore) || "0");
        const highest = parseInt(getVal(row, mapping.highestScore) || "0"); // often "Combined"

        parsedSkills.push({ teamNum, rank, driver, prog, highest });
    }

    if (dryRun) {
        return NextResponse.json({
            count: parsedSkills.length,
            teamCount: new Set(parsedSkills.map(s => s.teamNum)).size,
            sample: parsedSkills.slice(0, 5),
            dateRange: null
        });
    }

    let count = 0;
    for (const record of parsedSkills) {
        // Find or Create Team
        const team = await prisma.team.upsert({
            where: { teamNumber: record.teamNum },
            update: {},
            create: {
                teamNumber: record.teamNum,
                performanceRating: 100,
                ratingUncertainty: 50,
                matchCount: 0
            }
        });

        // Update Skills Record
        // We'll update the most recent one or create new.
        // For simplicity, let's look for an existing one and update it.
        const existing = await prisma.skillsRecord.findFirst({
            where: { teamId: team.id }
        });

        if (existing) {
            await prisma.skillsRecord.update({
                where: { id: existing.id },
                data: {
                    driverSkillsScore: record.driver,
                    autonomousSkillsScore: record.prog,
                    combinedSkillsScore: record.highest,
                    provincialSkillsRank: record.rank,
                    lastUpdated: new Date()
                }
            });
        } else {
            await prisma.skillsRecord.create({
                data: {
                    teamId: team.id,
                    driverSkillsScore: record.driver,
                    autonomousSkillsScore: record.prog,
                    combinedSkillsScore: record.highest,
                    provincialSkillsRank: record.rank,
                }
            });
        }
        count++;
    }

    return NextResponse.json({ success: true, count });
}

async function processMatches(body: any) {
    const { fileData, mapping, dryRun } = body;
    if (!fileData || !mapping) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const rows = fileData.slice(1);
    const parsedMatches = [];
    const getVal = (row: any[], colIdx?: string) => {
        if (!colIdx) return null;
        return row[parseInt(colIdx, 10)];
    };
    const cleanTeam = (val: any) => {
        const s = String(val).trim();
        return s.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    };

    for (const row of rows) {
        if (!row || row.length === 0) continue;
        const eventName = getVal(row, mapping.eventName);
        const dateStr = getVal(row, mapping.date);
        const r1 = getVal(row, mapping.redTeam1);
        const r2 = getVal(row, mapping.redTeam2);
        const r3 = getVal(row, mapping.redTeam3);
        const b1 = getVal(row, mapping.blueTeam1);
        const b2 = getVal(row, mapping.blueTeam2);
        const b3 = getVal(row, mapping.blueTeam3);
        const rScore = getVal(row, mapping.redScore);
        const bScore = getVal(row, mapping.blueScore);

        if (rScore == null || bScore == null || !r1 || !b1) continue;
        const rScoreNum = Number(rScore);
        const bScoreNum = Number(bScore);
        if (isNaN(rScoreNum) || isNaN(bScoreNum)) continue;

        const redNums: string[] = [r1, r2, r3].filter(Boolean).map(cleanTeam).filter(s => s.length > 0);
        const blueNums: string[] = [b1, b2, b3].filter(Boolean).map(cleanTeam).filter(s => s.length > 0);

        if (redNums.length === 0 || blueNums.length === 0) continue;

        let finalDate: Date | null = null;
        if (typeof dateStr === 'number') {
            finalDate = new Date(Math.round((dateStr - 25569) * 86400 * 1000));
        } else if (typeof dateStr === 'string') {
            const d = new Date(dateStr);
            if (!isNaN(d.getTime())) finalDate = d;
        }

        if (!finalDate || isNaN(finalDate.getTime())) continue;

        parsedMatches.push({
            eventName: String(eventName || "Imported Event"),
            date: finalDate,
            redNums,
            blueNums,
            redScore: rScoreNum,
            blueScore: bScoreNum
        });
    }

    if (dryRun) {
        // Stats for dry run
        const teamSet = new Set<string>();
        parsedMatches.forEach(m => {
            m.redNums.forEach(t => teamSet.add(t));
            m.blueNums.forEach(t => teamSet.add(t));
        });

        const dates = parsedMatches.map(m => m.date.getTime());
        const minDate = dates.length ? new Date(Math.min(...dates)) : null;
        const maxDate = dates.length ? new Date(Math.max(...dates)) : null;

        return NextResponse.json({
            matchCount: parsedMatches.length,
            teamCount: teamSet.size,
            dateRange: minDate ? { start: minDate, end: maxDate } : null,
            sample: parsedMatches.slice(0, 3)
        });
    }

    // Sort by Date
    parsedMatches.sort((a, b) => a.date.getTime() - b.date.getTime());

    let importedCount = 0;
    for (const match of parsedMatches) {
        // ... (Same logic as before for saving matches and ratings)
        // Ensure teams exist
        const getTeamId = async (num: string) => {
            const upNum = num.toUpperCase();
            let t = await prisma.team.findUnique({ where: { teamNumber: upNum } });
            if (!t) {
                t = await prisma.team.create({
                    data: {
                        teamNumber: upNum,
                        performanceRating: 100,
                        ratingUncertainty: 50,
                        matchCount: 0
                    }
                });
            }
            return t;
        };

        const redTeamIds: string[] = [];
        const blueTeamIds: string[] = [];
        const redTeams = [];
        const blueTeams = [];

        for (const n of match.redNums) {
            const t = await getTeamId(n);
            redTeams.push(t);
            redTeamIds.push(t.id);
        }
        for (const n of match.blueNums) {
            const t = await getTeamId(n);
            blueTeams.push(t);
            blueTeamIds.push(t.id);
        }

        const rInput = [...redTeams];
        const bInput = [...blueTeams];
        while (rInput.length < 3 && rInput.length > 0) rInput.push(rInput[0]);
        while (bInput.length < 3 && bInput.length > 0) bInput.push(bInput[0]);

        const redBayesInput = rInput.map(t => ({ id: t.id, rating: t.performanceRating, uncertainty: t.ratingUncertainty }));
        const blueBayesInput = bInput.map(t => ({ id: t.id, rating: t.performanceRating, uncertainty: t.ratingUncertainty }));

        let allUpdates: BayesianMatchUpdate[];
        if (match.redScore === match.blueScore) {
            allUpdates = computeBayesianTieUpdate(redBayesInput, blueBayesInput, { k: K, w: W, uMatch: U_MATCH, uMin: U_MIN });
        } else {
            const redWins = match.redScore > match.blueScore;
            const { winning, losing } = redWins
                ? computeBayesianMatchUpdate(redBayesInput, blueBayesInput, { k: K, w: W, uMatch: U_MATCH, uMin: U_MIN })
                : computeBayesianMatchUpdate(blueBayesInput, redBayesInput, { k: K, w: W, uMatch: U_MATCH, uMin: U_MIN });
            allUpdates = [...winning, ...losing];
        }

        const existing = await prisma.match.findFirst({
            where: {
                date: match.date,
                redScore: match.redScore,
                blueScore: match.blueScore,
                redTeam1Id: redTeamIds[0]
            }
        });
        if (existing) continue;

        const dbMatch = await prisma.match.create({
            data: {
                eventName: match.eventName,
                date: match.date,
                redScore: match.redScore,
                blueScore: match.blueScore,
                redTeam1Id: redTeamIds[0],
                redTeam2Id: redTeamIds[1] || redTeamIds[0],
                redTeam3Id: redTeamIds[2] || redTeamIds[0],
                blueTeam1Id: blueTeamIds[0],
                blueTeam2Id: blueTeamIds[1] || blueTeamIds[0],
                blueTeam3Id: blueTeamIds[2] || blueTeamIds[0],
            }
        });

        const startIds = new Set<string>();

        for (const up of allUpdates) {
            if (startIds.has(up.teamId)) continue;
            if (!redTeamIds.includes(up.teamId) && !blueTeamIds.includes(up.teamId)) continue;

            startIds.add(up.teamId);

            await prisma.team.update({
                where: { id: up.teamId },
                data: {
                    performanceRating: up.ratingAfter,
                    ratingUncertainty: up.uncertaintyAfter,
                    matchCount: { increment: 1 }
                }
            });
            await prisma.performanceHistory.create({
                data: {
                    teamId: up.teamId,
                    performanceRating: up.ratingAfter,
                    uncertainty: up.uncertaintyAfter,
                    matchId: dbMatch.id
                }
            });

            const isRed = redTeamIds.includes(up.teamId);
            await prisma.teamMatchStats.create({
                data: {
                    matchId: dbMatch.id,
                    teamId: up.teamId,
                    alliance: isRed ? "red" : "blue",
                    score: isRed ? match.redScore : match.blueScore,
                    performanceBefore: up.ratingBefore,
                    performanceAfter: up.ratingAfter,
                    uncertaintyBefore: up.uncertaintyBefore,
                    uncertaintyAfter: up.uncertaintyAfter,
                    expectedOutcome: up.expectedOutcome,
                    carryFactor: up.creditFactor,
                    surpriseFactor: up.surpriseFactor
                }
            });
        }
        importedCount++;
    }

    return NextResponse.json({ success: true, count: importedCount });
}
