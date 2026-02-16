"use client";

type Match = {
  id: string;
  eventName: string;
  date: string;
  redScore: number;
  blueScore: number;
  redTeam1: { teamNumber: string };
  redTeam2: { teamNumber: string };
  redTeam3: { teamNumber: string };
  blueTeam1: { teamNumber: string };
  blueTeam2: { teamNumber: string };
  blueTeam3: { teamNumber: string };
  redTeam1Id: string;
  redTeam2Id: string;
  redTeam3Id: string;
  blueTeam1Id: string;
  blueTeam2Id: string;
  blueTeam3Id: string;
};

export function RecentMatches({
  matches,
  currentTeamId,
}: {
  matches: Match[];
  currentTeamId: string;
}) {
  if (matches.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="section-title">Recent Matches</div>
        </div>
        <div className="card-body text-center text-txt-3 py-8">
          No matches yet. Add or import matches to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="section-title">Recent Matches</div>
      </div>
      <div className="px-5 py-2">
        {matches.slice(0, 5).map((m) => {
          const isRed = [m.redTeam1Id, m.redTeam2Id, m.redTeam3Id].includes(currentTeamId);
          const won = isRed ? m.redScore > m.blueScore : m.blueScore > m.redScore;

          const yourAlliance = isRed
            ? `${m.redTeam1.teamNumber} · ${m.redTeam2.teamNumber}`
            : `${m.blueTeam1.teamNumber} · ${m.blueTeam2.teamNumber}`;
          const oppAlliance = isRed
            ? `${m.blueTeam1.teamNumber} · ${m.blueTeam2.teamNumber}`
            : `${m.redTeam1.teamNumber} · ${m.redTeam2.teamNumber}`;

          const yourScore = isRed ? m.redScore : m.blueScore;
          const oppScore = isRed ? m.blueScore : m.redScore;

          return (
            <div
              key={m.id}
              className="flex items-center gap-3.5 py-2.5 border-b border-line last:border-b-0"
            >
              <span className={`match-badge ${won ? "badge-win" : "badge-loss"}`}>
                {won ? "WIN" : "LOSS"}
              </span>
              <div className="flex-1 text-xs text-txt-2 truncate">
                <strong className="text-txt-1 font-medium">{yourAlliance}</strong>
                <span className="text-txt-3"> vs </span>
                {oppAlliance}
              </div>
              <div className="font-mono text-[13px] font-bold text-txt-1">
                {yourScore} – {oppScore}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
