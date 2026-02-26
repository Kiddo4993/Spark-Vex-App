"use client";

import Link from "next/link";

export default function GuidePage() {
    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-12">
            <div>
                <h1 className="font-head text-4xl font-extrabold text-txt-1 tracking-tight uppercase">Walkthrough Guide</h1>
                <p className="text-xs font-mono tracking-widest uppercase text-txt-3 mt-1">
                    How to use the Bayesian Performance Model effectively
                </p>
            </div>

            <div className="grid gap-6">
                {/* 1. Introduction */}
                <div className="card">
                    <h2 className="text-lg font-mono font-bold text-txt-1 mb-3 uppercase tracking-widest border-b border-line pb-2">1. The Bayesian Model</h2>
                    <div className="space-y-3 text-sm text-txt-2 leading-relaxed">
                        <p>
                            Unlike traditional ranking systems, SparkVEX uses a <strong>Bayesian Performance Model</strong> to evaluate teams. This means that instead of just looking at win/loss records, the system analyzes <em>who</em> a team played against and <em>who</em> their partners were to isolate their individual contribution to a match.
                        </p>
                        <p>
                            Every team starts with a baseline rating. As you upload match data, their rating adjusts based on performance, and their <strong>Confidence Interval</strong> shrinks.
                        </p>
                    </div>
                </div>

                {/* 2. Importing Data */}
                <div className="card">
                    <h2 className="text-lg font-mono font-bold text-txt-1 mb-3 uppercase tracking-widest border-b border-line pb-2">2. Importing Match Data</h2>
                    <div className="space-y-3 text-sm text-txt-2 leading-relaxed">
                        <p>
                            To populate your dashboard, you must upload Excel (.xls) match data exported from Tournament Manager.
                        </p>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>Go to the <Link href="/dashboard/import" className="text-blue-500 hover:underline">Import</Link> page.</li>
                            <li>Upload your `.xls` file containing match results.</li>
                            <li>Map the required columns (Red Score, Blue Score, Teams, Date).</li>
                            <li>Confirm and import. The system will calculate Bayesian ratings for all teams in that tournament.</li>
                        </ol>
                    </div>
                </div>

                {/* 3. Re-scouting & Confidence */}
                <div className="card border-l-[3px] border-danger bg-danger/5">
                    <h2 className="text-lg font-mono font-bold text-danger mb-3 uppercase tracking-widest border-b border-danger/20 pb-2">3. What is Re-Scout?</h2>
                    <div className="space-y-3 text-sm text-txt-1 leading-relaxed">
                        <p>
                            You may see a <strong>⚠️ RE-SCOUT</strong> or <strong>LOW CONFIDENCE</strong> warning next to certain teams. This happens when the Bayesian model doesn't have enough consistent data to be sure of their actual performance level.
                        </p>
                        <p>
                            A low confidence score (usually below 50%) means their rating could fluctuate wildly in their next few matches.
                        </p>
                        <p className="font-bold">What you should do:</p>
                        <ul className="list-disc pl-5 space-y-1 text-txt-2">
                            <li>Send a scouter to watch their next match.</li>
                            <li>Open their <Link href="/dashboard/teams" className="text-blue-400 hover:underline">Team Profile</Link> and update their Autonomous and Driver Control strengths manually.</li>
                            <li>Check their robot configuration and note their actual performance to offset the model's uncertainty.</li>
                        </ul>
                    </div>
                </div>

                {/* 4. Auton Compatibility */}
                <div className="card">
                    <h2 className="text-lg font-mono font-bold text-txt-1 mb-3 uppercase tracking-widest border-b border-line pb-2">4. Auton Compatibility</h2>
                    <div className="space-y-3 text-sm text-txt-2 leading-relaxed">
                        <p>
                            When preparing for Alliance Selection, autonomous compatibility is critical. Ensure you configure your own team's <strong>Auton Side</strong> (Left, Right, Both, None) in your profile.
                        </p>
                        <p>
                            When viewing other team profiles in the database, SparkVEX will automatically compare their Auton Side to yours. If both teams are locked to the same side (e.g., both only run Left routines), you will see a <strong><span className="text-txt-1 px-1 border border-txt-1">CONFLICTING</span></strong> tag. If your routines don't overlap, it will say <strong><span className="text-txt-1 px-1 border border-txt-1">COMPATIBLE</span></strong>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
