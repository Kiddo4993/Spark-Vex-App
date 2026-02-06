import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { computeSkillsRanks } from "@/lib/skills";

const updateSkillsSchema = z.object({
  driverSkillsScore: z.number().int().min(0).optional().nullable(),
  autonomousSkillsScore: z.number().int().min(0).optional().nullable(),
  combinedSkillsScore: z.number().int().min(0).optional().nullable(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId");

  const records = await prisma.skillsRecord.findMany({
    include: { team: { select: { id: true, teamNumber: true, provinceState: true } } },
    orderBy: { lastUpdated: "desc" },
  });
  const byTeam = new Map<string, typeof records[0]>();
  for (const r of records) {
    if (!byTeam.has(r.teamId)) byTeam.set(r.teamId, r);
  }
  const teamsWithSkills = await prisma.team.findMany({
    where: { id: { in: Array.from(byTeam.keys()) } },
    select: { id: true, teamNumber: true, provinceState: true },
  });
  const skillsInput = teamsWithSkills.map((t) => {
    const rec = byTeam.get(t.id);
    return {
      teamId: t.id,
      provinceState: t.provinceState,
      driverSkillsScore: rec?.driverSkillsScore ?? null,
      autonomousSkillsScore: rec?.autonomousSkillsScore ?? null,
      combinedSkillsScore: rec?.combinedSkillsScore ?? null,
    };
  });
  const ranks = computeSkillsRanks(skillsInput);

  if (teamId) {
    const rec = byTeam.get(teamId) ?? await prisma.skillsRecord.findFirst({
      where: { teamId },
      orderBy: { lastUpdated: "desc" },
    });
    const team = await prisma.team.findUnique({ where: { id: teamId }, select: { teamNumber: true, provinceState: true } });
    const rank = ranks.get(teamId);
    return NextResponse.json({
      record: rec,
      team,
      worldwideRank: rank?.worldwideRank ?? null,
      provincialRank: rank?.provincialRank ?? null,
    });
  }

  const leaderboard = Array.from(ranks.entries()).map(([tid, r]) => ({
    teamId: tid,
    ...byTeam.get(tid),
    worldwideRank: r.worldwideRank,
    provincialRank: r.provincialRank,
  }));
  leaderboard.sort((a, b) => (a.worldwideRank ?? 999) - (b.worldwideRank ?? 999));
  return NextResponse.json(leaderboard);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = updateSkillsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const teamId = (session.user as { teamId: string }).teamId;
    const existing = await prisma.skillsRecord.findFirst({
      where: { teamId },
      orderBy: { lastUpdated: "desc" },
    });
    if (existing) {
      const updated = await prisma.skillsRecord.update({
        where: { id: existing.id },
        data: { ...parsed.data, lastUpdated: new Date() },
      });
      return NextResponse.json(updated);
    }
    const created = await prisma.skillsRecord.create({
      data: { teamId, ...parsed.data },
    });
    return NextResponse.json(created);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Update skills failed" }, { status: 500 });
  }
}
