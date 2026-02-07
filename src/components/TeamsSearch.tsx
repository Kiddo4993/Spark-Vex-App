"use client";

import { useState } from "react";
import Link from "next/link";

type Team = {
  id: string;
  teamNumber: number;
  provinceState: string | null;
  country: string | null;
  performanceRating: number;
  ratingUncertainty: number;
  matchCount: number;
  skillsRecords: Array<{
    combinedSkillsScore: number | null;
    driverSkillsScore: number | null;
    autonomousSkillsScore: number | null;
  }> | null;
};

export function TeamsSearch({
  initialTeams,
  currentTeamId,
}: {
  initialTeams: Team[];
  currentTeamId: string | null;
}) {
  const [search, setSearch] = useState("");
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [loading, setLoading] = useState(false);

  async function doSearch() {
    if (!search.trim()) {
      setTeams(initialTeams);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/teams?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (Array.isArray(data)) setTeams(data);
    } finally {
      setLoading(false);
    }
  }

  const filtered =
    search.trim().length < 2
      ? teams
      : teams.filter(
        (t) =>
          t.teamNumber.toString().includes(search) ||
          (t.provinceState?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
          (t.country?.toLowerCase().includes(search.toLowerCase()) ?? false)
      );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && doSearch()}
          placeholder="Team number or region"
          className="input max-w-xs"
        />
        <button type="button" onClick={doSearch} className="btn-secondary" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </div>
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-vex-dark bg-vex-dark/40">
                <th className="px-4 py-3 font-medium text-gray-300">Team</th>
                <th className="px-4 py-3 font-medium text-gray-300">Region</th>
                <th className="px-4 py-3 font-medium text-gray-300">Rating</th>
                <th className="px-4 py-3 font-medium text-gray-300">Matches</th>
                <th className="px-4 py-3 font-medium text-gray-300">Skills</th>
                <th className="px-4 py-3 font-medium text-gray-300"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const skills = t.skillsRecords?.[0];
                return (
                  <tr key={t.id} className="border-b border-vex-dark/60 hover:bg-vex-dark/30">
                    <td className="px-4 py-3 font-medium text-white">{t.teamNumber}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {[t.provinceState, t.country].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-200">{Math.round(t.performanceRating)}</td>
                    <td className="px-4 py-3 text-gray-400">{t.matchCount}</td>
                    <td className="px-4 py-3 text-gray-400">{skills?.combinedSkillsScore ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/teams/${t.teamNumber}`}
                        className="text-vex-accent hover:underline"
                      >
                        View
                      </Link>
                      {t.id === currentTeamId && (
                        <span className="ml-2 text-xs text-gray-500">(you)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="p-6 text-center text-gray-400">No teams found.</p>
        )}
      </div>
    </div>
  );
}
