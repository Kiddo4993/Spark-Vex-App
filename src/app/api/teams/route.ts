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
    const team = await prisma.team.findFirst({
      where: { teamNumber: { equals: teamNumber, mode: "insensitive" } },
    });
    if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
    return NextResponse.json(team);
  }

  if (search && search.length >= 1) {
    const searchTeams = await prisma.team.findMany({
      where: {
        AND: [
          { teamNumber: { not: "ADMIN" } },
          {
            OR: [
              { teamNumber: { contains: search, mode: "insensitive" } },
              { provinceState: { contains: search, mode: "insensitive" } },
              { country: { contains: search, mode: "insensitive" } },
            ],
          },
        ],
      },
      take: 50,
    });
    return NextResponse.json(searchTeams);
  }

  const allTeams = await prisma.team.findMany({
    where: { teamNumber: { not: "ADMIN" } },
    take: 50, // optional: limit to first 50 for performance
  });

  return NextResponse.json(allTeams);
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
