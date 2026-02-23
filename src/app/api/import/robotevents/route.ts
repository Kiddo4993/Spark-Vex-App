import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const RE_BASE = "https://www.robotevents.com/api/v2";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { apiKey, eventId, action } = body;

        if (!apiKey) {
            return NextResponse.json({ error: "API key is required" }, { status: 400 });
        }

        const headers = {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
        };

        // --- Action: validate key ---
        if (action === "validate") {
            const res = await fetch(`${RE_BASE}/seasons?per_page=1`, { headers });
            if (!res.ok) {
                return NextResponse.json(
                    { error: "Invalid API key. Get yours at robotevents.com/api" },
                    { status: 401 }
                );
            }
            return NextResponse.json({ valid: true });
        }

        // --- Action: search events ---
        if (action === "searchEvents") {
            const query = body.query ?? "";
            const res = await fetch(
                `${RE_BASE}/events?name=${encodeURIComponent(query)}&per_page=20`,
                { headers }
            );
            if (!res.ok) {
                return NextResponse.json({ error: "Failed to search events" }, { status: res.status });
            }
            const data = await res.json();
            const events = (data.data || []).map((e: any) => ({
                id: e.id,
                sku: e.sku,
                name: e.name,
                start: e.start,
                end: e.end,
                location: e.location ? `${e.location.city}, ${e.location.region}` : "",
            }));
            return NextResponse.json({ events });
        }

        // --- Action: fetch matches for an event ---
        if (action === "fetchMatches") {
            if (!eventId) {
                return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
            }

            // Fetch all match pages
            let allMatches: any[] = [];
            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const res = await fetch(
                    `${RE_BASE}/events/${eventId}/divisions/1/matches?per_page=100&page=${page}`,
                    { headers }
                );
                if (!res.ok) {
                    if (res.status === 404) {
                        return NextResponse.json(
                            { error: "Event not found. Check the event ID." },
                            { status: 404 }
                        );
                    }
                    return NextResponse.json(
                        { error: `Failed to fetch matches (${res.status})` },
                        { status: res.status }
                    );
                }
                const data = await res.json();
                const matches = data.data || [];
                allMatches = allMatches.concat(matches);

                // Check pagination
                if (data.meta && data.meta.last_page > page) {
                    page++;
                } else {
                    hasMore = false;
                }
            }

            // Parse into our format
            const parsed = allMatches
                .filter((m: any) => {
                    // Only include completed matches with scores
                    const reds = m.alliances?.find((a: any) => a.color === "red");
                    const blues = m.alliances?.find((a: any) => a.color === "blue");
                    return reds && blues && (reds.score !== null && blues.score !== null);
                })
                .map((m: any) => {
                    const red = m.alliances.find((a: any) => a.color === "red");
                    const blue = m.alliances.find((a: any) => a.color === "blue");

                    const redTeams = (red.teams || []).map((t: any) => t.team?.name || "");
                    const blueTeams = (blue.teams || []).map((t: any) => t.team?.name || "");

                    // Pad to 3 teams per alliance
                    while (redTeams.length < 3) redTeams.push("");
                    while (blueTeams.length < 3) blueTeams.push("");

                    return {
                        eventName: m.name || `Match ${m.matchnum}`,
                        date: m.started || new Date().toISOString(),
                        redTeam1: redTeams[0],
                        redTeam2: redTeams[1],
                        redTeam3: redTeams[2],
                        blueTeam1: blueTeams[0],
                        blueTeam2: blueTeams[1],
                        blueTeam3: blueTeams[2],
                        redScore: red.score ?? 0,
                        blueScore: blue.score ?? 0,
                    };
                });

            return NextResponse.json({
                matchCount: parsed.length,
                matches: parsed,
                teamCount: new Set(
                    parsed.flatMap((m: any) => [
                        m.redTeam1, m.redTeam2, m.redTeam3,
                        m.blueTeam1, m.blueTeam2, m.blueTeam3,
                    ].filter(Boolean))
                ).size,
            });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (e) {
        console.error("RobotEvents API error:", e);
        return NextResponse.json({ error: "Failed to communicate with RobotEvents API" }, { status: 500 });
    }
}
