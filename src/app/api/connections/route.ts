import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const actionSchema = z.object({ action: z.enum(["accept", "deny"]), connectionId: z.string() });

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const teamId = (session.user as { teamId: string }).teamId;

  const sent = await prisma.connection.findMany({
    where: { fromTeamId: teamId },
    include: { toTeam: { select: { id: true, teamNumber: true, provinceState: true, country: true } } },
  });
  const received = await prisma.connection.findMany({
    where: { toTeamId: teamId },
    include: { fromTeam: { select: { id: true, teamNumber: true, provinceState: true, country: true } } },
  });
  const accepted = await prisma.connection.findMany({
    where: {
      OR: [{ fromTeamId: teamId }, { toTeamId: teamId }],
      status: "accepted",
    },
    include: {
      fromTeam: { select: { id: true, teamNumber: true, provinceState: true } },
      toTeam: { select: { id: true, teamNumber: true, provinceState: true } },
    },
  });
  const connectedTeams = accepted.map((c) =>
    c.fromTeamId === teamId ? c.toTeam : c.fromTeam
  );
  return NextResponse.json({
    sent,
    received,
    accepted: accepted.map((c) => ({
      id: c.id,
      team: c.fromTeamId === teamId ? c.toTeam : c.fromTeam,
      status: c.status,
    })),
    connectedTeams,
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.teamId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const myTeamId = (session.user as { teamId: string }).teamId;

  try {
    const body = await req.json();
    if (body.action && body.connectionId) {
      const parsed = actionSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
      const conn = await prisma.connection.findFirst({
        where: { id: parsed.data.connectionId, toTeamId: myTeamId },
      });
      if (!conn) return NextResponse.json({ error: "Connection not found" }, { status: 404 });
      const status = parsed.data.action === "accept" ? "accepted" : "denied";
      await prisma.connection.update({ where: { id: conn.id }, data: { status } });
      return NextResponse.json({ ok: true, status });
    }

    const toTeamId = body.toTeamId as string;
    if (!toTeamId) return NextResponse.json({ error: "toTeamId required" }, { status: 400 });
    if (toTeamId === myTeamId) return NextResponse.json({ error: "Cannot connect to self" }, { status: 400 });

    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { fromTeamId: myTeamId, toTeamId: toTeamId },
          { fromTeamId: toTeamId, toTeamId: myTeamId },
        ],
      },
    });
    if (existing) {
      return NextResponse.json({ error: "Connection already exists", connection: existing }, { status: 409 });
    }
    const connection = await prisma.connection.create({
      data: { fromTeamId: myTeamId, toTeamId, status: "pending" },
    });
    return NextResponse.json(connection);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
