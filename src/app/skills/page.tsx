"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import skillsData from "@/lib/skillsData.json";

type SkillsTeam = {
    rank: number;
    teamNumber: string;
    teamName: string;
    score: number;
    auto: number;
    driver: number;
    org: string;
    region: string;
};

const PAGE_SIZE = 50;

export default function SkillsPage() {
    const [division, setDivision] = useState<"hs" | "ms">("hs");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);

    const teams: SkillsTeam[] = division === "hs" ? skillsData.hs : skillsData.ms;

    const filtered = useMemo(() => {
        if (!search.trim()) return teams;
        const q = search.trim().toUpperCase();
        return teams.filter(
            (t) =>
                t.teamNumber.toUpperCase().includes(q) ||
                t.teamName.toUpperCase().includes(q) ||
                t.org.toUpperCase().includes(q) ||
                t.region.toUpperCase().includes(q)
        );
    }, [teams, search]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const pageTeams = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    return (
        <main className="min-h-screen bg-surface-bg pb-32">
            <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12 py-12">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/" className="text-txt-3 hover:text-txt-1 transition-colors text-sm">
                        ← Home
                    </Link>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-head text-3xl font-extrabold text-txt-1 tracking-tight">
                            World Skills Rankings
                        </h1>
                        <p className="text-sm text-txt-2 mt-1">
                            {division === "hs" ? "High School" : "Middle School"} · {filtered.length.toLocaleString()} teams
                        </p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <select
                            value={division}
                            onChange={(e) => { setDivision(e.target.value as "hs" | "ms"); setPage(0); setSearch(""); }}
                            className="bg-surface-bg border border-line text-txt-1 text-xs font-mono py-2 px-3 uppercase tracking-widest focus:outline-none focus:border-spark transition-colors cursor-pointer"
                        >
                            <option value="hs">High School</option>
                            <option value="ms">Middle School</option>
                        </select>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        placeholder="Search by team number, name, org, or region…"
                        className="input w-full sm:max-w-md"
                    />
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="data-table w-full">
                        <thead>
                            <tr>
                                <th className="w-16 text-center">Rank</th>
                                <th>Team</th>
                                <th className="hidden sm:table-cell">Organization</th>
                                <th className="hidden md:table-cell">Region</th>
                                <th className="text-right">Score</th>
                                <th className="text-right hidden sm:table-cell">Auto</th>
                                <th className="text-right hidden sm:table-cell">Driver</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageTeams.map((team) => (
                                <tr key={`${division}-${team.teamNumber}`}>
                                    <td className="text-center font-mono text-txt-3">{team.rank}</td>
                                    <td>
                                        <div>
                                            <span className="team-num-chip bg-line-hi transition-colors block w-max cursor-default">
                                                {team.teamNumber}
                                            </span>
                                            {team.teamName && team.teamName !== team.teamNumber && (
                                                <span className="text-[10px] text-txt-3 font-mono mt-0.5 block">
                                                    {team.teamName}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="hidden sm:table-cell text-xs text-txt-2 truncate max-w-[200px]">
                                        {team.org || "—"}
                                    </td>
                                    <td className="hidden md:table-cell text-xs text-txt-3 truncate max-w-[150px]">
                                        {team.region || "—"}
                                    </td>
                                    <td className="text-right font-mono font-bold text-[15px] text-txt-1">
                                        {team.score}
                                    </td>
                                    <td className="text-right font-mono text-xs text-cyan-400 hidden sm:table-cell">
                                        {team.auto}
                                    </td>
                                    <td className="text-right font-mono text-xs text-amber-400 hidden sm:table-cell">
                                        {team.driver}
                                    </td>
                                </tr>
                            ))}
                            {pageTeams.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-txt-3 font-mono text-xs uppercase tracking-widest">
                                        No teams match your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <button
                            onClick={() => setPage(Math.max(0, page - 1))}
                            disabled={page === 0}
                            className="text-xs font-mono text-txt-3 hover:text-txt-1 transition-colors uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            ← Previous
                        </button>
                        <span className="text-xs font-mono text-txt-3 uppercase tracking-widest">
                            Page {page + 1} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                            disabled={page >= totalPages - 1}
                            className="text-xs font-mono text-txt-3 hover:text-txt-1 transition-colors uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Next →
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-line text-center">
                    <p className="text-[10px] text-txt-3 uppercase tracking-[0.3em] font-mono">
                        Data sourced from RobotEvents World Skills Standings
                    </p>
                </div>
            </div>
        </main>
    );
}
