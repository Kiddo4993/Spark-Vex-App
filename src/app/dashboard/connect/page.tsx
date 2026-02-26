"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ConnectSearchPage() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    async function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            // Using the existing API but passing 'global=true' or just treating it as a global query
            const res = await fetch(`/api/teams/global?search=${encodeURIComponent(query.trim())}`);
            if (res.ok) {
                const data = await res.json();
                setResults(Array.isArray(data) ? data : data.teams ?? []);
            }
        } catch (error) {
            console.error(error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-5xl">
            <div>
                <h1 className="font-head text-4xl font-extrabold text-txt-1 tracking-tight uppercase">Find & Connect</h1>
                <p className="text-xs font-mono tracking-widest uppercase text-txt-3 mt-1">
                    Search the global database of all stored teams
                </p>
            </div>

            <div className="card">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search teams by number, state, or country..."
                        className="input flex-1"
                    />
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? "SEARCHING..." : "SEARCH"}
                    </button>
                </form>
            </div>

            {searched && (
                <div className="space-y-4">
                    <h2 className="text-xs font-mono tracking-widest text-txt-3 uppercase">{results.length} Teams Found</h2>

                    {results.length === 0 ? (
                        <div className="card text-center py-12 text-sm text-txt-3 font-mono">
                            No teams found matching "{query}"
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {results.map((team) => (
                                <Link
                                    href={`/dashboard/teams/${team.teamNumber}`}
                                    key={team.id}
                                    className="card hover:border-txt-1 transition-colors group cursor-pointer"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-head text-2xl font-bold text-txt-1 group-hover:text-blue-500 transition-colors">
                                                {team.teamNumber}
                                            </h3>
                                            <div className="text-[10px] font-mono tracking-widest text-txt-3 uppercase mt-1">
                                                {team.provinceState || "Unknown"} {team.country ? `/ ${team.country}` : ""}
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-mono tracking-widest uppercase border border-line px-2 py-1 rounded bg-surface-bg text-txt-2">
                                            View Profile
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
