import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { TopTeams } from "@/components/TopTeams";

export default async function PublicTeamsPage() {
    const teams = await prisma.team.findMany({
        where: { teamNumber: { not: "ADMIN" } },
        orderBy: { performanceRating: "desc" },
        take: 50,
        select: {
            id: true,
            teamNumber: true,
            performanceRating: true,
            ratingUncertainty: true,
            matchCount: true,
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
                    All Teams
                </h1>
                <p className="text-sm text-txt-2 mb-8">
                    Browse all registered VEX Robotics teams and their Bayesian performance ratings.
                </p>
                <TopTeams teams={teams} />
            </div>
        </main>
    );
}
