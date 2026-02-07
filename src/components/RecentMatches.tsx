"use client";

import Link from "next/link";

type Match = {
  id: string;
  eventName: string;
  date: string | Date;
  redScore: number;
  blueScore: number;
  redTeam1: { teamNumber: number };
  redTeam2: { teamNumber: number };
  redTeam3: { teamNumber: number };
  blueTeam1: { teamNumber: number };
  blueTeam2: { teamNumber: number };
  blueTeam3: { teamNumber: number };
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
      <div className="card">
        <h2 className="text-lg font-semibold text-white">Recent matches</h2>
        <p className="mt-2 text-sm text-gray-400">No matches yet. Add one to start tracking performance ratings.</p>
        <Link href="/dashboard/matches/add" className="mt-3 inline-block text-vex-accent hover:underline">
          Add match →
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Recent matches</h2>
        <Link href="/dashboard/matches" className="text-sm text-vex-accent hover:underline">
          View all
        </Link>
      </div>
      <ul className="mt-4 space-y-3">
        {matches.slice(0, 5).map((m) => {
          const date = new Date(m.date).toLocaleDateString();
          const redWon = m.redScore > m.blueScore;
          return (
            <li key={m.id} className="rounded-lg border border-vex-dark/80 bg-vex-darker/50 p-3">
              <p className="text-sm font-medium text-gray-300">{m.eventName}</p>
              <p className="text-xs text-gray-500">{date}</p>
              <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                <span className={redWon ? "font-semibold text-vex-red" : "text-gray-400"}>
                  Red {m.redTeam1.teamNumber}, {m.redTeam2.teamNumber}, {m.redTeam3.teamNumber} — {m.redScore}
                </span>
                <span className="text-gray-500">vs</span>
                <span className={!redWon ? "font-semibold text-vex-blue" : "text-gray-400"}>
                  Blue {m.blueTeam1.teamNumber}, {m.blueTeam2.teamNumber}, {m.blueTeam3.teamNumber} — {m.blueScore}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
