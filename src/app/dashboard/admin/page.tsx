"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Credential = {
    teamNumber: string;
    password: string;
    hasAccount: boolean;
};

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState("");

    const isAdmin = (session?.user as any)?.isAdmin;

    useEffect(() => {
        if (status === "loading") return;
        if (!session || !isAdmin) {
            router.push("/dashboard");
            return;
        }
        fetchCredentials();
    }, [session, status]);

    async function fetchCredentials() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/credentials");
            const data = await res.json();
            if (data.credentials) {
                setCredentials(data.credentials);
            } else {
                setError(data.error || "Failed to load credentials");
            }
        } catch {
            setError("Failed to load credentials");
        }
        setLoading(false);
    }

    async function handleRegenerate() {
        if (!confirm("Are you sure you want to regenerate ALL team passwords? This will invalidate all current passwords.")) return;
        setRegenerating(true);
        try {
            const res = await fetch("/api/admin/credentials", { method: "POST" });
            const data = await res.json();
            if (data.success) {
                fetchCredentials();
            } else {
                setError(data.error || "Failed to regenerate");
            }
        } catch {
            setError("Failed to regenerate passwords");
        }
        setRegenerating(false);
    }

    function copyAll() {
        const text = credentials
            .map(c => `${c.teamNumber}\t${c.password}`)
            .join("\n");
        navigator.clipboard.writeText(`Team Number\tPassword\n${text}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    if (status === "loading" || loading) {
        return (
            <div className="p-6">
                <div className="text-center py-20 border border-line bg-surface-bg">
                    <div className="inline-block animate-spin rounded-none h-10 w-10 border-t-2 border-r-2 border-spark mb-6"></div>
                    <p className="text-[11px] text-spark font-mono uppercase tracking-widest font-bold animate-pulse">LOADING ADMIN PANEL...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="font-head text-4xl font-black tracking-tighter text-txt-1 uppercase">
                        ADMIN PANEL
                    </h1>
                    <p className="text-[11px] font-mono text-txt-3 tracking-widest uppercase mt-1">
                        TEAM CREDENTIALS MANAGEMENT
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-danger/10 border border-danger/30 p-3 text-[11px] font-mono text-danger uppercase tracking-widest text-center">
                    {error}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={copyAll}
                    disabled={credentials.length === 0}
                    className="btn-primary !font-mono !tracking-widest !uppercase !text-[11px]"
                >
                    {copied ? "✓ COPIED" : "[ COPY ALL TO CLIPBOARD ]"}
                </button>
                <button
                    onClick={handleRegenerate}
                    disabled={regenerating || credentials.length === 0}
                    className="btn-danger !font-mono !tracking-widest !uppercase !text-[11px]"
                >
                    {regenerating ? "REGENERATING…" : "[ REGENERATE ALL PASSWORDS ]"}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-line border border-line">
                <div className="bg-surface-card p-4">
                    <div className="text-[10px] font-mono uppercase text-txt-3 mb-2">TOTAL TEAMS</div>
                    <div className="font-mono text-2xl font-bold text-txt-1">{credentials.length}</div>
                </div>
                <div className="bg-surface-card p-4">
                    <div className="text-[10px] font-mono uppercase text-txt-3 mb-2">WITH ACCOUNTS</div>
                    <div className="font-mono text-2xl font-bold text-success">{credentials.filter(c => c.hasAccount).length}</div>
                </div>
                <div className="bg-surface-card p-4">
                    <div className="text-[10px] font-mono uppercase text-txt-3 mb-2">STATUS</div>
                    <div className="font-mono text-2xl font-bold text-gold">ACTIVE</div>
                </div>
            </div>

            {/* Credentials Table */}
            <div className="border border-line">
                <div className="bg-surface-bg border-b border-line px-4 py-3 flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-txt-1">
                        TEAM CREDENTIALS
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-txt-3">
                        {credentials.length} TEAMS
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-surface-bg">
                                <th className="text-[10px] font-mono tracking-wider uppercase text-txt-2 px-4 py-3 text-left border-b border-line">#</th>
                                <th className="text-[10px] font-mono tracking-wider uppercase text-txt-2 px-4 py-3 text-left border-b border-line">TEAM NUMBER</th>
                                <th className="text-[10px] font-mono tracking-wider uppercase text-txt-2 px-4 py-3 text-left border-b border-line">PASSWORD</th>
                                <th className="text-[10px] font-mono tracking-wider uppercase text-txt-2 px-4 py-3 text-left border-b border-line">STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {credentials.map((c, i) => (
                                <tr key={c.teamNumber} className="hover:bg-surface-hover transition-colors">
                                    <td className="px-4 py-3 text-[11px] font-mono text-txt-3 border-b border-line">{i + 1}</td>
                                    <td className="px-4 py-3 border-b border-line">
                                        <span className="font-mono text-[13px] font-bold text-gold tracking-wider">{c.teamNumber}</span>
                                    </td>
                                    <td className="px-4 py-3 border-b border-line">
                                        <code className="font-mono text-[13px] text-txt-1 bg-surface-bg border border-line px-2 py-1 tracking-widest select-all">{c.password}</code>
                                    </td>
                                    <td className="px-4 py-3 border-b border-line">
                                        <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${c.hasAccount ? "text-success" : "text-danger"}`}>
                                            {c.hasAccount ? "ACTIVE" : "NO ACCOUNT"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {credentials.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-12 text-center">
                                        <p className="text-[11px] font-mono text-txt-3 uppercase tracking-widest">
                                            No team credentials yet. Import match data to auto-generate accounts.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
