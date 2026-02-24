"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function NotesPage() {
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch("/api/teams")
            .then((res) => res.json())
            .then((data) => {
                setNotes(data.notes || "");
                setLoading(false);
            })
            .catch(() => {
                toast.error("Failed to load notes");
                setLoading(false);
            });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/teams", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notes }),
            });
            if (res.ok) {
                toast.success("Notes saved");
            } else {
                toast.error("Failed to save notes");
            }
        } catch (e) {
            toast.error("Failed to save notes");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 font-mono text-txt-3 animate-pulse uppercase tracking-widest text-xs text-center border border-dashed border-line">Initializing Analyst Notes...</div>;

    return (
        <div className="max-w-4xl space-y-6 animate-fade-in">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="page-title">Team Notes</h1>
                    <p className="page-subtitle">Internal strategy and observations</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary"
                >
                    {saving ? "Saving..." : "Save Notes"}
                </button>
            </div>

            <div className="card">
                <div className="card-header bg-surface-bg border-b border-line py-2 flex items-center justify-between">
                    <span className="text-[10px] font-mono tracking-widest text-txt-3 uppercase px-4">Workspace</span>
                    <span className="text-[9px] font-mono text-txt-3 uppercase italic px-4">Plaintext Only</span>
                </div>
                <div className="p-0">
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Write your team's internal notes here... strategy, build updates, scouting summaries, etc."
                        className="w-full h-[600px] bg-transparent text-txt-1 font-mono text-sm p-8 focus:outline-none resize-none placeholder:text-txt-3/50 leading-relaxed"
                    />
                </div>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-txt-3 uppercase tracking-widest bg-surface-card border border-line p-3">
                <div className="flex items-center gap-4">
                    <span>Characters: {notes.length}</span>
                    <span>Words: {notes.trim() ? notes.trim().split(/\s+/).length : 0}</span>
                </div>
                <span className="italic">Autosave disabled. Please click save.</span>
            </div>
        </div>
    );
}
