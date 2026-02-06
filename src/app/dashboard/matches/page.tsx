import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function MatchesPage() {
  const session = await getServerSession(authOptions);
  const teamId = session?.user ? (session.user as { teamId: string }).teamId : null;

  const matches = await prisma.match.findMany({
    orderBy: { date: "desc" },
    take: 50,
    include: {
      redTeam1: { select: { teamNumber: true } },
      redTeam2: { select: { teamNumber: true } },
      redTeam3: { select: { teamNumber: true } },
      blueTeam1: { select: { teamNumber: true } },
      blueTeam2: { select: { teamNumber: true } },
      blueTeam3: { select: { teamNumber: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Matches</h1>
        <Link href="/dashboard/matches/add" className="btn-primary">
          Add match
        </Link>
      </div>
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-vex-dark bg-vex-dark/40">
                <th className="px-4 py-3 font-medium text-gray-300">Event</th>
                <th className="px-4 py-3 font-medium text-gray-300">Date</th>
                <th className="px-4 py-3 font-medium text-gray-300">Red</th>
                <th className="px-4 py-3 font-medium text-gray-300">Score</th>
                <th className="px-4 py-3 font-medium text-gray-300">Blue</th>
                <th className="px-4 py-3 font-medium text-gray-300">Score</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => {
                const date = new Date(m.date).toLocaleDateString();
                const redWon = m.redScore > m.blueScore;
                return (
                  <tr key={m.id} className="border-b border-vex-dark/60 hover:bg-vex-dark/30">
                    <td className="px-4 py-3 text-gray-200">{m.eventName}</td>
                    <td className="px-4 py-3 text-gray-400">{date}</td>
                    <td className="px-4 py-3">
                      <span className={redWon ? "font-medium text-vex-red" : "text-gray-400"}>
                        {m.redTeam1.teamNumber}, {m.redTeam2.teamNumber}, {m.redTeam3.teamNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{m.redScore}</td>
                    <td className="px-4 py-3">
                      <span className={!redWon ? "font-medium text-vex-blue" : "text-gray-400"}>
                        {m.blueTeam1.teamNumber}, {m.blueTeam2.teamNumber}, {m.blueTeam3.teamNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{m.blueScore}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {matches.length === 0 && (
          <p className="p-6 text-center text-gray-400">No matches yet. Add one to get started.</p>
        )}
      </div>
    </div>
  );
}
