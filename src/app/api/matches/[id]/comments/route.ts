import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createCommentSchema = z.object({ content: z.string().min(1) });

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comments = await prisma.matchComment.findMany({
    where: { matchId: id },
    include: { team: { select: { id: true, teamNumber: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(comments);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const teamId = (session.user as { teamId: string }).teamId;

  const match = await prisma.match.findUnique({
    where: { id },
    select: {
      redTeam1Id: true,
      redTeam2Id: true,
      redTeam3Id: true,
      blueTeam1Id: true,
      blueTeam2Id: true,
      blueTeam3Id: true,
    },
  });
  if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });
  const teamIds = [
    match.redTeam1Id,
    match.redTeam2Id,
    match.redTeam3Id,
    match.blueTeam1Id,
    match.blueTeam2Id,
    match.blueTeam3Id,
  ];
  if (!teamIds.includes(teamId)) {
    return NextResponse.json({ error: "Your team was not in this match" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const comment = await prisma.matchComment.create({
      data: { matchId: id, teamId, content: parsed.data.content },
      include: { team: { select: { id: true, teamNumber: true } } },
    });
    return NextResponse.json(comment);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Create comment failed" }, { status: 500 });
  }
}
