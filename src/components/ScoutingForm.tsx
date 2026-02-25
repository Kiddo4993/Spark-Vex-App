"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ScoutingForm({
    teamNumber,
    initialAuto,
    initialDriver,
}: {
    teamNumber: string;
    initialAuto: number | null;
    initialDriver: number | null;
}) {
    const router = useRouter();
    const [autoStrength, setAutoStrength] = useState<number | null>(initialAuto);
    const [driverStrength, setDriverStrength] = useState<number | null>(initialDriver);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess(false);

        try {
            const res = await fetch(`/api/teams/${encodeURIComponent(teamNumber)}/scout`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    autoStrength,
                    driverStrength,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.error ?? "Failed to save private scouting data.");
            } else {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
                router.refresh(); // Refresh the page to reflect in TeamProfileCard
            }
        } catch {
            setError("Something went wrong");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="card overflow-hidden">
            <div className="card-header bg-surface-bg border-b border-line py-2 flex justify-between items-center">
                <span className="text-[10px] font-mono tracking-widest text-txt-3 uppercase">Scouter Worksheet (Private)</span>
                <span className="text-[10px] text-txt-3 uppercase font-mono tracking-widest">Only visible to your team</span>
            </div>
            <div className="p-5 bg-surface-card">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-8">
                        {/* Auto Strength */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="label text-[10px] font-mono tracking-widest uppercase !mb-0">Auto Routine Strength</label>
                                {autoStrength !== null && (
                                    <button
                                        type="button"
                                        onClick={() => setAutoStrength(null)}
                                        className="text-[10px] text-danger font-mono tracking-widest uppercase hover:underline"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            {autoStrength === null ? (
                                <button
                                    type="button"
                                    onClick={() => setAutoStrength(5)}
                                    className="w-full border border-dashed border-line text-txt-3 hover:text-amber-500 hover:border-amber-500 py-3 text-[11px] uppercase tracking-widest font-mono transition-colors"
                                >
                                    + Add Auto Rating
                                </button>
                            ) : (
                                <>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs font-mono tracking-widest text-txt-3">0</span>
                                        <span className="font-mono text-xl font-bold text-amber-500">{autoStrength}</span>
                                        <span className="text-xs font-mono tracking-widest text-txt-3">10</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={0}
                                        max={10}
                                        step={0.5}
                                        value={autoStrength}
                                        onChange={(e) => setAutoStrength(parseFloat(e.target.value))}
                                        className="w-full accent-amber-500 cursor-pointer"
                                    />
                                </>
                            )}
                        </div>

                        {/* Driver Strength */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="label text-[10px] font-mono tracking-widest uppercase !mb-0">Driver Skill</label>
                                {driverStrength !== null && (
                                    <button
                                        type="button"
                                        onClick={() => setDriverStrength(null)}
                                        className="text-[10px] text-danger font-mono tracking-widest uppercase hover:underline"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            {driverStrength === null ? (
                                <button
                                    type="button"
                                    onClick={() => setDriverStrength(5)}
                                    className="w-full border border-dashed border-line text-txt-3 hover:text-green-500 hover:border-green-500 py-3 text-[11px] uppercase tracking-widest font-mono transition-colors"
                                >
                                    + Add Driver Rating
                                </button>
                            ) : (
                                <>
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-xs font-mono tracking-widest text-txt-3">0</span>
                                        <span className="font-mono text-xl font-bold text-green-500">{driverStrength}</span>
                                        <span className="text-xs font-mono tracking-widest text-txt-3">10</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={0}
                                        max={10}
                                        step={0.5}
                                        value={driverStrength}
                                        onChange={(e) => setDriverStrength(parseFloat(e.target.value))}
                                        className="w-full accent-green-500 cursor-pointer"
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {error && <p className="text-sm font-mono tracking-widest uppercase text-danger mt-4">{error}</p>}
                    {success && <p className="text-sm font-mono tracking-widest uppercase text-success mt-4">Scouting Data Saved</p>}

                    <div className="pt-2">
                        <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
                            {saving ? "SAVING…" : "SAVE SCOUTING INFO"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
