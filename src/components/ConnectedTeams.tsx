"use client";

import Link from "next/link";

type Team = { id: string; teamNumber: string };

export function ConnectedTeams({ teams }: { teams: Team[] }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="section-title">Connected Teams</div>
        <Link href="/dashboard/connections" className="text-xs font-mono text-spark hover:text-txt-1 transition-colors">
          Manage →
        </Link>
      </div>
      <div className="card-body">
        {teams.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-sm text-txt-3 mb-3">No connected teams yet.</p>
            <Link href="/dashboard/connections" className="btn-ghost text-xs">
              Find teams
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {teams.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/dashboard/teams?teamNumber=${t.teamNumber}`}
                  className="flex items-center justify-between rounded-[10px] border border-line bg-surface-bg px-4 py-2.5 text-sm font-medium text-txt-2 transition-all hover:border-line-hi hover:bg-surface-hover hover:text-txt-1"
                >
                  <span className="font-mono">Team {t.teamNumber}</span>
                  <span className="text-spark text-xs">View →</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
