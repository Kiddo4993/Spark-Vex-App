import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TeamsSearch } from "@/components/TeamsSearch";
import Link from "next/link";

export default async function TeamsPage() {
  const session = await getServerSession(authOptions);
  const teamId = session?.user ? (session.user as { teamId: string }).teamId : null;

  const teams = await prisma.team.findMany({
    orderBy: { teamNumber: "asc" },
    take: 100,
    include: { skillsRecords: { orderBy: { lastUpdated: "desc" }, take: 1 } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Teams</h1>
      <TeamsSearch initialTeams={teams} currentTeamId={teamId} />
    </div>
  );
}
