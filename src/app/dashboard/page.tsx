import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { confidenceFromUncertainty } from "@/lib/elo";
import Link from "next/link";
import { DashboardCards } from "@/components/DashboardCards";
import { RecentMatches } from "@/components/RecentMatches";
import { ConnectedTeams } from "@/components/ConnectedTeams";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const teamId = (session.user as { teamId: string }).teamId;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      skillsRecords: { orderBy: { lastUpdated: "desc" }, take: 1 },
      ratingHistory: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!team) return <p className="text-gray-400">Team not found</p>;

  const skills = team.skillsRecords[0] ?? null;
  const confidence = confidenceFromUncertainty(team.uncertainty);

  const recentMatches = await prisma.match.findMany({
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
    take: 10,
    include: {
      redTeam1: { select: { teamNumber: true } },
      redTeam2: { select: { teamNumber: true } },
      redTeam3: { select: { teamNumber: true } },
      blueTeam1: { select: { teamNumber: true } },
      blueTeam2: { select: { teamNumber: true } },
      blueTeam3: { select: { teamNumber: true } },
    },
  });

  const connections = await prisma.connection.findMany({
    where: {
      OR: [{ fromTeamId: teamId }, { toTeamId: teamId }],
      status: "accepted",
    },
    include: {
      fromTeam: { select: { id: true, teamNumber: true } },
      toTeam: { select: { id: true, teamNumber: true } },
    },
  });
  const connectedTeams = connections.map((c) =>
    c.fromTeamId === teamId ? c.toTeam : c.fromTeam
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <Link href="/dashboard/matches/add" className="btn-primary">
          Add match
        </Link>
      </div>

      <DashboardCards
        team={team}
        skills={skills}
        confidence={confidence}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentMatches matches={recentMatches} currentTeamId={teamId} />
        <ConnectedTeams teams={connectedTeams} />
      </div>
    </div>
  );
}
