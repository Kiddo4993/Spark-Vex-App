import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { RecentMatches } from "@/components/RecentMatches";

export default async function PublicMatchesPage() {
    const matches = await prisma.match.findMany({
        orderBy: { date: "desc" },
        take: 50,
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
        <main className="min-h-screen bg-surface-bg pb-32">
            <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-12 py-12">
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/" className="text-txt-3 hover:text-txt-1 transition-colors text-sm">
                        ← Home
                    </Link>
                </div>
                <h1 className="font-head text-3xl font-extrabold text-txt-1 tracking-tight mb-2">
                    Match Results
                </h1>
                <p className="text-sm text-txt-2 mb-8">
                    All recorded VEX Robotics match results and scores.
                </p>
                <RecentMatches matches={matches as any} currentTeamId="" />
            </div>
        </main>
    );
}
