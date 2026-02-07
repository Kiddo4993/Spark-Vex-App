import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddMatchForm } from "@/components/AddMatchForm";
import Link from "next/link";

export default async function AddMatchPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const teamId = (session.user as { teamId: string }).teamId;

  const teams = (await prisma.team.findMany({
    orderBy: { teamNumber: "asc" },
    select: { id: true, teamNumber: true, performanceRating: true },
  })).map((t) => ({
    id: t.id,
    teamNumber: t.teamNumber,
    label: `${t.teamNumber} (Rating: ${Math.round(t.performanceRating)})`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/matches" className="text-gray-400 hover:text-white">
          ← Matches
        </Link>
        <h1 className="text-2xl font-bold text-white">Add match</h1>
      </div>
      <AddMatchForm teams={teams} />
    </div>
  );
}
