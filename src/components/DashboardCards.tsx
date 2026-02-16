"use client";

type Team = {
  performanceRating: number;
  ratingUncertainty: number;
  matchCount: number;
  autoStrength: number | null;
  driverStrength: number | null;
};

type Skills = {
  driverSkillsScore: number | null;
  autonomousSkillsScore: number | null;
  combinedSkillsScore: number | null;
} | null;

export function DashboardCards({
  team,
  skills,
  confidence,
}: {
  team: Team;
  skills: Skills;
  confidence: string;
}) {
  const winRate = team.matchCount > 0 ? "—" : "—";

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {/* Bayesian Rating */}
      <div className="stat-card c-cyan">
        <div className="stat-label">Bayesian Rating</div>
        <div className="stat-value">{Math.round(team.performanceRating * 10) / 10}</div>
        <div className="stat-meta">
          <span>±{team.ratingUncertainty.toFixed(1)} uncertainty</span>
        </div>
        <div className="stat-icon">⚡</div>
      </div>

      {/* Confidence */}
      <div className="stat-card c-amber">
        <div className="stat-label">Confidence</div>
        <div className="stat-value">{confidence}</div>
        <div className="stat-meta">
          <span>Based on {team.matchCount} matches</span>
        </div>
        <div className="stat-icon">◎</div>
      </div>

      {/* Scouting */}
      <div className="stat-card c-green">
        <div className="stat-label">Scouting Scores</div>
        <div className="stat-value flex items-baseline gap-2">
          <span className="text-amber text-xl">{team.autoStrength ?? "—"}</span>
          <span className="text-txt-3 text-sm">/</span>
          <span className="text-success text-xl">{team.driverStrength ?? "—"}</span>
        </div>
        <div className="stat-meta">
          <span>Auto / Driver (0–10)</span>
        </div>
        <div className="stat-icon">✦</div>
      </div>

      {/* Skills Score */}
      <div className="stat-card c-red">
        <div className="stat-label">Skills Score</div>
        <div className="stat-value">{skills?.combinedSkillsScore ?? "—"}</div>
        <div className="stat-meta">
          {skills ? (
            <span>Driver {skills.driverSkillsScore ?? "—"} · Auto {skills.autonomousSkillsScore ?? "—"}</span>
          ) : (
            <span>No skills recorded</span>
          )}
        </div>
        <div className="stat-icon">◆</div>
      </div>
    </div>
  );
}
