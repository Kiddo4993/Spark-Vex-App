import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SampleLeaderboards } from "@/components/SampleLeaderboards";
import tournamentData from "@/lib/tournamentData.json";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="min-h-screen bg-surface-bg pb-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
        {/* Hero */}
        <header className="py-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16 border-b border-line mb-16 mt-8">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-4 mb-6 justify-center md:justify-start">
              <div className="w-14 h-14 bg-txt-1 text-surface-bg flex items-center justify-center font-head font-bold text-3xl rounded-sm">
                X
              </div>
              <div>
                <h1 className="font-head text-5xl sm:text-7xl font-extrabold text-txt-1 tracking-tighter leading-none">
                  SparkVEX
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

        <div className="grid gap-16 lg:grid-cols-2">
          {/* Main: Explanation */}
          <section className="space-y-8">
            <div>
              <h3 className="section-title mb-8 text-3xl font-extrabold text-txt-1 tracking-tight">Why Spark?</h3>

              <div className="space-y-10">
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest border-b border-blue-500/20 pb-2">
                    BAYESIAN PERFORMANCE MODEL
                  </p>
                  <p className="text-txt-2 text-sm leading-relaxed">
                    Compared to traditional ranking systems such as the Elo system, the Bayesian Performance Model accounts for inconsistencies, allocates <span className="text-blue-500 font-medium tracking-tight">scoring fairly</span>, and <span className="text-blue-500 font-medium tracking-tight">gives each team</span> an uncertainty rating. This results in a more layered and less volatile model.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-bold text-blue-500 uppercase tracking-widest border-b border-blue-500/20 pb-1.5">
                    RANK TEAMS FROM ANY TOURNAMENT
                  </p>
                  <p className="text-txt-2 text-sm leading-relaxed">
                    Upload the .XLS file from Robot Events and get quick results and rankings.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest border-b border-red-500/20 pb-2">
                    DIRECT MESSAGE OTHER TEAMS
                  </p>
                  <p className="text-txt-2 text-sm leading-relaxed">
                    Quickly get in contact with teams without the hassle of finding their contact information.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-bold text-blue-400 uppercase tracking-widest border-b border-blue-400/20 pb-1.5">
                    TEAM PROFILES
                  </p>
                  <p className="text-txt-2 text-sm leading-relaxed">
                    Make a profile for your team to make it easier for others to discover you. Add details such as pictures of your bot, your type <span className="text-blue-500 font-medium">of match</span>, autonomous, and a description of your team.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-bold text-red-500 uppercase tracking-widest border-b border-red-500/20 pb-1.5">
                    SCOUTING NOTES
                  </p>
                  <p className="text-txt-2 text-sm leading-relaxed">
                    Quickly add notes <span className="text-blue-500 font-medium">about teams</span> you're interested in aligning with, <span className="text-blue-500 font-medium">such as</span> driver skill, autonomous side, autonomous type, and bot type.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Sidebar: Sample Data */}
          <aside className="space-y-8 lg:pl-8 lg:border-l lg:border-line">
            <SampleLeaderboards datasets={tournamentData as any} />
            <div className="mt-8 p-6 bg-surface-card border-l-[3px] border-l-blue-600 border border-line shadow-lg shadow-blue-900/5">
              <h4 className="text-[11px] font-mono text-blue-500 uppercase tracking-[0.2em] font-bold mb-3">Notice</h4>
              <p className="text-sm text-txt-2 leading-relaxed">
                The rankings above are derived from specific tournament data (Space City, Mecha Mayhem, Southridge) using our Bayesian engine. Sign in to import your own data.
              </p>
              <div className="mt-5">
                <Link href="/auth/signin" className="text-xs font-mono text-txt-1 underline tracking-[0.2em] uppercase hover:text-blue-400 transition-colors">Log In Here →</Link>
              </div>
            </div>
          </aside>
        </div>

        <footer className="mt-24 pt-8 text-center border-t border-line">
          <p className="text-[10px] text-txt-3 uppercase tracking-[0.3em] font-mono">
            © 2026 77174A Holy Airball! · Spark VEX
          </p>
        </footer>
      </div>
    </main>
  );
}
