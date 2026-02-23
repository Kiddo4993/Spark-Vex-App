"use client";

type Match = {
  id: string;
  eventName: string;
  date: string;
  redScore: number;
  blueScore: number;
  redTeam1: { teamNumber: string };
  redTeam2: { teamNumber: string };
  redTeam3: { teamNumber: string } | null;
  blueTeam1: { teamNumber: string };
  blueTeam2: { teamNumber: string };
  blueTeam3: { teamNumber: string } | null;
  redTeam1Id: string;
  redTeam2Id: string;
  redTeam3Id: string | null;
  blueTeam1Id: string;
  blueTeam2Id: string;
  blueTeam3Id: string | null;
};

export function RecentMatches({ matches }: { matches: Match[], currentTeamId?: string }) {
  if (matches.length === 0) {
    return (
      <div className="card">
        <div className="card-header border-b-0 pb-0">
          <div className="section-title text-txt-2 tracking-widest uppercase text-[11px] font-mono">Recent Simulator Runs</div>
        </div>
        <div className="card-body text-center text-txt-3 py-8">
          No matches found.
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="card-header bg-surface-bg border-b border-line py-2">
        <div className="flex justify-between items-center w-full">
          <span className="text-[10px] font-mono tracking-widest text-txt-3 uppercase">Recent Match Feed</span>
        </div>
      </div>
      <div className="flex flex-col bg-surface-card">
        {matches.slice(0, 8).map((m) => {
          const redWon = m.redScore > m.blueScore;
          const blueWon = m.blueScore > m.redScore;

          return (
            <div
              key={m.id}
              className="grid grid-cols-[1fr_auto_1fr] text-sm border-b border-line last:border-b-0 group hover:bg-surface-hover transition-colors"
            >
              {/* Red Alliance */}
              <div className={`p-3 text-right flex flex-col justify-center border-r-[3px] transition-colors ${redWon ? 'border-danger/80 bg-danger/5' : 'border-line'}`}>
                <div className={`font-mono font-bold tracking-tight ${redWon ? 'text-txt-1' : 'text-txt-3'}`}>
                  {m.redTeam1?.teamNumber} <span className="text-danger/50 px-1">/</span> {m.redTeam2?.teamNumber}
                </div>
              </div>

              {/* Score */}
              <div className="px-5 flex flex-col items-center justify-center font-mono font-bold bg-surface-bg/30">
                <div className="text-[14px] flex items-center gap-2">
                  <span className={redWon ? "text-danger" : "text-txt-3"}>{m.redScore}</span>
                  <span className="text-txt-3 opacity-30 text-[10px]">VS</span>
                  <span className={blueWon ? "text-cyan-500" : "text-txt-3"}>{m.blueScore}</span>
                </div>
              </div>

              {/* Blue Alliance */}
              <div className={`p-3 text-left flex flex-col justify-center border-l-[3px] transition-colors ${blueWon ? 'border-cyan-500/80 bg-cyan-500/5' : 'border-line'}`}>
                <div className={`font-mono font-bold tracking-tight ${blueWon ? 'text-txt-1' : 'text-txt-3'}`}>
                  {m.blueTeam1?.teamNumber} <span className="text-cyan-500/50 px-1">/</span> {m.blueTeam2?.teamNumber}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
