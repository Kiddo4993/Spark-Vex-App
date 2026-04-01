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
                {/* 1. Website Overview */}
                <div className="card">
                    <h2 className="text-lg font-mono font-bold text-txt-1 mb-3 uppercase tracking-widest border-b border-line pb-2">1. Welcome to SparkVEX</h2>
                    <div className="space-y-4 text-sm text-txt-2 leading-relaxed">
                        <p>
                            Hey there! <strong>SparkVEX</strong> is a smart, data-driven tool we built to help robotics teams succeed. We use a cool math concept called a Bayesian Performance Model to evaluate how good teams truly are based on their match play. Here's a quick tour of what you can do:
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong className="text-txt-1">Dashboard (Imported Teams):</strong> This is your home base. It shows all the teams from tournaments you've uploaded data for, keeping things super relevant to your current event.</li>
                            <li><strong className="text-txt-1">Alliance Selection:</strong> We crunch the numbers using our Bayesian model to rank your opponents and potential partners. It's the perfect way to find teams that match your playstyle and consistency.</li>
                            <li><strong className="text-txt-1">Find & Connect:</strong> Looking for a team outside your region? You can search our entire database of almost 10,000 teams to see what world-class programs are up to.</li>
                            <li><strong className="text-txt-1">Team Profiles & Private Notes:</strong> Want to keep track of a specific team? You can dive into their stats and leave private scouting notes that only your team can see.</li>
                        </ul>
                    </div>
                </div>

                {/* 2. The Bayesian Model */}
                <div className="card">
                    <h2 className="text-lg font-mono font-bold text-txt-1 mb-3 uppercase tracking-widest border-b border-line pb-2">2. How Our Model Works</h2>
                    <div className="space-y-3 text-sm text-txt-2 leading-relaxed">
                        <p>
                            Most ranking systems just look at wins and losses, which doesn't really tell the whole story. SparkVEX uses a <strong>Bayesian Performance Model</strong>. Instead of just checking if a team won, we look closely at <em>who</em> they played against and <em>who</em> their partners were. This helps us figure out their actual contribution to the match.
                        </p>
                        <p>
                            When a team starts out, they get a baseline rating. As you upload more matches, we adjust their rating based on how they performed, and our <strong>Confidence Interval</strong> gets smaller, which means we're more sure of their actual skill level.
                        </p>
                    </div>
                </div>

                {/* 3. Importing Data */}
                <div className="card">
                    <h2 className="text-lg font-mono font-bold text-txt-1 mb-3 uppercase tracking-widest border-b border-line pb-2">3. Importing Match Data</h2>
                    <div className="space-y-3 text-sm text-txt-2 leading-relaxed">
                        <p>
                            If you want teams to show up on your dashboard, you'll need to upload the Excel (.xls) match data straight from Tournament Manager. Don't worry, we have a step-by-step tutorial with screenshots to guide you through it!
                        </p>
                        <a
                            href="https://docs.google.com/document/d/1QkZPt5vzlkWANJGR2gNyTO814pWpXtu8hT8J_cDw5Is/edit?pli=1&tab=t.0#heading=h.1knhsf7p9lel"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 font-bold border border-blue-500/30 bg-blue-500/10 px-4 py-2 mt-2 rounded transition-colors"
                        >
                            Check out the Full Import Guide on Google Docs -&gt;
                        </a>
                    </div>
                </div>

                {/* 4. Re-scouting & Confidence */}
                <div className="card border-l-[3px] border-danger bg-danger/5">
                    <h2 className="text-lg font-mono font-bold text-danger mb-3 uppercase tracking-widest border-b border-danger/20 pb-2">4. Wait, what does [!] RE-SCOUT mean?</h2>
                    <div className="space-y-3 text-sm text-txt-1 leading-relaxed">
                        <p>
                            Sometimes you'll spot a <strong>[!] RE-SCOUT</strong> or <strong>LOW CONFIDENCE</strong> warning next to a team. This simply means our model doesn't have enough data to confidently rate them just yet. 
                        </p>
                        <p>
                            If their confidence score is super low (like under 50%), their rating might jump around a lot in the next few matches.
                        </p>
                        <p className="font-bold">Here is what you should do:</p>
                        <ul className="list-disc pl-5 space-y-1 text-txt-2">
                            <li>Send one of your scouters to watch their next match.</li>
                            <li>Head over to their <Link href="/dashboard/teams" className="text-blue-400 hover:underline">Team Profile</Link> and manually adjust their Autonomous and Driver Control numbers.</li>
                            <li>Check out their robot and update your notes so you aren't guessing later.</li>
                        </ul>
                    </div>
                </div>

                {/* 5. Auton Compatibility */}
                <div className="card">
                    <h2 className="text-lg font-mono font-bold text-txt-1 mb-3 uppercase tracking-widest border-b border-line pb-2">5. Finding the Right Auton Fit</h2>
                    <div className="space-y-3 text-sm text-txt-2 leading-relaxed">
                        <p>
                            We all know how important the autonomous period is during Alliance Selection. Make sure you set your team's <strong>Auton Side</strong> (Left, Right, Both, or None) in your profile.
                        </p>
                        <p>
                            When you're looking at other teams, SparkVEX checks their Auton Side against yours. If you both only run on the Left side, you'll see a <strong><span className="text-txt-1 px-1 border border-txt-1">CONFLICTING</span></strong> tag. If your routines fit together nicely, it'll say <strong><span className="text-txt-1 px-1 border border-txt-1">COMPATIBLE</span></strong>.
                        </p>
                    </div>
                </div>

                {/* 6. Auto Strength, Driver Strength & Reliability */}
                <div className="card border-l-[3px] border-blue-500 bg-blue-500/5">
                    <h2 className="text-lg font-mono font-bold text-blue-400 mb-3 uppercase tracking-widest border-b border-blue-500/20 pb-2">6. Scouting Stats Explained</h2>
                    <div className="space-y-4 text-sm text-txt-2 leading-relaxed">
                        <p>
                            SparkVEX keeps track of two kinds of scouting data: the stuff teams <strong className="text-txt-1">self-report</strong> on their profiles, and the <strong className="text-txt-1">private notes</strong> you write. Knowing the difference really helps when picking your alliance partners.
                        </p>

                        <div className="bg-surface-card border border-line p-4 rounded space-y-3">
                            <p className="font-bold text-txt-1 text-xs font-mono uppercase tracking-widest">Auton Reliability % <span className="text-txt-3 font-normal">(Team Profile: Self-Reported)</span></p>
                            <p>
                                This is a percentage that teams set for themselves. It shows <strong className="text-txt-1">how reliably they think they can hit their auton</strong>: for example, if they land it 8 times out of 10, they'd put down 80%. This one is public and totally up to the team itself.
                            </p>
                        </div>

                        <div className="bg-surface-card border border-line p-4 rounded space-y-3">
                            <p className="font-bold text-txt-1 text-xs font-mono uppercase tracking-widest">Auto Strength <span className="text-txt-3 font-normal">(Public Profile or Private Scout)</span></p>
                            <p>
                                This is a simple <strong className="text-txt-1">0 to 10 scale</strong> showing <strong className="text-txt-1">how strong their autonomous routine is</strong>, with 10 being amazing and 1 being pretty unreliable. Teams can rate themselves publicly, but if you don't agree, you can <em>override</em> it with your own private rating using the Scouter Worksheet.
                            </p>
                        </div>

                        <div className="bg-surface-card border border-line p-4 rounded space-y-3">
                            <p className="font-bold text-txt-1 text-xs font-mono uppercase tracking-widest">Driver Strength <span className="text-txt-3 font-normal">(Public Profile or Private Scout)</span></p>
                            <p>
                                Just like Auto Strength, this is a <strong className="text-txt-1">0 to 10 scale</strong> for <strong className="text-txt-1">driver skill</strong>. Teams can post a public score, but you can always enter your own private rating based on what you actually see on the field.
                            </p>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded">
                            <p className="font-bold text-blue-400 mb-2 font-mono uppercase tracking-widest text-xs">How the Fallback Works:</p>
                            <ul className="list-disc pl-5 space-y-2 text-txt-2">
                                <li>If you haven't written any private notes on a team yet, the Alliance Selection table just uses the <strong className="text-txt-1">public rating they gave themselves</strong>.</li>
                                <li>As soon as you enter a number in their private Scouter Worksheet, the table <strong className="text-txt-1">ignores their public score</strong> and only uses yours.</li>
                                <li><strong>Privacy check:</strong> We keep your data safe. Other teams' private notes will <em>never</em> show up on your screen. You're only seeing the team's self-reported info or your own private notes.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 7. Connections & Chat */}
                <div className="card border-l-[3px] border-green-500 bg-green-500/5">
                    <h2 className="text-lg font-mono font-bold text-green-400 mb-3 uppercase tracking-widest border-b border-green-500/20 pb-2">7. Connections & Chat</h2>
                    <div className="space-y-4 text-sm text-txt-2 leading-relaxed">
                        <p>
                            SparkVEX makes it easy to collaborate with other teams. Using our built-in networking features, you can easily chat and strategize with potential alliance partners.
                        </p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong className="text-txt-1">Connecting:</strong> When you send a connection request, it stays in a <strong>Pending</strong> state until the other team accepts. Once approved, you can start messaging.</li>
                            <li><strong className="text-txt-1">The Red Bulb:</strong> Keep an eye out for the glowing <strong>red notification bulb</strong> in the navigation! It lights up to let you know you have unread messages or new pending connection requests waiting.</li>
                            <li><strong className="text-txt-1">Timestamps:</strong> Inside the chat, every message clearly shows the <strong>time</strong> it was sent, so you never lose track of the conversation flow during a busy event.</li>
                            <li><strong className="text-txt-1">Managing Contacts:</strong> Keeping your contact list clean is simple. If you need to remove a team from your network, you can easily <strong>Delete</strong> the connection from your contacts.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
