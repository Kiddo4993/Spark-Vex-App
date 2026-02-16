"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/tasks", label: "Tasks" },
  { href: "/dashboard/matches", label: "Matches" },
  { href: "/dashboard/teams", label: "Teams" },
  { href: "/dashboard/alliance-selection", label: "Alliance Selection" },
  { href: "/dashboard/import", label: "Import" },
  { href: "/dashboard/connections", label: "Connections" },
];

export function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1 overflow-x-auto py-2 px-1 bg-vex-darker/50 border-b border-vex-border mb-6">
      {nav.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${pathname === href
            ? "bg-vex-red text-white shadow-lg shadow-vex-red/20 font-bold"
            : "text-gray-400 hover:bg-vex-surface hover:text-white"
            }`}
        >
          {label}
        </Link>
      ))}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="ml-4 whitespace-nowrap rounded-lg border border-vex-border px-4 py-2 text-sm font-medium text-gray-400 transition-all duration-300 hover:bg-vex-red hover:text-white hover:border-vex-red"
      >
        Sign out
      </button>
    </nav>
  );
}
