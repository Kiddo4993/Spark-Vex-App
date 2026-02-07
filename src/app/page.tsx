import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DashboardCards } from "@/components/DashboardCards";
import { RecentMatches } from "@/components/RecentMatches";
import { confidenceFromUncertainty, INITIAL_UNCERTAINTY } from "@/lib/bayesian";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  const userTeamId = session?.user ? (session.user as { teamId: string }).teamId : null;

  // Fetch top 5 teams by performance rating
  const topTeams = await prisma.team.findMany({
    orderBy: { performanceRating: "desc" },
    take: 5,
    include: {
      skillsRecords: { orderBy: { lastUpdated: "desc" }, take: 1 },
    },
  });

  // Fetch recent matches
  const recentMatches = await prisma.match.findMany({
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

  return (
    <main className="min-h-screen bg-vex-bg p-4 text-white sm:p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rotate-45 rounded bg-vex-red" />
            <h1 className="text-3xl font-bold tracking-tight">Sparks VEX</h1>
          </div>
          <div className="flex gap-4">
            <Link href="/dashboard/teams" className="btn-secondary">
              View All Teams
            </Link>
            {session ? (
              <Link href="/dashboard" className="btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/auth/signin" className="btn-primary">
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Hero / Top Teams */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-vex-accent">Top Performing Teams</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topTeams.map((team) => {
              const confidence = confidenceFromUncertainty(
                team.ratingUncertainty,
                INITIAL_UNCERTAINTY
              );
              const skills = team.skillsRecords[0] ?? null;

              return (
                <div key={team.id} className="card hover:border-vex-accent transition-colors">
                  <Link href={`/dashboard/teams/${team.teamNumber}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-bold text-white">Team {team.teamNumber}</h3>
                        <p className="text-sm text-gray-400">
                          {[team.provinceState, team.country].filter(Boolean).join(", ")}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-vex-accent">
                          {Math.round(team.performanceRating)}
                        </span>
                        <p className="text-xs text-gray-500">Rating</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-4 text-sm text-gray-300">
                      <div>
                        <span className="block font-bold text-white">{confidence}%</span>
                        Confidence
                      </div>
                      <div>
                        <span className="block font-bold text-white">{team.matchCount}</span>
                        Matches
                      </div>
                      <div>
                        <span className="block font-bold text-white">
                          {skills?.combinedSkillsScore ?? "-"}
                        </span>
                        Skills
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Matches */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-vex-accent">Recent Matches</h2>
          <RecentMatches matches={recentMatches} currentTeamId={userTeamId || ""} />
        </section>
      </div>
    </main>
  );
}
