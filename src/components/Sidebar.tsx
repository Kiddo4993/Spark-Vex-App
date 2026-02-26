"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const getAdminSections = () => [
    {
        label: "Management",
        items: [
            { href: "/dashboard/admin", label: "Admin Panel" },
        ],
    },
];

const getTeamSections = (teamNumber: string) => [
    {
        label: "Overview",
        items: [
            { href: "/dashboard", label: "Dashboard" },
            { href: `/dashboard/teams/${teamNumber}`, label: "Team Profile" },
            { href: "/dashboard/matches", label: "Matches" },
        ],
    },
    {
        label: "Database",
        items: [
            { href: "/dashboard/alliance-selection", label: "Alliance Selection" },
            { href: "/dashboard/teams", label: "Imported Teams" },
            { href: "/dashboard/connect", label: "Find & Connect" },
            { href: "/dashboard/connections", label: "Connections" },
        ],
    },
    {
        label: "Workspace",
        items: [
            { href: "/dashboard/import", label: "Import Tournament" },
            { href: "/dashboard/notes", label: "Team Notes" },
        ],
    },
    {
        label: "Help",
        items: [
            { href: "/dashboard/guide", label: "Walkthrough Guide" },
        ],
    },
];

export function Sidebar({ teamNumber, isAdmin = false }: { teamNumber: string; isAdmin?: boolean }) {
    const pathname = usePathname();
    const sections = isAdmin ? getAdminSections() : getTeamSections(teamNumber);

    // Fetch unread messages count
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (isAdmin) return;

        const fetchUnread = async () => {
            try {
                const res = await fetch("/api/messages/unread");
                if (res.ok) {
                    const data = await res.json();
                    setUnreadCount(data.unreadCount || 0);
                }
            } catch (e) {
                console.error(e);
            }
        };

        // Initial fetch
        fetchUnread();

        // Poll every 10 seconds
        const interval = setInterval(fetchUnread, 10000);
        return () => clearInterval(interval);
    }, [isAdmin]);

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
                            Bayesian Performance
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
                        {section.items.map((item) => {
                            const { href, label } = item;
                            const isExternal = (item as any).external;
                            const isActive = pathname === href;
                            const showUnreadDot = label === "Connections" && unreadCount > 0;

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    target={isExternal ? "_blank" : undefined}
                                    rel={isExternal ? "noopener noreferrer" : undefined}
                                    className={`nav-item ${isActive ? "active" : ""} flex items-center justify-between`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-txt-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                                        {label}
                                    </div>
                                    {showUnreadDot && (
                                        <div className="w-2 h-2 rounded-full bg-danger animate-pulse mr-2" />
                                    )}
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
