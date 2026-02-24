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
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b-2 border-txt-1">
        <div>
          <h1 className="font-head text-6xl md:text-8xl font-black text-txt-1 tracking-tighter leading-none -ml-1">
            {team.teamNumber}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs font-mono text-txt-3 tracking-widest uppercase">
            {team.provinceState && <span>{team.provinceState}</span>}
            {team.country && <span>/ {team.country}</span>}
            <span>/ {team.matchCount} MATCHES</span>
          </div>

          {/* Strategy Tags */}
          {team.strategyTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {team.strategyTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-txt-1 text-surface-bg"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right side primary stat */}
        <div className="md:text-right flex flex-col items-start md:items-end">
          <span className="text-[10px] font-mono text-txt-3 tracking-widest uppercase mb-1">Bayesian Rating</span>
          <div className="text-5xl font-mono font-bold text-cyan-400 leading-none">
            {team.performanceRating.toFixed(1)}
          </div>
          <div className="text-[10px] font-mono text-txt-2 mt-1">±{team.ratingUncertainty.toFixed(1)}</div>
        </div>
      </div>

      {/* Horizontal Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-line bg-surface-card/20">
        <div className="p-4 border-r border-b md:border-b-0 border-line py-6 flex flex-col items-center text-center">
          <div className="text-[10px] font-mono tracking-widest text-txt-3 uppercase mb-3">Model Confidence</div>
          <div className={`text-4xl font-mono font-bold ${confidence > 80 ? "text-success" : confidence > 50 ? "text-amber-500" : "text-danger"}`}>
            {confidence}%
          </div>
        </div>
        <div className="p-4 border-r border-b md:border-b-0 border-line py-6 flex flex-col items-center text-center">
          <div className="text-[10px] font-mono tracking-widest text-txt-3 uppercase mb-3">Auto Strength</div>
          <div className="text-4xl font-mono font-bold text-amber-500">{team.autoStrength ?? "—"}</div>
        </div>
        <div className="p-4 border-r border-line md:border-r py-6 flex flex-col items-center text-center">
          <div className="text-[10px] font-mono tracking-widest text-txt-3 uppercase mb-3">Driver Strength</div>
          <div className="text-4xl font-mono font-bold text-green-500">{team.driverStrength ?? "—"}</div>
        </div>
        <div className="p-4 py-6 flex flex-col items-center text-center">
          <div className="text-[10px] font-mono tracking-widest text-txt-3 uppercase mb-3">Matches Played</div>
          <div className="text-4xl font-mono font-bold text-txt-1">{team.matchCount}</div>
        </div>
      </div>

      {/* Robot Config & Scouting split */}
      <div className="grid gap-6 md:grid-cols-2 pt-2">
        {/* Scouting Bars */}
        <div className="card border-none bg-transparent">
          <h3 className="text-[10px] font-mono tracking-widest text-txt-3 uppercase mb-4 border-b border-line pb-2">Scouting Analysis</h3>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-baseline mb-1.5 text-[10px] font-mono">
                <span className="text-txt-2 uppercase tracking-wider">Autonomous Routine</span>
                <span className="text-amber-500 font-bold">{team.autoStrength != null ? `${team.autoStrength}/10` : "—"}</span>
              </div>
              <div className="h-1.5 w-full bg-line rounded-none overflow-hidden mt-1">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: team.autoStrength != null ? `${team.autoStrength * 10}%` : "0%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-1.5 text-[10px] font-mono">
                <span className="text-txt-2 uppercase tracking-wider">Driver Control</span>
                <span className="text-green-500 font-bold">{team.driverStrength != null ? `${team.driverStrength}/10` : "—"}</span>
              </div>
              <div className="h-1.5 w-full bg-line rounded-none overflow-hidden mt-1">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{ width: team.driverStrength != null ? `${team.driverStrength * 10}%` : "0%" }}
                />
              </div>
            </div>
          </div>

          {/* Re-scout warning */}
          {confidence < 50 && (
            <div className="mt-6 border-l-[3px] border-danger bg-danger/5 px-4 py-3">
              <div className="flex items-center gap-2 mb-1 text-danger">
                <span className="text-xs">⚠️</span>
                <span className="font-mono text-[10px] font-bold tracking-widest uppercase">Low Confidence</span>
              </div>
              <p className="text-xs text-txt-2">Consider scheduling a re-scout for this team.</p>
            </div>
          )}
        </div>

        {/* Robot Config */}
        {(team.drivetrainType || team.autonomousSide || team.autonReliabilityPct !== null) && (
          <div className="card overflow-hidden">
            <div className="card-header bg-surface-bg border-b border-line py-2">
              <span className="text-[10px] font-mono tracking-widest text-txt-3 uppercase">Configuration</span>
            </div>
            <div className="p-0 flex flex-col bg-surface-card">
              {team.drivetrainType && (
                <div className="grid grid-cols-[120px_1fr] border-b border-line last:border-b-0">
                  <div className="p-3 border-r border-line bg-surface-bg/30 flex items-center">
                    <span className="text-[10px] font-mono text-txt-3 tracking-widest">DRIVETRAIN</span>
                  </div>
                  <div className="p-3 font-mono font-bold text-sm text-txt-1">{drivetrainLabel(team.drivetrainType)}</div>
                </div>
              )}
              {team.autonomousSide && (
                <div className="grid grid-cols-[120px_1fr] border-b border-line last:border-b-0">
                  <div className="p-3 border-r border-line bg-surface-bg/30 flex items-center">
                    <span className="text-[10px] font-mono text-txt-3 tracking-widest">AUTON SIDE</span>
                  </div>
                  <div className="p-3 font-mono font-bold text-sm text-txt-1">{autonSideLabel(team.autonomousSide)}</div>
                </div>
              )}
              {team.autonReliabilityPct !== null && (
                <div className="grid grid-cols-[120px_1fr] border-b border-line last:border-b-0">
                  <div className="p-3 border-r border-line bg-surface-bg/30 flex items-center">
                    <span className="text-[10px] font-mono text-txt-3 tracking-widest">RELIABILITY</span>
                  </div>
                  <div className={`p-3 font-mono font-bold text-sm ${team.autonReliabilityPct >= 70 ? "text-success" : team.autonReliabilityPct >= 40 ? "text-amber-500" : "text-danger"}`}>
                    {team.autonReliabilityPct}%
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      {team.notes && (
        <div className="card overflow-hidden mt-6">
          <div className="card-header bg-surface-bg border-b border-line py-2">
            <span className="text-[10px] font-mono tracking-widest text-txt-3 uppercase">Scout Notes</span>
          </div>
          <div className="p-5 bg-surface-card">
            <p className="text-[13px] font-mono text-txt-2 leading-relaxed whitespace-pre-wrap">{team.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}

