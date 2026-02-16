import { prisma } from "@/lib/prisma";
import { AddMatchForm } from "@/components/AddMatchForm";
import Link from "next/link";

export default async function AddMatchPage() {
  const teams = (await prisma.team.findMany({
    orderBy: { teamNumber: "asc" },
    select: { id: true, teamNumber: true, performanceRating: true },
  })).map((t) => ({
    id: t.id,
    teamNumber: t.teamNumber,
    label: `${t.teamNumber} (Rating: ${Math.round(t.performanceRating)})`,
  }));

  return (
    <div className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex items-center gap-4 border-b border-warm-200 pb-6">
        <Link href="/" className="text-warm-500 hover:text-vex-blue font-bold uppercase tracking-widest text-xs transition-colors">
          ← Back Home
        </Link>
        <h1 className="text-3xl font-graffiti text-warm-900 tracking-widest">
          ADD MATCH
        </h1>
      </div>

      <div className="bg-white rounded-2xl border-2 border-warm-200 p-6 md:p-10 shadow-xl">
        <AddMatchForm teams={teams} />
      </div>

      <div className="p-6 bg-vex-red/5 rounded-xl border border-vex-red/20 text-center">
        <p className="text-xs text-warm-600 italic">
          Match data is contributed by the community to improve global team rankings. No sign-in required.
        </p>
      </div>
    </div>
  );
}
