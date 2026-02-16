"use client";

import { useState } from "react";
import Link from "next/link";

type Team = {
  id: string;
  teamNumber: string;
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
              <tr className="bg-warm-100 border-b border-warm-200">
                <th className="px-4 py-4 font-graffiti text-warm-900 uppercase tracking-wider text-xs">Team</th>
                <th className="px-4 py-4 font-graffiti text-warm-900 uppercase tracking-wider text-xs">Region</th>
                <th className="px-4 py-4 font-graffiti text-warm-900 uppercase tracking-wider text-xs text-right">Rating</th>
                <th className="px-4 py-4 font-graffiti text-warm-900 uppercase tracking-wider text-xs text-center">Matches</th>
                <th className="px-4 py-4 font-graffiti text-warm-900 uppercase tracking-wider text-xs text-right">Skills</th>
                <th className="px-4 py-4 font-graffiti text-warm-900 uppercase tracking-wider text-xs"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const skills = t.skillsRecords?.[0];
                return (
                  <tr key={t.id} className="border-b border-warm-100 hover:bg-warm-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-warm-900">{t.teamNumber}</td>
                    <td className="px-4 py-3 text-warm-600">
                      {[t.provinceState, t.country].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-vex-blue font-medium">
                      {Math.round(t.performanceRating)}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-warm-500">
                      {t.matchCount}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-vex-red font-medium">
                      {skills?.combinedSkillsScore ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {t.id === currentTeamId && (
                          <span className="text-[10px] bg-warm-200 text-warm-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">You</span>
                        )}
                        <Link
                          href={`/dashboard/teams/${t.teamNumber}`}
                          className="text-vex-blue font-medium hover:underline decoration-2"
                        >
                          View Profile
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center bg-white">
            <p className="text-warm-500 italic">No teams found matching "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
