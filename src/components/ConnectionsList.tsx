"use client";

import { useState } from "react";
import Link from "next/link";
import { useChatContext } from "./ChatProvider";

type Team = {
  id: string;
  teamNumber: string;
  provinceState: string | null;
  country: string | null;
};

type ConnectionSent = {
  id: string;
  status: string;
  toTeam: Team;
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

/**
 * ==========================================
 * THE HOMIES LIST (CONNECTIONS DASHBOARD)
 * ==========================================
 * This component basically shows who we're cool with and who wants to be cool with us.
 * 
 * - Sent: requests we fired off
 * - Received: people sliding into our strategic DMs tbh
 * - Accepted: our trusted besties we actually share data with bc we ain't sharing 
 *   scouting info with ops lmao.
 */
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
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [confirmDisconnect, setConfirmDisconnect] = useState<{ connectionId: string; teamNumber: string } | null>(null);
  const { openChatWith, unreadByTeam } = useChatContext();

  async function acceptOrDeny(connectionId: string, action: "accept" | "deny") {
    // Lock the button down so users don't spam click it and break the db lol
    setProcessing(connectionId);
    try {
      await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, connectionId }),
      });
      // Just full reload baby, React state is too much work rn iykyk
      window.location.reload();
    } finally {
      setProcessing(null);
    }
  }

  async function handleDisconnect(connectionId: string) {
    setDisconnecting(connectionId);
    try {
      await fetch(`/api/connections?connectionId=${connectionId}`, {
        method: "DELETE",
      });
      window.location.reload();
    } finally {
      setDisconnecting(null);
      setConfirmDisconnect(null);
    }
  }

  const connectedTeams = accepted.map((c) =>
    c.fromTeamId === currentTeamId ? c.toTeam : c.fromTeam
  );

  // map team id to connection id so we can disconnect
  const teamToConnectionId: Record<string, string> = {};
  accepted.forEach((c) => {
    const team = c.fromTeamId === currentTeamId ? c.toTeam : c.fromTeam;
    teamToConnectionId[team.id] = c.id;
  });

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Pending Received */}
        <div className="card p-5">
          <h2 className="section-title mb-3">Pending Requests</h2>
          {received.filter((r) => r.status === "pending").length === 0 ? (
            <p className="text-sm text-txt-3">No pending requests.</p>
          ) : (
            <ul className="space-y-2">
              {received
                .filter((r) => r.status === "pending")
                .map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-line bg-surface-bg p-3"
                  >
                    <div>
                      <Link
                        href={`/dashboard/teams/${r.fromTeam.teamNumber}`}
                        className="font-mono font-medium text-spark hover:underline"
                      >
                        Team {r.fromTeam.teamNumber}
                      </Link>
                      <p className="text-[10px] text-txt-3 font-mono">
                        {[r.fromTeam.provinceState, r.fromTeam.country].filter(Boolean).join(", ") || "—"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptOrDeny(r.id, "accept")}
                        disabled={processing === r.id}
                        className="btn-primary text-xs !px-3 !py-1"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => acceptOrDeny(r.id, "deny")}
                        disabled={processing === r.id}
                        className="btn-ghost text-xs !px-3 !py-1"
                      >
                        Deny
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Sent */}
        <div className="card p-5">
          <h2 className="section-title mb-3">Sent Requests</h2>
          {sent.length === 0 ? (
            <p className="text-sm text-txt-3">No sent requests.</p>
          ) : (
            <ul className="space-y-2">
              {sent.map((s) => (
                <li
                  key={s.id}
                  className="rounded-[10px] border border-line bg-surface-bg p-3"
                >
                <Link
                  href={`/dashboard/teams/${s.toTeam.teamNumber}`}
                  className="font-mono font-medium text-spark hover:underline"
                >
                  Team {s.toTeam.teamNumber}
                </Link>
                <p className="text-[10px] text-txt-3 font-mono capitalize">{s.status}</p>
              </li>
              ))}
            </ul>
          )}
        </div>

        {/* Connected */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="section-title mb-1">Connected Teams</h2>
          <p className="text-xs text-txt-3 mb-3">Share strategy and scouting notes with connected teams.</p>
          {connectedTeams.length === 0 ? (
            <p className="text-sm text-txt-3">No connected teams yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {connectedTeams.map((t) => (
                <div key={t.id} className="inline-flex items-center rounded-[10px] border border-line bg-surface-bg overflow-hidden transition-all hover:border-line-hi group">
                  <Link
                    href={`/dashboard/teams/${t.teamNumber}`}
                    className="px-4 py-2 font-mono text-sm text-txt-2 group-hover:text-txt-1 border-r border-line"
                    title="View Profile"
                  >
                    Team {t.teamNumber}
                  </Link>
                  <button
                    onClick={() => openChatWith(t)}
                    className="relative px-3 py-2 text-txt-3 hover:text-txt-1 bg-surface-bg hover:bg-surface-hover transition-colors text-xs font-mono border-r border-line"
                    title="Open Chat"
                  >
                    Chat
                    {(unreadByTeam[t.id] || 0) > 0 && (
                      <span
                        className="absolute block rounded-full"
                        style={{
                          width: 8,
                          height: 8,
                          backgroundColor: "#EF4444",
                          top: 4,
                          right: 4,
                        }}
                      />
                    )}
                  </button>
                  <button
                    onClick={() => setConfirmDisconnect({ connectionId: teamToConnectionId[t.id], teamNumber: t.teamNumber })}
                    className="px-2.5 py-2 text-txt-3 hover:text-danger bg-surface-bg hover:bg-danger/10 transition-colors text-xs"
                    title="Disconnect"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Disconnect confirmation dialog */}
      {confirmDisconnect && (
        <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4" onClick={() => setConfirmDisconnect(null)}>
          <div className="bg-surface-card border border-line rounded-xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-mono font-bold text-sm text-txt-1 mb-3">
              Disconnect from Team {confirmDisconnect.teamNumber}?
            </h3>
            <p className="text-sm text-txt-2 mb-5">
              This will remove your connection and hide shared scouting data.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDisconnect(null)}
                className="btn-ghost text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDisconnect(confirmDisconnect.connectionId)}
                disabled={disconnecting === confirmDisconnect.connectionId}
                className="bg-danger hover:bg-danger/80 text-white text-xs font-mono px-4 py-2 rounded transition-colors"
              >
                {disconnecting ? "Removing..." : "Disconnect"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
