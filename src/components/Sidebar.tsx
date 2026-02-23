"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const getSections = (teamNumber: string) => [
    {
        label: "Overview",
        items: [
            { href: "/dashboard", icon: "◈", label: "Dashboard" },
            { href: `/dashboard/teams/${teamNumber}`, icon: "◇", label: "Team Profile" },
            { href: "/dashboard/matches", icon: "⊡", label: "Matches", badge: true },
            { href: "/dashboard/import", icon: "↑", label: "Import Data" },
        ],
    },
    {
        label: "Competition",
        items: [
            { href: "/dashboard/alliance-selection", icon: "◉", label: "Alliance Selection" },
            { href: "/dashboard/teams", icon: "⊞", label: "Teams" },
            { href: "/dashboard/connections", icon: "⊙", label: "Connections" },
        ],
    },
    {
        label: "Workspace",
        items: [
            { href: "/dashboard/tasks", icon: "▣", label: "Task Board" },
        ],
    },
];

export function Sidebar({ teamNumber }: { teamNumber: string }) {
    const pathname = usePathname();

    return (
        <aside className="w-56 flex-shrink-0 bg-surface-card border-r border-line flex flex-col sticky top-0 h-screen overflow-y-auto">
            {/* Logo */}
            <div className="px-5 py-5 border-b border-line">
                <div className="flex items-center gap-2.5">
                    <div className="w-[34px] h-[34px] rounded-lg flex items-center justify-center text-[17px] flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #00D4FF 0%, #0090FF 100%)", boxShadow: "0 0 18px rgba(0,212,255,.35)" }}>
                        ⚡
                    </div>
                    <div>
                        <div className="font-head font-extrabold text-[17px] tracking-tight text-txt-1">
                            Spark<span className="text-spark">VEX</span>
                        </div>
                        <div className="text-[10px] font-mono text-txt-3 tracking-wider">
                            Bayesian Alliance Engine
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2">
                {getSections(teamNumber).map((section) => (
                    <div key={section.label} className="mb-1">
                        <div className="text-[9px] font-mono tracking-[0.12em] uppercase text-txt-3 px-2 pt-3 pb-1.5">
                            {section.label}
                        </div>
                        {section.items.map(({ href, icon, label }) => {
                            const isActive = pathname === href;
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`nav-item ${isActive ? "active" : ""}`}
                                >
                                    <span className="nav-icon">{icon}</span>
                                    {label}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* Team Info + Sign Out */}
            <div className="mt-auto px-5 py-3.5 border-t border-line">
                <div className="flex items-center gap-2.5">
                    <div className="team-avatar">
                        {teamNumber.slice(0, 2)}
                    </div>
                    <div className="overflow-hidden">
                        <div className="text-[13px] font-semibold text-txt-1 truncate">
                            Team {teamNumber}
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="text-[10px] font-mono text-txt-3 hover:text-danger transition-colors"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
