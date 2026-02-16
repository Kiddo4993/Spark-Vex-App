import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConnectionsList } from "@/components/ConnectionsList";
import { SearchAndRequest } from "@/components/SearchAndRequest";

export default async function ConnectionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
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
      fromTeam: { select: { id: true, teamNumber: true, provinceState: true, country: true } },
      toTeam: { select: { id: true, teamNumber: true, provinceState: true, country: true } },
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Connections</h1>
        <p className="page-subtitle">Manage team connections and share scouting data.</p>
      </div>
      <SearchAndRequest currentTeamId={teamId} />
      <ConnectionsList
        sent={sent}
        received={received}
        accepted={accepted}
        currentTeamId={teamId}
      />
    </div>
  );
}
