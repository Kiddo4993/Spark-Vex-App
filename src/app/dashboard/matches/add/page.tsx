import { prisma } from "@/lib/prisma";
import { AddMatchForm } from "@/components/AddMatchForm";
import Link from "next/link";

export default async function AddMatchPage() {
  const teams = (await prisma.team.findMany({
    where: { teamNumber: { not: "ADMIN" } },
    orderBy: { teamNumber: "asc" },
    select: { id: true, teamNumber: true },
  })).map((t) => ({
    id: t.id,
    teamNumber: t.teamNumber,
  }));

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/matches" className="text-txt-3 hover:text-txt-1 transition-colors text-sm">
          ← Matches
        </Link>
      </div>
      <div>
        <h1 className="page-title">Add Match</h1>
        <p className="page-subtitle">Record a new match result. Bayesian ratings will update automatically.</p>
      </div>
      <div className="card p-6">
        <AddMatchForm teams={teams} />
      </div>
    </div>
  );
}
