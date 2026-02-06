import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createNoteSchema = z.object({
  toTeamId: z.string(),
  type: z.enum(["strategy", "scouting"]),
  content: z.string().min(1),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const teamId = (session.user as { teamId: string }).teamId;

  const sent = await prisma.note.findMany({
    where: { fromTeamId: teamId },
    include: { toTeam: { select: { id: true, teamNumber: true } } },
    orderBy: { createdAt: "desc" },
  });
  const received = await prisma.note.findMany({
    where: { toTeamId: teamId },
    include: { fromTeam: { select: { id: true, teamNumber: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ sent, received });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const fromTeamId = (session.user as { teamId: string }).teamId;

  try {
    const body = await req.json();
    const parsed = createNoteSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const conn = await prisma.connection.findFirst({
      where: {
        OR: [
          { fromTeamId, toTeamId: parsed.data.toTeamId, status: "accepted" },
          { fromTeamId: parsed.data.toTeamId, toTeamId: fromTeamId, status: "accepted" },
        ],
      },
    });
    if (!conn) return NextResponse.json({ error: "Team not connected" }, { status: 403 });
    const note = await prisma.note.create({
      data: { fromTeamId, toTeamId: parsed.data.toTeamId, type: parsed.data.type, content: parsed.data.content },
    });
    return NextResponse.json(note);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Create note failed" }, { status: 500 });
  }
}
