import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { computeBayesianMatchUpdate, computeBayesianTieUpdate, BayesianMatchUpdate, K, W, U_MATCH, U_MIN } from "@/lib/bayesian";

function generatePassword(length = 6): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No confusing chars (0/O, 1/I/L)
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

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
        return await processMatches(body, session.user.teamId);
    } catch (e: any) {
        console.error("Import Error:", e);
        return NextResponse.json({ error: "Process failed: " + e.message }, { status: 500 });
    }
}

async function processMatches(body: any, uploaderId: string) {
    const { fileData, mapping, dryRun, wipeData } = body;
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

    parsedMatches.sort((a, b) => a.date.getTime() - b.date.getTime());

    // --- WIPE EXISTING DATA SCOPED TO UPLOADER ---
    if (wipeData === true || wipeData === "true") {
        await prisma.match.deleteMany({
            where: { uploaderId }
        });

        await prisma.calculatedRating.deleteMany({
            where: { uploaderId }
        });
    }

    let importedCount = 0;
    const updatedTeamIds = new Set<string>();

    for (const match of parsedMatches) {
        const getTeamId = async (num: string) => {
            const upNum = num.toUpperCase();
            let t = await prisma.team.findUnique({ where: { teamNumber: upNum } });
            if (!t) {
                t = await prisma.team.create({
                    data: { teamNumber: upNum }
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

        // Get or initialize CalculatedRatings for this uploader
        const getRating = async (teamId: string) => {
            let cr = await prisma.calculatedRating.findUnique({
                where: { uploaderId_subjectTeamId: { uploaderId, subjectTeamId: teamId } }
            });
            if (!cr) {
                cr = await prisma.calculatedRating.create({
                    data: {
                        uploaderId,
                        subjectTeamId: teamId,
                        performanceRating: 100,
                        ratingUncertainty: 50,
                        matchCount: 0
                    }
                });
            }
            return cr;
        };

        const redBayesInput = await Promise.all(redTeamIds.map(async id => {
            const cr = await getRating(id);
            return { id, rating: cr.performanceRating, uncertainty: cr.ratingUncertainty };
        }));

        const blueBayesInput = await Promise.all(blueTeamIds.map(async id => {
            const cr = await getRating(id);
            return { id, rating: cr.performanceRating, uncertainty: cr.ratingUncertainty };
        }));

        // Pad to 3 if needed for the Bayesian func (it expects length 3 inside compute logic if we didn't slice)
        const rInput = [...redBayesInput];
        const bInput = [...blueBayesInput];
        while (rInput.length < 3 && rInput.length > 0) rInput.push(rInput[0]);
        while (bInput.length < 3 && bInput.length > 0) bInput.push(bInput[0]);

        let allUpdates: BayesianMatchUpdate[];
        if (match.redScore === match.blueScore) {
            allUpdates = computeBayesianTieUpdate(rInput, bInput, { k: K, w: W, uMatch: U_MATCH, uMin: U_MIN });
        } else {
            const redWins = match.redScore > match.blueScore;
            const { winning, losing } = redWins
                ? computeBayesianMatchUpdate(rInput, bInput, { k: K, w: W, uMatch: U_MATCH, uMin: U_MIN })
                : computeBayesianMatchUpdate(bInput, rInput, { k: K, w: W, uMatch: U_MATCH, uMin: U_MIN });
            allUpdates = [...winning, ...losing];
        }

        const existing = await prisma.match.findFirst({
            where: {
                uploaderId,
                date: match.date,
                redScore: match.redScore,
                blueScore: match.blueScore,
                redTeam1Id: redTeamIds[0]
            }
        });
        if (existing) continue;

        const dbMatch = await prisma.match.create({
            data: {
                uploaderId,
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
            updatedTeamIds.add(up.teamId);

            await prisma.calculatedRating.update({
                where: { uploaderId_subjectTeamId: { uploaderId, subjectTeamId: up.teamId } },
                data: {
                    performanceRating: up.ratingAfter,
                    ratingUncertainty: up.uncertaintyAfter,
                    matchCount: { increment: 1 }
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

    const updatedTeamsList = await prisma.calculatedRating.findMany({
        where: { uploaderId, subjectTeamId: { in: Array.from(updatedTeamIds) } },
        include: { subjectTeam: { select: { teamNumber: true } } }
    });

    const formattedUpdates = updatedTeamsList.map(cr => ({
        teamNumber: cr.subjectTeam.teamNumber,
        performanceRating: cr.performanceRating,
        ratingUncertainty: cr.ratingUncertainty
    }));

    return NextResponse.json({
        success: true,
        count: importedCount,
        credentialsGenerated: 0,
        credentials: [],
        updatedTeams: formattedUpdates
    });
}
