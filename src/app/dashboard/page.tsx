import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { confidenceFromUncertainty, INITIAL_UNCERTAINTY, SCOUT_NEEDED_THRESHOLD } from "@/lib/bayesian";
import Link from "next/link";
import { DashboardCards } from "@/components/DashboardCards";
import { RecentMatches } from "@/components/RecentMatches";
import { ConnectedTeams } from "@/components/ConnectedTeams";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const teamId = (session!.user as { teamId: string }).teamId;

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      skillsRecords: { orderBy: { lastUpdated: "desc" }, take: 1 },
      performanceHistory: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!team) return <p className="text-txt-3">Team not found</p>;

  const skills = team.skillsRecords[0] ?? null;
  const confidenceVal = confidenceFromUncertainty(team.ratingUncertainty, INITIAL_UNCERTAINTY);
  const confidenceLabel = confidenceVal > 80 ? "High" : confidenceVal > 50 ? "Medium" : "Low";

  const recentMatches = await prisma.match.findMany({
    where: {
      OR: [
        { redTeam1Id: teamId },
        { redTeam2Id: teamId },
        { redTeam3Id: teamId },
        { blueTeam1Id: teamId },
        { blueTeam2Id: teamId },
        { blueTeam3Id: teamId },
      ],
    },
    orderBy: { date: "desc" },
    take: 10,
    include: {
      redTeam1: { select: { teamNumber: true } },
      redTeam2: { select: { teamNumber: true } },
      redTeam3: { select: { teamNumber: true } },
      blueTeam1: { select: { teamNumber: true } },
      blueTeam2: { select: { teamNumber: true } },
      blueTeam3: { select: { teamNumber: true } },
    },
  });

  const connections = await prisma.connection.findMany({
    where: {
      OR: [{ fromTeamId: teamId }, { toTeamId: teamId }],
      status: "accepted",
    },
    include: {
      fromTeam: { select: { id: true, teamNumber: true } },
      toTeam: { select: { id: true, teamNumber: true } },
    },
  });
  const connectedTeams = connections.map((c) =>
    c.fromTeamId === teamId ? c.toTeam : c.fromTeam
  );

  // Build sparkline data from performance history
  const sparkData = team.performanceHistory
    .slice()
    .reverse()
    .map((h) => h.performanceRating);
  const sparkMax = Math.max(...sparkData, 1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="page-title">Team {team.teamNumber}</h1>
          <p className="page-subtitle">Bayesian performance overview</p>
        </div>
        <div className="flex gap-2.5">
          <Link href={`/dashboard/teams/${team.teamNumber}`} className="btn-ghost">✎ Edit Profile</Link>
          <Link href="/dashboard/import" className="btn-ghost">↑ Import</Link>
          <Link href="/dashboard/matches/add" className="btn-primary">+ Add Match</Link>
        </div>
      </div>

      {/* Stat Cards */}
      <DashboardCards
        team={team}
        skills={skills}
        confidence={confidenceLabel}
      />

      {/* Rating Confidence Interval Bar */}
      <div className="card overflow-hidden">
        <div className="card-header bg-surface-bg border-b border-line py-2">
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] font-mono tracking-widest text-txt-3 uppercase">Rating Interval</span>
            <span className="font-mono text-[11px] text-txt-2">
              Current: <span className="text-txt-1">{team.performanceRating.toFixed(1)}</span> ± {team.ratingUncertainty.toFixed(1)}
            </span>
          </div>
        </div>
        <div className="p-5 bg-surface-card">
          <div className="flex justify-between text-[10px] font-mono text-txt-3 mb-2">
            <span>0</span><span>50</span><span>100</span><span>150</span><span>200</span>
          </div>
          <div className="relative h-1 bg-line rounded-none mb-4">
            {/* The interval range */}
            <div
              className="absolute h-full bg-txt-3/30"
              style={{
                left: `${Math.max(0, ((team.performanceRating - team.ratingUncertainty) / 200) * 100)}%`,
                right: `${Math.max(0, 100 - ((team.performanceRating + team.ratingUncertainty) / 200) * 100)}%`
              }}
            />
            {/* The point estimate */}
            <div
              className="absolute h-3 w-1 bg-gold -top-1"
              style={{ left: `${Math.min(100, (team.performanceRating / 200) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-mono text-txt-2">
            <div>
              <span className="text-txt-3">Lower: </span>
              <span className="text-amber-500">{(team.performanceRating - team.ratingUncertainty).toFixed(1)}</span>
            </div>
            <div>
              <span className="text-txt-3">Upper: </span>
              <span className="text-green-500">{(team.performanceRating + team.ratingUncertainty).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column: Recent Matches + Rating History */}
      <div className="grid gap-5 lg:grid-cols-2">
        <RecentMatches matches={recentMatches as any} currentTeamId={teamId} />

        <div className="card overflow-hidden">
          <div className="card-header bg-surface-bg border-b border-line py-2">
            <div className="flex justify-between items-center w-full">
              <span className="text-[10px] font-mono tracking-widest text-txt-3 uppercase">Rating History</span>
              <span className="font-mono text-[11px] text-txt-2">Last {sparkData.length} matches</span>
            </div>
          </div>
          <div className="p-5 bg-surface-card">
            {sparkData.length > 0 ? (
              <div className="relative h-24 mb-2">
                <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(240, 165, 0, 0.2)" />
                      <stop offset="100%" stopColor="rgba(240, 165, 0, 0)" />
                    </linearGradient>
                  </defs>

                  {/* Filled Area */}
                  <polygon
                    points={`0,100 ${sparkData.map((val, i) => `${(i / Math.max(1, sparkData.length - 1)) * 100},${100 - (val / sparkMax) * 100}`).join(" ")} 100,100`}
                    fill="url(#lineGrad)"
                    vectorEffect="non-scaling-stroke"
                  />

                  {/* Line Map */}
                  <polyline
                    points={sparkData.map((val, i) => `${(i / Math.max(1, sparkData.length - 1)) * 100},${100 - (val / sparkMax) * 100}`).join(" ")}
                    fill="none"
                    stroke="#F0A500"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />

                  {/* Current Point */}
                  <circle
                    cx="100"
                    cy={100 - (sparkData[sparkData.length - 1] / sparkMax) * 100}
                    r="4"
                    fill="#F0A500"
                    className="animate-pulse"
                  />
                </svg>
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center border border-dashed border-line mb-2">
                <p className="text-[11px] font-mono text-txt-3 uppercase tracking-widest">No History</p>
              </div>
            )}

            <div className="flex justify-between text-[10px] font-mono text-txt-3 mb-6">
              <span>Oldest</span>
              <span>Newest</span>
            </div>

            {/* Scouting Bars */}
            <div className="pt-4 border-t border-line space-y-3">
              <div>
                <div className="flex justify-between items-baseline mb-1.5 text-[10px] font-mono">
                  <span className="text-txt-3 uppercase tracking-wider">Autonomous Quality</span>
                  <span className="text-amber-500 font-bold">{team.autoStrength != null ? `${team.autoStrength}/10` : "—"}</span>
                </div>
                <div className="h-1 w-full bg-line rounded-none overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all"
                    style={{ width: team.autoStrength != null ? `${team.autoStrength * 10}%` : "0%" }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-baseline mb-1.5 text-[10px] font-mono">
                  <span className="text-txt-3 uppercase tracking-wider">Driver Control Quality</span>
                  <span className="text-green-500 font-bold">{team.driverStrength != null ? `${team.driverStrength}/10` : "—"}</span>
                </div>
                <div className="h-1 w-full bg-line rounded-none overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: team.driverStrength != null ? `${team.driverStrength * 10}%` : "0%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* High uncertainty alert */}
      {team.ratingUncertainty > SCOUT_NEEDED_THRESHOLD && (
        <div className="alert alert-info">
          <span className="alert-icon">⚡</span>
          <div className="alert-body">
            <strong>High uncertainty detected.</strong> Your rating confidence interval is wide (±{team.ratingUncertainty.toFixed(1)}). Add more match data to tighten your Bayesian estimate.
          </div>
        </div>
      )}

      {/* Connected Teams */}
      <ConnectedTeams teams={connectedTeams} />
    </div>
  );
}
