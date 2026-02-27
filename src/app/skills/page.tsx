"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import tournamentData from "@/lib/tournamentData.json";

type RankedTeam = {
    rank: number;
    teamNumber: string;
    performanceRating: number;
    ratingUncertainty: number;
    matchCount: number;
};

const PAGE_SIZE = 50;

export default function TournamentRankingsPage() {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);

    const currentTournament = tournamentData[selectedIndex];
    const teams = useMemo(() => {
        return currentTournament.teams.map((t, i) => ({
            ...t,
            rank: i + 1
        })) as RankedTeam[];
    }, [currentTournament]);

    const filtered = useMemo(() => {
        if (!search.trim()) return teams;
        const q = search.trim().toUpperCase();
        return teams.filter(
            (t) =>
                t.teamNumber.toUpperCase().includes(q)
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
                            Tournament Rankings
                        </h1>
                        <p className="text-sm text-txt-2 mt-1">
                            {currentTournament.label} · {filtered.length.toLocaleString()} teams
                        </p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <select
                            value={selectedIndex}
                            onChange={(e) => { setSelectedIndex(Number(e.target.value)); setPage(0); setSearch(""); }}
                            className="bg-surface-bg border border-line text-txt-1 text-xs font-mono py-2 px-3 uppercase tracking-widest focus:outline-none focus:border-spark transition-colors cursor-pointer"
                        >
                            {tournamentData.map((ds, i) => (
                                <option key={ds.label} value={i}>
                                    {ds.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                        placeholder="Search by team number…"
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
                                <th className="text-right">Performance Rating</th>
                                <th className="text-right hidden sm:table-cell">Uncertainty</th>
                                <th className="text-right hidden sm:table-cell">Matches</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageTeams.map((team) => (
                                <tr key={`${selectedIndex}-${team.teamNumber}`}>
                                    <td className="text-center font-mono text-txt-3">{team.rank}</td>
                                    <td>
                                        <div>
                                            <span className="team-num-chip bg-line-hi transition-colors block w-max cursor-default">
                                                {team.teamNumber}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="text-right font-mono font-bold text-[18px] text-txt-1">
                                        {team.performanceRating}
                                    </td>
                                    <td className="text-right font-mono text-xs text-blue-400 hidden sm:table-cell">
                                        ±{team.ratingUncertainty}
                                    </td>
                                    <td className="text-right font-mono text-xs text-txt-3 hidden sm:table-cell">
                                        {team.matchCount}
                                    </td>
                                </tr>
                            ))}
                            {pageTeams.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-txt-3 font-mono text-xs uppercase tracking-widest">
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
                        Data generated using Bayesian Performance Model from Tournament Results
                    </p>
                </div>
            </div>
        </main>
    );
}
