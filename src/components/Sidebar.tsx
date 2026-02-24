"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const getAdminSections = () => [
    {
        label: "Management",
        items: [
            { href: "/dashboard/import", icon: "↑", label: "Import Matches" },
            { href: "/dashboard/admin", icon: "⚙", label: "Admin Panel" },
        ],
    },
];

const getTeamSections = (teamNumber: string) => [
    {
        label: "Overview",
        items: [
            { href: "/dashboard", icon: "◈", label: "Dashboard" },
            { href: `/dashboard/teams/${teamNumber}`, icon: "◇", label: "Team Profile" },
            { href: "/dashboard/matches", icon: "⊡", label: "Matches" },
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
            { href: "/dashboard/notes", icon: "✎", label: "Team Notes" },
        ],
    },
];

export function Sidebar({ teamNumber, isAdmin = false }: { teamNumber: string; isAdmin?: boolean }) {
    const pathname = usePathname();
    const sections = isAdmin ? getAdminSections() : getTeamSections(teamNumber);

    return (
        <aside className="w-56 flex-shrink-0 bg-surface-card border-r border-line flex flex-col sticky top-0 h-screen overflow-y-auto">
            {/* Logo */}
            <div className="px-5 py-6 border-b border-line">
                <div className="flex items-center gap-2.5">
                    <div className="w-[32px] h-[32px] bg-txt-1 text-surface-bg flex items-center justify-center font-head font-bold text-lg">
                        X
                    </div>
                    <div>
                        <div className="font-head font-bold text-[18px] tracking-tight text-txt-1">
                            SparkVEX
                        </div>
                        <div className="text-[9px] font-mono text-txt-3 tracking-widest uppercase mt-[2px]">
                            Analyst Suite
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4">
                {sections.map((section) => (
                    <div key={section.label} className="mb-4">
                        <div className="text-[10px] font-mono tracking-[0.15em] uppercase text-txt-3 px-5 pb-2">
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
            <div className="px-5 py-4 border-t border-line">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-mono text-txt-3 uppercase tracking-widest mb-1">
                            {isAdmin ? "Admin Access" : "Active Team"}
                        </div>
                        <div className="font-mono font-bold text-gold text-[15px]">
                            {teamNumber}
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="text-[10px] font-mono text-txt-3 hover:text-danger focus:outline-none transition-colors border border-line px-2 py-1 bg-surface-bg hover:border-danger hover:bg-danger/10"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </aside>
    );
}
