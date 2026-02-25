import Link from "next/link";
import { SampleLeaderboards } from "@/components/SampleLeaderboards";
import { sampleTournaments } from "@/lib/sampleData";

export default async function PublicTeamsPage() {
    return (
        <main className="min-h-screen bg-surface-bg pb-32">
            <div className="mx-auto max-w-5xl px-6 sm:px-10 lg:px-12 py-12">
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/" className="text-txt-3 hover:text-txt-1 transition-colors text-sm">
                        ← Home
                    </Link>
                </div>
                <h1 className="font-head text-3xl font-extrabold text-txt-1 tracking-tight mb-2">
                    Sample Leaderboards
                </h1>
                <p className="text-sm text-txt-2 mb-8">
                    Browse the preset sample leaderboards. Connect your team port to map your own tournament .XLS data.
                </p>
                <SampleLeaderboards datasets={sampleTournaments as any} />
            </div>
        </main>
    );
}
