"use client";

import { useState } from "react";
import Link from "next/link";

type Team = {
  id: string;
  teamNumber: string;
  provinceState: string | null;
  country: string | null;
};

type ConnectionSent = {
  id: string;
  status: string;
  toTeam: { id: string; teamNumber: string; provinceState: string | null; country: string | null };
};

type ConnectionReceived = {
  id: string;
  status: string;
  fromTeam: Team;
};

type ConnectionAccepted = {
  id: string;
  fromTeamId: string;
  fromTeam: Team;
  toTeam: Team;
};

export function ConnectionsList({
  sent,
  received,
  accepted,
  currentTeamId,
}: {
  sent: ConnectionSent[];
  received: ConnectionReceived[];
  accepted: ConnectionAccepted[];
  currentTeamId: string;
}) {
  const [processing, setProcessing] = useState<string | null>(null);

  async function acceptOrDeny(connectionId: string, action: "accept" | "deny") {
    setProcessing(connectionId);
    try {
      await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, connectionId }),
      });
      window.location.reload();
    } finally {
      setProcessing(null);
    }
  }

  const connectedTeams = accepted.map((c) =>
    c.fromTeamId === currentTeamId ? c.toTeam : c.fromTeam
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card">
        <h2 className="text-lg font-semibold text-white">Pending (received)</h2>
        {received.filter((r) => r.status === "pending").length === 0 ? (
          <p className="mt-2 text-sm text-gray-400">No pending requests.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {received
              .filter((r) => r.status === "pending")
              .map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-vex-dark bg-vex-darker/50 p-3"
                >
                  <div>
                    <Link
                      href={`/dashboard/teams/${r.fromTeam.teamNumber}`}
                      className="font-medium text-vex-accent hover:underline"
                    >
                      Team {r.fromTeam.teamNumber}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {[r.fromTeam.provinceState, r.fromTeam.country].filter(Boolean).join(", ") || "—"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptOrDeny(r.id, "accept")}
                      disabled={processing === r.id}
                      className="rounded bg-vex-blue px-3 py-1 text-sm text-white hover:bg-vex-blue/90 disabled:opacity-50"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => acceptOrDeny(r.id, "deny")}
                      disabled={processing === r.id}
                      className="rounded border border-vex-dark px-3 py-1 text-sm text-gray-400 hover:bg-vex-dark disabled:opacity-50"
                    >
                      Deny
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
      <div className="card">
        <h2 className="text-lg font-semibold text-white">Sent</h2>
        {sent.length === 0 ? (
          <p className="mt-2 text-sm text-gray-400">No sent requests.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {sent.map((s) => (
              <li
                key={s.id}
                className="rounded-lg border border-vex-dark bg-vex-darker/50 p-3"
              >
                <Link
                  href={`/dashboard/teams/${s.toTeam.teamNumber}`}
                  className="font-medium text-vex-accent hover:underline"
                >
                  Team {s.toTeam.teamNumber}
                </Link>
                <p className="text-xs text-gray-500 capitalize">{s.status}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="card lg:col-span-2">
        <h2 className="text-lg font-semibold text-white">Connected teams</h2>
        <p className="mt-1 text-sm text-gray-400">Share strategy and scouting notes with connected teams.</p>
        {connectedTeams.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">No connected teams yet.</p>
        ) : (
          <ul className="mt-4 flex flex-wrap gap-2">
            {connectedTeams.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/dashboard/teams/${t.teamNumber}`}
                  className="inline-block rounded-lg border border-vex-dark bg-vex-darker/50 px-4 py-2 text-sm text-gray-200 hover:bg-vex-dark/60 hover:text-white"
                >
                  Team {t.teamNumber}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
