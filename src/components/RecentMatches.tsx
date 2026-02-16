// RecentMatches.tsx
"use client";

import Link from "next/link";

type Match = {
  id: string;
  eventName: string;
  date: string | Date;
  redScore: number;
  blueScore: number;
  redTeam1: { teamNumber: string };
  redTeam2: { teamNumber: string };
  redTeam3: { teamNumber: string };
  blueTeam1: { teamNumber: string };
  blueTeam2: { teamNumber: string };
  blueTeam3: { teamNumber: string };
};

export function RecentMatches({
  matches,
  currentTeamId,
}: {
  matches: Match[];
  currentTeamId: string;
}) {
  if (matches.length === 0) {
    return (
      <div className="card text-center py-12">
        <h2 className="text-xl font-bold text-white tracking-wide uppercase mb-4">Recent Matches</h2>
        <p className="text-sm text-gray-400 mb-6">No matches analyzed yet. Contribute data to start tracking performance ratings.</p>
        <Link href="/dashboard/matches/add" className="btn-primary">
          Add Match
        </Link>
      </div>
    );
  }

  return (
    <div className="card h-fit">
      <div className="flex items-center justify-between border-b border-vex-border pb-6 mb-6">
        <h2 className="text-xl font-bold text-white tracking-wide uppercase">Matches</h2>
        <Link href="/dashboard/matches" className="text-xs font-bold text-vex-accent hover:text-white transition-colors uppercase tracking-widest">
          View all →
        </Link>
      </div>

      <div className="mb-6">
        <Link href="/dashboard/matches/add" className="btn-primary w-full text-center py-3 text-xs font-bold tracking-widest">
          ADD MATCH
        </Link>
      </div>

      <ul className="space-y-3">
        {matches.slice(0, 5).map((m) => {
          const date = new Date(m.date).toLocaleDateString();
          const redWon = m.redScore > m.blueScore;
          return (
            <li key={m.id} className="rounded-lg border border-vex-border bg-vex-darker p-4 transition-all duration-200 hover:border-vex-accent/30 hover:bg-vex-surface">
              <div className="flex justify-between items-start mb-3">
                <p className="text-sm font-bold text-white leading-snug truncate pr-2">{m.eventName}</p>
                <p className="text-xs text-gray-500 font-medium tabular-nums whitespace-nowrap">{date}</p>
              </div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
                <div className={`flex flex-col ${redWon ? "opacity-100" : "opacity-60"}`}>
                  <span className="text-vex-red text-[10px] uppercase tracking-wider font-bold mb-0.5">Red</span>
                  <span className="flex items-end gap-1">
                    <span className="text-lg font-bold text-white leading-none">{m.redScore}</span>
                  </span>
                  <span className="text-[10px] text-gray-400 truncate mt-1">
                    {m.redTeam1.teamNumber}, {m.redTeam2.teamNumber}, {m.redTeam3.teamNumber}
                  </span>
                </div>

                <div className="text-gray-600 font-light text-xs px-2">vs</div>

                <div className={`flex flex-col text-right ${!redWon ? "opacity-100" : "opacity-60"}`}>
                  <span className="text-vex-blue text-[10px] uppercase tracking-wider font-bold mb-0.5">Blue</span>
                  <span className="flex items-end gap-1 justify-end">
                    <span className="text-lg font-bold text-white leading-none">{m.blueScore}</span>
                  </span>
                  <span className="text-[10px] text-gray-400 truncate mt-1">
                    {m.blueTeam1.teamNumber}, {m.blueTeam2.teamNumber}, {m.blueTeam3.teamNumber}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
