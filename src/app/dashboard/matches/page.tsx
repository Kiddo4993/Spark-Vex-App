import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function MatchesPage() {
  const session = await getServerSession(authOptions);
  const teamId = session?.user ? (session.user as { teamId: string }).teamId : null;

  const matches = await prisma.match.findMany({
    where: { uploaderId: teamId as string },
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Matches</h1>
          <p className="page-subtitle">{matches.length} matches recorded</p>
        </div>
        <div className="flex gap-2.5">
          <Link href="/dashboard/import" className="btn-ghost">↑ Import</Link>
          <Link href="/dashboard/matches/add" className="btn-primary">+ Add Match</Link>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="data-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Red Alliance</th>
              <th>Score</th>
              <th>Blue Alliance</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => {
              const date = new Date(m.date).toLocaleDateString();
              const redWon = m.redScore > m.blueScore;
              return (
                <tr key={m.id}>
                  <td className="font-medium">{m.eventName}</td>
                  <td className="text-txt-2 text-xs font-mono">{date}</td>
                  <td>
                    <span className={redWon ? "text-danger font-medium" : "text-txt-3"}>
                      {Array.from(new Set([m.redTeam1.teamNumber, m.redTeam2.teamNumber, m.redTeam3.teamNumber])).join(" · ")}
                    </span>
                  </td>
                  <td>
                    <span className={`font-mono text-sm font-bold ${redWon ? "text-txt-1" : "text-txt-3"}`}>
                      {m.redScore}
                    </span>
                  </td>
                  <td>
                    <span className={!redWon ? "text-cyan-500 font-medium" : "text-txt-3"}>
                      {Array.from(new Set([m.blueTeam1.teamNumber, m.blueTeam2.teamNumber, m.blueTeam3.teamNumber])).join(" · ")}
                    </span>
                  </td>
                  <td>
                    <span className={`font-mono text-sm font-bold ${!redWon ? "text-txt-1" : "text-txt-3"}`}>
                      {m.blueScore}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {matches.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-txt-3 text-sm mb-3">No matches yet.</p>
            <Link href="/dashboard/matches/add" className="btn-primary text-xs">+ Add Match</Link>
          </div>
        )}
      </div>
    </div>
  );
}
