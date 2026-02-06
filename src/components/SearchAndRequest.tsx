"use client";

import { useState } from "react";

export function SearchAndRequest({ currentTeamId }: { currentTeamId: string }) {
  const [search, setSearch] = useState("");
  const [teams, setTeams] = useState<Array<{ id: string; teamNumber: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function doSearch() {
    if (!search.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/teams?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setTeams(data.filter((t: { id: string }) => t.id !== currentTeamId));
      }
    } finally {
      setLoading(false);
    }
  }

  async function sendRequest(toTeamId: string) {
    setSending(toTeamId);
    setMessage("");
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toTeamId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Request sent.");
        setTeams((prev) => prev.filter((t) => t.id !== toTeamId));
      } else {
        setMessage(data.error ?? "Failed to send request.");
      }
    } finally {
      setSending(null);
    }
  }

  return (
    <div className="card max-w-xl">
      <h2 className="text-lg font-semibold text-white">Find teams & send connection request</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && doSearch()}
          placeholder="Team number"
          className="input max-w-[200px]"
        />
        <button type="button" onClick={doSearch} className="btn-secondary" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </div>
      {message && <p className="mt-2 text-sm text-vex-accent">{message}</p>}
      {teams.length > 0 && (
        <ul className="mt-4 space-y-2">
          {teams.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between rounded-lg border border-vex-dark bg-vex-darker/50 px-3 py-2"
            >
              <span className="font-medium text-white">Team {t.teamNumber}</span>
              <button
                type="button"
                onClick={() => sendRequest(t.id)}
                disabled={sending === t.id}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {sending === t.id ? "Sending…" : "Send request"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
