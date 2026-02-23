import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { confidenceFromUncertainty, INITIAL_UNCERTAINTY } from "@/lib/bayesian";
import Link from "next/link";
import { DashboardCards } from "@/components/DashboardCards";
import { RecentMatches } from "@/components/RecentMatches";
import { ConnectedTeams } from "@/components/ConnectedTeams";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const teamId = (session.user as { teamId: string }).teamId;

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
      <div className="card p-5">
        <div className="flex justify-between items-center mb-4">
          <div className="section-title">Rating Confidence Interval</div>
          <span className="font-mono text-xs text-txt-3">
            {team.performanceRating.toFixed(1)} ± {team.ratingUncertainty.toFixed(1)}
          </span>
        </div>
        <div className="mb-3">
          <div className="flex justify-between text-[11px] font-mono text-txt-3 mb-1.5">
            <span>0</span><span>50</span><span>100</span><span>150</span><span>200</span>
          </div>
          <div className="rating-bar-bg">
            <div
              className="rating-bar-fill animate-grow-bar"
              style={{ width: `${Math.min(100, (team.performanceRating / 200) * 100)}%` }}
            />
          </div>
        </div>
        <div className="text-xs text-txt-2">
          Lower bound <span className="text-amber font-mono">{(team.performanceRating - team.ratingUncertainty).toFixed(1)}</span>
          {" · "}Point estimate <span className="text-spark font-mono">{team.performanceRating.toFixed(1)}</span>
          {" · "}Upper bound <span className="text-success font-mono">{(team.performanceRating + team.ratingUncertainty).toFixed(1)}</span>
        </div>
      </div>

      {/* Two-column: Recent Matches + Rating History */}
      <div className="grid gap-5 lg:grid-cols-2">
        <RecentMatches matches={recentMatches as any} currentTeamId={teamId} />

        <div className="card">
          <div className="card-header">
            <div className="section-title">Rating History</div>
            <span className="font-mono text-[11px] text-txt-3">Last {sparkData.length} matches</span>
          </div>
          <div className="card-body">
            {sparkData.length > 0 ? (
              <>
                <div className="sparkline" style={{ height: 80 }}>
                  {sparkData.map((val, i) => (
                    <div
                      key={i}
                      className={`sp-bar ${i === sparkData.length - 1 ? "hi" : ""}`}
                      style={{ height: `${Math.max(5, (val / sparkMax) * 100)}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] font-mono text-txt-3 mt-1.5">
                  <span>M1</span>
                  <span>M{sparkData.length}</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-txt-3 text-center py-6">No match history yet</p>
            )}

            {/* Scouting bars */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-line">
              <div>
                <div className="flex justify-between text-[11px] font-mono text-txt-3 mb-1">
                  <span>AUTO STRENGTH</span>
                  <span className="text-amber">{team.autoStrength != null ? `${team.autoStrength} / 10` : "—"}</span>
                </div>
                <div className="rating-bar-bg !h-1.5">
                  <div
                    className="h-full rounded-full bg-amber transition-all"
                    style={{ width: team.autoStrength != null ? `${team.autoStrength * 10}%` : "0%", boxShadow: "0 0 8px rgba(255,179,64,.4)" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-mono text-txt-3 mb-1">
                  <span>DRIVER STRENGTH</span>
                  <span className="text-success">{team.driverStrength != null ? `${team.driverStrength} / 10` : "—"}</span>
                </div>
                <div className="rating-bar-bg !h-1.5">
                  <div
                    className="h-full rounded-full bg-success transition-all"
                    style={{ width: team.driverStrength != null ? `${team.driverStrength * 10}%` : "0%", boxShadow: "0 0 8px rgba(34,232,154,.4)" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* High uncertainty alert */}
      {team.ratingUncertainty > 30 && (
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
