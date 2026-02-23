"use client";

type Team = {
  teamNumber: string;
  performanceRating: number;
  ratingUncertainty: number;
  matchCount: number;
  autoStrength: number | null;
  driverStrength: number | null;
  drivetrainType: string | null;
  autonomousSide: string | null;
  autonReliabilityPct: number | null;
  provinceState: string | null;
  country: string | null;
  strategyTags: string[];
  notes: string | null;
};

function drivetrainLabel(type: string | null) {
  const map: Record<string, string> = {
    tank: "Tank Drive",
    mecanum: "Mecanum",
    holonomic: "Holonomic / X-Drive",
    swerve: "Swerve",
    other: "Other",
  };
  return type ? map[type] || type : null;
}

function autonSideLabel(side: string | null) {
  const map: Record<string, string> = {
    left: "Left",
    right: "Right",
    skills: "Skills",
    both: "Both",
    none: "None",
  };
  return side ? map[side] || side : null;
}

export function TeamProfileCard({ team }: { team: Team }) {
  const confidence = Math.min(
    100,
    Math.round(Math.max(0, 1 - team.ratingUncertainty / 50) * 100)
  );

  return (
    <div className="space-y-5">
      {/* Profile Hero */}
      <div className="profile-hero">
        <div className="team-avatar !w-16 !h-16 !text-xl">
          {team.teamNumber.slice(0, 2)}
        </div>
        <div className="relative z-10">
          <h2 className="font-head text-3xl font-extrabold text-txt-1 tracking-tight">
            Team {team.teamNumber}
          </h2>
          <div className="flex items-center gap-3 mt-1 text-xs text-txt-3">
            {team.provinceState && <span>{team.provinceState}</span>}
            {team.country && <span>| {team.country}</span>}
            <span>| {team.matchCount} matches</span>
          </div>
          {/* Strategy Tags */}
          {team.strategyTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {team.strategyTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-spark/15 text-spark border border-spark/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="profile-stats-grid">
        <div className="p-stat">
          <div className="p-stat-label">Rating</div>
          <div className="p-stat-val text-spark">{Math.round(team.performanceRating)}</div>
        </div>
        <div className="p-stat">
          <div className="p-stat-label">Uncertainty</div>
          <div className="p-stat-val text-amber">±{team.ratingUncertainty.toFixed(1)}</div>
        </div>
        <div className="p-stat">
          <div className="p-stat-label">Confidence</div>
          <div className={`p-stat-val ${confidence > 80 ? "text-success" : confidence > 50 ? "text-amber" : "text-danger"}`}>
            {confidence}%
          </div>
        </div>
        <div className="p-stat">
          <div className="p-stat-label">Auto</div>
          <div className="p-stat-val text-amber">{team.autoStrength ?? "—"}</div>
        </div>
        <div className="p-stat">
          <div className="p-stat-label">Driver</div>
          <div className="p-stat-val text-success">{team.driverStrength ?? "—"}</div>
        </div>
      </div>

      {/* Robot Config */}
      {(team.drivetrainType || team.autonomousSide || team.autonReliabilityPct !== null) && (
        <div className="card p-5">
          <h3 className="section-title mb-4">Robot Configuration</h3>
          <div className="grid grid-cols-3 gap-4">
            {team.drivetrainType && (
              <div>
                <div className="text-[11px] font-mono text-txt-3 mb-1">DRIVETRAIN</div>
                <div className="text-sm font-semibold text-txt-1">{drivetrainLabel(team.drivetrainType)}</div>
              </div>
            )}
            {team.autonomousSide && (
              <div>
                <div className="text-[11px] font-mono text-txt-3 mb-1">AUTON SIDE</div>
                <div className="text-sm font-semibold text-txt-1">{autonSideLabel(team.autonomousSide)}</div>
              </div>
            )}
            {team.autonReliabilityPct !== null && (
              <div>
                <div className="text-[11px] font-mono text-txt-3 mb-1">AUTON RELIABILITY</div>
                <div className={`text-sm font-semibold ${team.autonReliabilityPct >= 70 ? "text-success" : team.autonReliabilityPct >= 40 ? "text-amber" : "text-danger"}`}>
                  {team.autonReliabilityPct}%
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scouting Bars */}
      <div className="card p-5">
        <h3 className="section-title mb-4">Scouting Data</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-[11px] font-mono text-txt-3 mb-1.5">
              <span>AUTONOMOUS STRENGTH</span>
              <span className="text-amber">{team.autoStrength != null ? `${team.autoStrength} / 10` : "Not scouted"}</span>
            </div>
            <div className="rating-bar-bg !h-2">
              <div
                className="h-full rounded-full bg-amber transition-all animate-grow-bar"
                style={{
                  width: team.autoStrength != null ? `${team.autoStrength * 10}%` : "0%",
                  boxShadow: "0 0 8px rgba(255,179,64,.4)"
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-mono text-txt-3 mb-1.5">
              <span>DRIVER STRENGTH</span>
              <span className="text-success">{team.driverStrength != null ? `${team.driverStrength} / 10` : "Not scouted"}</span>
            </div>
            <div className="rating-bar-bg !h-2">
              <div
                className="h-full rounded-full bg-success transition-all animate-grow-bar"
                style={{
                  width: team.driverStrength != null ? `${team.driverStrength * 10}%` : "0%",
                  boxShadow: "0 0 8px rgba(34,232,154,.4)"
                }}
              />
            </div>
          </div>
        </div>

        {/* Re-scout warning */}
        {confidence < 50 && (
          <div className="alert alert-warn mt-4">
            <span className="alert-icon">⚠️</span>
            <div className="alert-body">
              <strong>Re-scout recommended.</strong> Confidence is below 50% — add more match data for this team.
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      {team.notes && (
        <div className="card p-5">
          <h3 className="section-title mb-3">Notes</h3>
          <p className="text-sm text-txt-2 leading-relaxed whitespace-pre-wrap">{team.notes}</p>
        </div>
      )}
    </div>
  );
}

