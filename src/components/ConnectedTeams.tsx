"use client";

import Link from "next/link";

type Team = { id: string; teamNumber: number };

export function ConnectedTeams({ teams }: { teams: Team[] }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Connected teams</h2>
        <Link href="/dashboard/connections" className="text-sm text-vex-accent hover:underline">
          Manage
        </Link>
      </div>
      {teams.length === 0 ? (
        <>
          <p className="mt-4 text-sm text-gray-400">No connected teams. Search and send requests to share notes.</p>
          <Link href="/dashboard/connections" className="mt-2 inline-block text-vex-accent hover:underline">
            Find teams →
          </Link>
        </>
      ) : (
        <ul className="mt-4 space-y-2">
          {teams.map((t) => (
            <li key={t.id}>
              <Link
                href={`/dashboard/teams?teamNumber=${t.teamNumber}`}
                className="block rounded-lg border border-vex-dark/80 bg-vex-darker/50 px-3 py-2 text-sm text-gray-200 hover:bg-vex-dark/60 hover:text-white"
              >
                Team {t.teamNumber}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
