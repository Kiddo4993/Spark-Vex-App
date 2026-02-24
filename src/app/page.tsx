import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TopTeams } from "@/components/TopTeams";
import { RecentMatches } from "@/components/RecentMatches";
import { BestMatches } from "@/components/BestMatches";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  const topTeams = await prisma.team.findMany({
    where: { teamNumber: { not: "ADMIN" } },
    orderBy: { performanceRating: "desc" },
    take: 8,
    select: {
      id: true,
      teamNumber: true,
      performanceRating: true,
      ratingUncertainty: true,
      matchCount: true,
    },
  });

  const recentMatches = await prisma.match.findMany({
    orderBy: { date: "desc" },
    take: 50, // Fetch more to find the best scores
    include: {
      redTeam1: { select: { teamNumber: true } },
      redTeam2: { select: { teamNumber: true } },
      redTeam3: { select: { teamNumber: true } },
      blueTeam1: { select: { teamNumber: true } },
      blueTeam2: { select: { teamNumber: true } },
      blueTeam3: { select: { teamNumber: true } },
    },
  });

  const bestMatches = [...recentMatches]
    .sort((a, b) => (b.redScore + b.blueScore) - (a.redScore + a.blueScore))
    .slice(0, 5);

  const displayRecent = recentMatches.slice(0, 5);

  return (
    <main className="min-h-screen bg-surface-bg pb-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
        {/* Hero */}
        <header className="py-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16 border-b border-line mb-16 mt-8">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{
                  background: "linear-gradient(135deg, #00D4FF 0%, #0090FF 100%)",
                  boxShadow: "0 0 24px rgba(0,212,255,.35)",
                }}
              >
                ⚡
              </div>
              <div>
                <h1 className="font-head text-4xl sm:text-6xl font-extrabold text-txt-1 tracking-tighter">
                  Spark<span className="text-spark">VEX</span>
                </h1>
              </div>
            </div>
            <p className="text-[10px] md:text-xs font-mono text-txt-3 uppercase tracking-[0.3em]">
              Bayesian Alliance Engine
            </p>
            <p className="mt-4 text-txt-2 text-sm max-w-md">
              Data-driven alliance selection for VEX Robotics. Import match data, track Bayesian performance ratings, and find your ideal alliance partner.
            </p>
          </div>

          <div className="flex gap-3">
            {session ? (
              <Link href="/dashboard" className="btn-primary">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/auth/signin" className="btn-primary">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </header>

        <div className="grid gap-16 lg:grid-cols-[1fr_380px]">
          {/* Main: Top Teams */}
          <section className="space-y-12">
            <TopTeams teams={topTeams} />
            <div className="flex justify-center">
              <Link href="/teams" className="btn-ghost text-sm">View All Teams →</Link>
            </div>

            <div className="card p-8 border-l-[3px] border-l-spark">
              <h3 className="section-title mb-6">How it works</h3>
              <div className="grid gap-8 sm:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-sm font-bold text-spark uppercase tracking-widest border-b border-spark/20 pb-1.5">
                    Bayesian Strength
                  </p>
                  <p className="text-txt-2 text-sm leading-relaxed">
                    Automatically calculates team strength while accounting for alliance synergies and match-to-match variance.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-sm font-bold text-amber uppercase tracking-widest border-b border-amber/20 pb-1.5">
                    Confidence Intervals
                  </p>
                  <p className="text-txt-2 text-sm leading-relaxed">
                    Identifies which rankings are solidified and which teams need more scouting data to be certain.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Sidebar: Recent Matches & Best Matches */}
          <aside className="space-y-6">
            <BestMatches matches={bestMatches as any} />

            <div>
              <RecentMatches matches={displayRecent as any} currentTeamId="" />
              <div className="flex justify-center mt-4">
                <Link href="/matches" className="btn-ghost text-sm">View All Matches →</Link>
              </div>
            </div>
            <div className="mt-6 p-5 bg-spark/5 rounded-xl border border-spark/20">
              <p className="text-[10px] font-mono text-spark uppercase tracking-widest mb-1.5">Pro Tip</p>
              <p className="text-xs text-txt-2 leading-relaxed">
                Sign in to import your own match data from RobotEvents and see your team&apos;s Bayesian rating progression!
              </p>
            </div>
          </aside>
        </div>

        <footer className="mt-20 pt-8 text-center border-t border-line">
          <p className="text-[10px] text-txt-3 uppercase tracking-[0.3em] font-mono">
            © {new Date().getFullYear()} Sparks Robotics · Spark VEX System
          </p>
        </footer>
      </div>
    </main>
  );
}
