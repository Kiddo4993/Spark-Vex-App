import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const RE_BASE = "https://www.robotevents.com/api/v2";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ teamNumber: string }> }
) {
    try {
        const { teamNumber } = await params;
        const body = await req.json();
        const { apiKey } = body;

        if (!apiKey) {
            return NextResponse.json({ error: "API key is required" }, { status: 400 });
        }

        const headers = {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
        };

        // 1. Get the internal RobotEvents Team ID for this team number
        // VEX programs (VRC, VEXU, VIQC)
        const teamRes = await fetch(
            `${RE_BASE}/teams?number[]=${teamNumber}&per_page=1`,
            { headers }
        );

        if (!teamRes.ok) {
            if (teamRes.status === 401) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
            return NextResponse.json({ error: "Failed to query RobotEvents for team" }, { status: teamRes.status });
        }

        const teamData = await teamRes.json();
        const reTeamId = teamData.data?.[0]?.id;

        if (!reTeamId) {
            return NextResponse.json({ error: "Team not found on RobotEvents" }, { status: 404 });
        }

        // 2. Fetch all awards for this team ID
        const awardsRes = await fetch(
            `${RE_BASE}/teams/${reTeamId}/awards`,
            { headers }
        );

        if (!awardsRes.ok) {
            return NextResponse.json({ error: "Failed to fetch awards from RobotEvents" }, { status: awardsRes.status });
        }

        const awardsData = await awardsRes.json();
        const awardsList = awardsData.data || [];

        // 3. Save exactly uppercase team number
        const upNum = teamNumber.toUpperCase();

        // Ensure team exists in our DB first
        let dbTeam = await prisma.team.findFirst({
            where: {
                teamNumber: {
                    equals: upNum,
                    mode: "insensitive"
                }
            }
        });

        if (!dbTeam) {
            // Create if missing but they are trying to fetch awards? Unlikely case, but handled.
            dbTeam = await prisma.team.create({
                data: {
                    teamNumber: upNum,
                    performanceRating: 100,
                    ratingUncertainty: 50,
                    matchCount: 0
                }
            });
        }

        // 4. Upsert awards to database
        let savedCount = 0;

        // Optional: clear old awards to strictly match RE? 
        // No, it handles unique updates gracefully, but to avoid abandoned awards if RE deletes them, 
        // we could delete all and recreate, or just upsert. Upsert is safer for DB history.
        for (const award of awardsList) {
            // Award objects usually have title and event name
            const awardName = award.title || "Unknown Award";
            const eventName = award.event?.name || "Unknown Event";

            await prisma.award.upsert({
                where: {
                    teamId_name_event: {
                        teamId: dbTeam.id,
                        name: awardName,
                        event: eventName,
                    }
                },
                update: {}, // Do nothing if it already exists
                create: {
                    teamId: dbTeam.id,
                    name: awardName,
                    event: eventName,
                }
            });
            savedCount++;
        }

        return NextResponse.json({ success: true, count: savedCount });

    } catch (e: any) {
        console.error("Awards Sync Error:", e);
        return NextResponse.json({ error: "Sync failed: " + e.message }, { status: 500 });
    }
}
