"use client";

type Team = {
  performanceRating: number;
  ratingUncertainty: number;
  matchCount: number;
};

export function DashboardCards({
  team,
  autoStrength,
  driverStrength,
  confidence,
}: {
  team: Team;
  autoStrength: number | null;
  driverStrength: number | null;
  confidence: string;
}) {
  const winRate = team.matchCount > 0 ? "—" : "—";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Bayesian Rating */}
      <div className="stat-card border-blue-500/20 bg-blue-500/5">
        <div className="stat-label">Bayesian Rating</div>
        <div className="stat-value text-blue-400">{team.matchCount > 0 ? Math.round(team.performanceRating * 10) / 10 : "N/A"}</div>
        <div className="stat-meta text-[10px] text-blue-400/70">
          {team.matchCount > 0 ? `±${team.ratingUncertainty.toFixed(1)} uncertainty` : "—"}
        </div>
      </div>

      {/* Confidence */}
      <div className="stat-card border-txt-2/20 bg-txt-2/5">
        <div className="stat-label">Model Confidence</div>
        <div className="stat-value text-txt-2">{team.matchCount > 0 ? confidence : "N/A"}</div>
        <div className="stat-meta text-[10px] text-txt-3">
          Based on {team.matchCount} matches
        </div>
      </div>

      {/* Scouting */}
      <div className="stat-card border-red-500/20 bg-red-500/5">
        <div className="stat-label">Scouting (Auto/Driv)</div>
        <div className="stat-value flex items-baseline gap-2">
          <span className="text-red-500">{autoStrength ?? "—"}</span>
          <span className="text-txt-3 text-lg">/</span>
          <span className="text-blue-500">{driverStrength ?? "—"}</span>
        </div>
        <div className="stat-meta text-[10px] text-txt-3">
          0–10 Human evaluation
        </div>
      </div>
    </div>
  );
}
