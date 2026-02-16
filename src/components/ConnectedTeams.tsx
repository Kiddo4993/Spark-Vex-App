// ConnectedTeams.tsx
"use client";

import Link from "next/link";

type Team = { id: string; teamNumber: string };

export function ConnectedTeams({ teams }: { teams: Team[] }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between border-b border-vex-border pb-3 mb-4">
        <h2 className="text-lg font-bold text-white">Connected Teams</h2>
        <Link href="/dashboard/connections" className="text-sm font-medium text-vex-accent hover:text-white transition-colors">
          Manage
        </Link>
      </div>
      {teams.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-sm text-gray-500">No connected teams yet. Search and send requests to share notes.</p>
          <Link href="/dashboard/connections" className="btn-secondary mt-4 w-full text-center inline-block">
            Find teams
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {teams.map((t) => (
            <li key={t.id}>
              <Link
                href={`/dashboard/teams?teamNumber=${t.teamNumber}`}
                className="flex items-center justify-between rounded-md border border-vex-border bg-vex-darker px-4 py-3 text-sm font-medium text-gray-300 transition-all duration-200 hover:border-vex-accent/50 hover:bg-vex-surface hover:text-white"
              >
                <span>Team {t.teamNumber}</span>
                <span className="text-vex-accent opacity-0 transition-opacity group-hover:opacity-100">View →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
