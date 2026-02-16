import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { computeBayesianMatchUpdate, K, W, U_MATCH, U_MIN } from "@/lib/bayesian";

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
  // Allow public match submission for community data contribution
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
    const redTeamsRaw = [red1, red2, red3].filter((t): t is NonNullable<typeof t> => t != null);
    const blueTeamsRaw = [blue1, blue2, blue3].filter((t): t is NonNullable<typeof t> => t != null);

    if (redTeamsRaw.length !== 3 || blueTeamsRaw.length !== 3) {
      return NextResponse.json({ error: "Invalid team IDs" }, { status: 400 });
    }

    // Map to Bayesian Input
    const redTeams = redTeamsRaw.map(t => ({ id: t.id, rating: t.performanceRating, uncertainty: t.ratingUncertainty }));
    const blueTeams = blueTeamsRaw.map(t => ({ id: t.id, rating: t.performanceRating, uncertainty: t.ratingUncertainty }));

    const redWins = redScore > blueScore;
    const { winning, losing } = redWins
      ? computeBayesianMatchUpdate(redTeams, blueTeams, { k: K, w: W, uMatch: U_MATCH, uMin: U_MIN })
      : computeBayesianMatchUpdate(blueTeams, redTeams, { k: K, w: W, uMatch: U_MATCH, uMin: U_MIN });

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
    }

    // Create TeamMatchStats
    // We iterate over the computed updates to easily get the calculated values
    for (const update of allUpdates) {
      const isRed = [redTeam1Id, redTeam2Id, redTeam3Id].includes(update.teamId);
      await prisma.teamMatchStats.create({
        data: {
          matchId: match.id,
          teamId: update.teamId,
          alliance: isRed ? "red" : "blue",
          score: isRed ? redScore : blueScore,
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

    return NextResponse.json(match);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Create match failed" }, { status: 500 });
  }
}
