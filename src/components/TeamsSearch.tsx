"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Team = {
  id: string;
  teamNumber: string;
  performanceRating: number;
  ratingUncertainty: number;
  matchCount: number;
  provinceState: string | null;
  country: string | null;
};

export function TeamsSearch() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teams", {
      credentials: "include",
    })
      .then(async (r) => {
        if (!r.ok) {
          console.error("Failed:", r.status);
          return;
        }
        const data = await r.json();
        setTeams(data.teams ?? []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = teams.filter((t) =>
    t.teamNumber.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <input
        type="text"
        placeholder="Search teams by number…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="input max-w-md"
      />

      {loading ? (
        <p className="text-sm text-txt-3">Loading teams…</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-txt-3">No teams found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((team, i) => {
            const confidence = Math.min(
              100,
              Math.round(Math.max(0, 1 - team.ratingUncertainty / 50) * 100)
            );

            return (
              <Link
                key={team.id}
                href={`/dashboard/teams/${team.teamNumber}`}
                className="team-card group block"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="font-mono text-lg font-bold text-txt-1 group-hover:text-spark transition-colors">
                    {team.teamNumber}
                  </span>
                  <span className="text-[10px] font-mono bg-line px-2 py-0.5 rounded-md text-txt-3">
                    #{i + 1}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="stat-label">Rating</p>
                    <p className="font-head text-2xl font-extrabold text-txt-1 tracking-tight leading-none">
                      {Math.round(team.performanceRating)}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="stat-label !mb-0">Confidence</span>
                      <span className="text-[11px] font-mono text-txt-2">{confidence}%</span>
                    </div>
                    <div className="rating-bar-bg !h-1">
                      <div
                        className={`h-full rounded-full ${confidence > 80 ? "bg-success" : confidence > 50 ? "bg-amber" : "bg-danger"
                          }`}
                        style={{ width: `${confidence}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-line flex justify-between items-center">
                    <div className="text-xs text-txt-3 font-mono">
                      {team.matchCount} Matches
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-[10px] font-mono uppercase text-txt-3 tracking-wider">Confidence</div>
                      <div className={`font-mono text-xs font-bold ${(1 - team.ratingUncertainty / 50) * 100 > 80 ? "text-success" :
                          (1 - team.ratingUncertainty / 50) * 100 > 50 ? "text-amber" :
                            "text-danger"
                        }`}>
                        {Math.max(0, Math.min(100, Math.round((1 - team.ratingUncertainty / 50) * 100)))}%
                      </div>
                    </div>
                  </div>     {(team.provinceState || team.country) && (
                    <div className="flex gap-1.5 flex-wrap">
                      {team.provinceState && <span className="ext-chip">{team.provinceState}</span>}
                      {team.country && <span className="ext-chip">{team.country}</span>}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
