import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { computeAllianceEloUpdates, uncertainty as uncertaintyFn, UNCERTAINTY_BASE } from "@/lib/elo";

const createMatchSchema = z.object({
  eventName: z.string().min(1),
  date: z.string().datetime().or(z.string()),
  redTeam1Id: z.string(),
  redTeam2Id: z.string(),
  redTeam3Id: z.string(),
  blueTeam1Id: z.string(),
  blueTeam2Id: z.string(),
  blueTeam3Id: z.string(),
  redScore: z.number().int().min(0),
  blueScore: z.number().int().min(0),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10) || 20);

  if (teamId) {
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { redTeam1Id: teamId },
          { redTeam2Id: teamId },
          { redTeam3Id: teamId },
          { blueTeam1Id: teamId },
          { blueTeam2Id: teamId },
          { blueTeam3Id: teamId },
        ],
      },
      orderBy: { date: "desc" },
      take: limit,
      include: {
        redTeam1: { select: { id: true, teamNumber: true } },
        redTeam2: { select: { id: true, teamNumber: true } },
        redTeam3: { select: { id: true, teamNumber: true } },
        blueTeam1: { select: { id: true, teamNumber: true } },
        blueTeam2: { select: { id: true, teamNumber: true } },
        blueTeam3: { select: { id: true, teamNumber: true } },
      },
    });
    return NextResponse.json(matches);
  }

  const myTeamId = session?.user ? (session.user as { teamId: string }).teamId : null;
  const matches = await prisma.match.findMany({
    orderBy: { date: "desc" },
    take: limit,
    include: {
      redTeam1: { select: { id: true, teamNumber: true } },
      redTeam2: { select: { id: true, teamNumber: true } },
      redTeam3: { select: { id: true, teamNumber: true } },
      blueTeam1: { select: { id: true, teamNumber: true } },
      blueTeam2: { select: { id: true, teamNumber: true } },
      blueTeam3: { select: { id: true, teamNumber: true } },
    },
  });
  return NextResponse.json(matches);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = createMatchSchema.safeParse({
      ...body,
      date: typeof body.date === "string" && !body.date.includes("T") ? `${body.date}T12:00:00Z` : body.date,
    });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const {
      eventName,
      date,
      redTeam1Id,
      redTeam2Id,
      redTeam3Id,
      blueTeam1Id,
      blueTeam2Id,
      blueTeam3Id,
      redScore,
      blueScore,
    } = parsed.data;

    const [red1, red2, red3] = await Promise.all([
      prisma.team.findUnique({ where: { id: redTeam1Id } }),
      prisma.team.findUnique({ where: { id: redTeam2Id } }),
      prisma.team.findUnique({ where: { id: redTeam3Id } }),
    ]);
    const [blue1, blue2, blue3] = await Promise.all([
      prisma.team.findUnique({ where: { id: blueTeam1Id } }),
      prisma.team.findUnique({ where: { id: blueTeam2Id } }),
      prisma.team.findUnique({ where: { id: blueTeam3Id } }),
    ]);
    const redTeams = [red1, red2, red3].filter((t): t is NonNullable<typeof t> => t != null);
    const blueTeams = [blue1, blue2, blue3].filter((t): t is NonNullable<typeof t> => t != null);
    if (redTeams.length !== 3 || blueTeams.length !== 3) {
      return NextResponse.json({ error: "Invalid team IDs" }, { status: 400 });
    }

    const redRatings: [number, number, number] = [
      redTeams[0].rating,
      redTeams[1].rating,
      redTeams[2].rating,
    ];
    const blueRatings: [number, number, number] = [
      blueTeams[0].rating,
      blueTeams[1].rating,
      blueTeams[2].rating,
    ];

    const redWins = redScore > blueScore;
    const { winning, losing } = redWins
      ? computeAllianceEloUpdates(redRatings, blueRatings)
      : computeAllianceEloUpdates(blueRatings, redRatings);

    const matchDate = new Date(date);
    const match = await prisma.match.create({
      data: {
        eventName,
        date: matchDate,
        redTeam1Id,
        redTeam2Id,
        redTeam3Id,
        blueTeam1Id,
        blueTeam2Id,
        blueTeam3Id,
        redScore,
        blueScore,
      },
    });

    const updates = redWins
      ? [
          ...winning.map((u, i) => ({ team: redTeams[i], ...u })),
          ...losing.map((u, i) => ({ team: blueTeams[i], ...u })),
        ]
      : [
          ...losing.map((u, i) => ({ team: redTeams[i], ...u })),
          ...winning.map((u, i) => ({ team: blueTeams[i], ...u })),
        ];

    for (const { team, ratingAfter } of updates) {
      const newMatchesPlayed = team.matchesPlayed + 1;
      const newUncertainty = uncertaintyFn(newMatchesPlayed, UNCERTAINTY_BASE);
      await prisma.team.update({
        where: { id: team.id },
        data: {
          rating: ratingAfter,
          matchesPlayed: newMatchesPlayed,
          uncertainty: newUncertainty,
        },
      });
      await prisma.ratingHistory.create({
        data: {
          teamId: team.id,
          rating: ratingAfter,
          uncertainty: newUncertainty,
          matchId: match.id,
        },
      });
    }

    const redStats = redWins ? winning : losing;
    const blueStats = redWins ? losing : winning;
    const redActual = redWins ? 1 : 0;
    const blueActual = redWins ? 0 : 1;
    for (let i = 0; i < 3; i++) {
      await prisma.teamMatchStats.create({
        data: {
          matchId: match.id,
          teamId: redTeams[i].id,
          alliance: "red",
          score: redScore,
          ratingBefore: redTeams[i].rating,
          ratingAfter: (redWins ? winning[i] : losing[i]).ratingAfter,
          expectedScore: (redWins ? winning[i] : losing[i]).expectedScore,
          actualScore: redActual,
        },
      });
      await prisma.teamMatchStats.create({
        data: {
          matchId: match.id,
          teamId: blueTeams[i].id,
          alliance: "blue",
          score: blueScore,
          ratingBefore: blueTeams[i].rating,
          ratingAfter: (redWins ? losing[i] : winning[i]).ratingAfter,
          expectedScore: (redWins ? losing[i] : winning[i]).expectedScore,
          actualScore: blueActual,
        },
      });
    }

    return NextResponse.json(match);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Create match failed" }, { status: 500 });
  }
}
