import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopTeams } from "@/components/TopTeams";
import { RecentMatches } from "@/components/RecentMatches";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  // Fetch top teams globally
  const topTeams = await prisma.team.findMany({
    orderBy: { performanceRating: "desc" },
    take: 8,
    select: {
      id: true,
      teamNumber: true,
      performanceRating: true,
      ratingUncertainty: true,
      matchCount: true,
    }
  });

  // Fetch recent matches globally
  const recentMatches = await prisma.match.findMany({
    orderBy: { date: "desc" },
    take: 5,
    include: {
      redTeam1: { select: { teamNumber: true } },
      redTeam2: { select: { teamNumber: true } },
      redTeam3: { select: { teamNumber: true } },
      blueTeam1: { select: { teamNumber: true } },
      blueTeam2: { select: { teamNumber: true } },
      blueTeam3: { select: { teamNumber: true } },
    }
  });

  return (
    <main className="min-h-screen bg-vex-dark pb-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">

        {/* Header / Hero Area */}
        <header className="py-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16 border-b border-vex-border mb-20 bg-vex-surface/30 rounded-3xl p-8 backdrop-blur-sm mt-8">
          <div className="relative inline-block text-center md:text-left">
            <h1 className="text-5xl sm:text-7xl font-bold text-white tracking-tighter transform -rotate-1 drop-shadow-lg">
              SPARKS <span className="text-vex-red">VEX</span>
            </h1>
            <p className="mt-3 text-[10px] md:text-xs font-bold text-vex-accent uppercase tracking-[0.3em]">
              Bayesian Performance Modeling
            </p>
          </div>

          <div className="flex gap-4">
            {session ? (
              <Link href="/dashboard" className="btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex gap-3">
                <Link href="/auth/signin" className="btn-primary">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-secondary">
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </header>

        <div className="grid gap-20 lg:grid-cols-[1fr_420px]">
          {/* Main Content: Top Teams */}
          <section className="space-y-20">
            <TopTeams teams={topTeams} />

            <div className="glass-card p-10 md:p-16 border-l-[4px] border-l-vex-blue">
              <h3 className="text-2xl font-bold text-white mb-12 tracking-wide uppercase">How it works</h3>
              <div className="grid gap-12 sm:grid-cols-2">
                <div className="space-y-5">
                  <p className="text-lg font-bold text-vex-blue uppercase tracking-widest border-b border-vex-blue/20 pb-2">Bayesian Strength</p>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    Automatically calculates team strength while accounting for alliance synergies and match-to-match variance.
                  </p>
                </div>
                <div className="space-y-5">
                  <p className="text-lg font-bold text-vex-red uppercase tracking-widest border-b border-vex-red/20 pb-2">Confidence Intervals</p>
                  <p className="text-gray-400 leading-relaxed text-sm">
                    Identifies which rankings are solidified and which teams need more scouting data to be certain.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Sidebar Area: Recent Matches */}
          <aside>
            <RecentMatches matches={recentMatches as any} currentTeamId="" />

            <div className="mt-8 p-6 bg-vex-blue/10 rounded-xl border border-vex-blue/20">
              <p className="text-xs font-bold text-vex-blue uppercase tracking-widest mb-2">Pro Tip</p>
              <p className="text-xs text-gray-300 leading-relaxed">
                Sign in to import your own match data directly from RobotEvents and see your team's real-time ELO progression!
              </p>
            </div>
          </aside>
        </div>

        <footer className="mt-20 pt-12 text-center border-t border-vex-border">
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">
            © {new Date().getFullYear()} Sparks Robotics · Spark VEX System
          </p>
        </footer>
      </div>
    </main>
  );
}
