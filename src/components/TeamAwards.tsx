"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Award = {
    id: string;
    name: string;
    event: string;
};

export function TeamAwards({ teamNumber, awards }: { teamNumber: string, awards: Award[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showKeyInput, setShowKeyInput] = useState(false);
    const [apiKey, setApiKey] = useState("");

    // Load saved API key on mount
    useEffect(() => {
        const saved = localStorage.getItem("robot_events_api_key");
        if (saved) setApiKey(saved);
    }, []);

    async function handleSync(e?: React.FormEvent) {
        if (e) e.preventDefault();
        if (!apiKey) {
            setShowKeyInput(true);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch(`/api/teams/${teamNumber}/awards`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apiKey }),
            });
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 401) {
                    setError("Invalid API Key");
                    setShowKeyInput(true);
                } else {
                    setError(data.error || "Failed to sync awards");
                }
                setLoading(false);
                return;
            }

            // Save valid key, hide input, refresh page to get new awards
            localStorage.setItem("robot_events_api_key", apiKey);
            setShowKeyInput(false);
            setLoading(false);
            router.refresh();

        } catch (e: any) {
            setError("An unexpected error occurred");
            setLoading(false);
        }
    }

    // Group awards by event for cleaner display
    const awardsByEvent = awards.reduce((acc, award) => {
        if (!acc[award.event]) acc[award.event] = [];
        acc[award.event].push(award.name);
        return acc;
    }, {} as Record<string, string[]>);

    return (
        <div className="card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <div>
                    <h3 className="section-title">RobotEvents Awards</h3>
                    <p className="text-xs text-txt-3 mt-1">Official awards synced from RobotEvents</p>
                </div>

                {!showKeyInput ? (
                    <button
                        onClick={() => handleSync()}
                        disabled={loading}
                        className="btn-ghost flex items-center justify-center gap-2 text-xs"
                    >
                        {loading ? "Syncing..." : "Sync from RobotEvents"}
                    </button>
                ) : (
                    <form onSubmit={handleSync} className="flex items-center gap-2">
                        <input
                            type="password"
                            placeholder="RobotEvents API Key"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="input text-xs py-1.5 min-w-[200px]"
                            autoFocus
                        />
                        <button type="submit" disabled={loading} className="btn-primary py-1.5 px-3 text-xs">
                            {loading ? "..." : "Sync"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowKeyInput(false)}
                            className="btn-ghost py-1.5 px-3 text-xs"
                        >
                            Cancel
                        </button>
                    </form>
                )}
            </div>

            {error && <p className="text-xs text-danger mb-4">{error}</p>}

            {awards.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-line rounded-lg">
                    <p className="text-sm text-txt-3">No awards found for this team.</p>
                    <p className="text-xs text-txt-3/70 mt-1">If they have won awards, make sure your API key is correct and click Sync.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {Object.entries(awardsByEvent).map(([event, awardNames]) => (
                        <div key={event} className="border-l-[3px] border-spark pl-3">
                            <h4 className="text-sm font-semibold text-txt-1">{event}</h4>
                            <ul className="mt-2 space-y-1.5">
                                {awardNames.map((name, i) => (
                                    <li key={`${event}-${i}`} className="text-sm text-txt-2 flex items-center gap-2">
                                        <span className="text-amber">🏆</span> {name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
