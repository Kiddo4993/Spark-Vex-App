"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ScoutingForm({
    teamNumber,
    initialAuto,
    initialDriver,
    initialNotes,
    isOwnProfile = false,
}: {
    teamNumber: string;
    initialAuto: number | null;
    initialDriver: number | null;
    initialNotes: string | null;
    isOwnProfile?: boolean;
}) {
    const router = useRouter();
    const [autoStrength, setAutoStrength] = useState<number | null>(initialAuto);
    const [driverStrength, setDriverStrength] = useState<number | null>(initialDriver);
    const [notes, setNotes] = useState(initialNotes ?? "");
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
                    notes: notes || null,
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
                <span className="text-[10px] font-mono tracking-widest text-txt-3 uppercase">
                    {isOwnProfile ? "Your Public Profile" : "Scouter Worksheet (Private)"}
                </span>
                <span className="text-[10px] text-txt-3 uppercase font-mono tracking-widest">
                    {isOwnProfile ? "Visible to all teams" : "Only visible to your team"}
                </span>
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

                        {/* Notes */}
                        <div className="border-t border-line pt-6">
                            <h4 className="text-[11px] font-mono tracking-widest uppercase text-txt-1 mb-4">
                                {isOwnProfile ? "Public Description" : "Private Notes"}
                            </h4>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="input min-h-[100px] resize-y font-mono text-[13px]"
                                placeholder={isOwnProfile
                                    ? "Write a public description about your team, robot, strategy..."
                                    : "Write private notes about this team's performance, autos, interactions..."}
                                rows={4}
                            />
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
