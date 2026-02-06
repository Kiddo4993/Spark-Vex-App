import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateTeamSchema = z.object({
  provinceState: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  drivetrainType: z.string().optional().nullable(),
  autonomousSide: z.string().optional().nullable(),
  autonReliabilityPct: z.number().min(0).max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
  strategyTags: z.array(z.string()).optional(),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const teamNumber = searchParams.get("teamNumber");
  const search = searchParams.get("search");

  if (teamNumber) {
    const team = await prisma.team.findUnique({
      where: { teamNumber: parseInt(teamNumber, 10) },
      include: {
        skillsRecords: { orderBy: { lastUpdated: "desc" }, take: 1 },
        _count: { select: { teamMatchStats: true } },
      },
    });
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
    const { skillsRecords, _count, ...rest } = team;
    const skills = skillsRecords[0] ?? null;
    return NextResponse.json({
      ...rest,
      skills,
      matchesPlayed: _count.teamMatchStats,
    });
  }

  if (search && search.length >= 1) {
    const num = parseInt(search, 10);
    const searchTeams = await prisma.team.findMany({
      where: Number.isNaN(num) ? {} : { teamNumber: num },
      take: 30,
      include: { skillsRecords: { orderBy: { lastUpdated: "desc" }, take: 1 } },
    });
    return NextResponse.json(searchTeams);
  }

  if (!session?.user?.teamId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const myTeam = await prisma.team.findUnique({
    where: { id: (session.user as { teamId: string }).teamId },
    include: {
      skillsRecords: { orderBy: { lastUpdated: "desc" }, take: 1 },
      ratingHistory: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
  if (!myTeam) return NextResponse.json({ error: "Team not found" }, { status: 404 });
  return NextResponse.json(myTeam);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const parsed = updateTeamSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const team = await prisma.team.update({
      where: { id: (session.user as { teamId: string }).teamId },
      data: parsed.data,
    });
    return NextResponse.json(team);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
