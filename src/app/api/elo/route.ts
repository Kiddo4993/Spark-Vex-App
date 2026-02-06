import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const teamId = searchParams.get("teamId") ?? (session?.user ? (session.user as { teamId: string }).teamId : null);

  if (!teamId) {
    const teams = await prisma.team.findMany({
      orderBy: { rating: "desc" },
      take: 100,
      select: {
        id: true,
        teamNumber: true,
        rating: true,
        uncertainty: true,
        matchesPlayed: true,
      },
    });
    return NextResponse.json(teams);
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: {
      id: true,
      teamNumber: true,
      rating: true,
      uncertainty: true,
      matchesPlayed: true,
      ratingHistory: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });
  return NextResponse.json(team);
}
