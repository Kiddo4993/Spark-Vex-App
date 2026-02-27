"use client";

import { useState, useEffect } from "react";
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

import { ChatInterface } from "./ChatInterface";

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
  const [chatToTeam, setChatToTeam] = useState<Team | null>(null);
  const [unreadByTeam, setUnreadByTeam] = useState<Record<string, number>>({});

  // Poll for per-team unread messages
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch("/api/messages/unread-per-team");
        if (res.ok) {
          const data = await res.json();
          setUnreadByTeam(data.unreadByTeam || {});
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, []);

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
                  onClick={() => setChatToTeam(t)}
                  className="relative px-3 py-2 text-txt-3 hover:text-txt-1 bg-surface-bg hover:bg-surface-hover transition-colors"
                  title="Open Chat"
                >
                  💬
                  {unreadByTeam[t.id] > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-danger animate-pulse border border-surface-bg" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {chatToTeam && (
        <ChatInterface
          currentTeamId={currentTeamId}
          otherTeam={chatToTeam}
          onClose={() => setChatToTeam(null)}
        />
      )}
    </div>
  );
}
