"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/matches", label: "Matches" },
  { href: "/dashboard/teams", label: "Teams" },
  { href: "/dashboard/connections", label: "Connections" },
];

export function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-2">
      {nav.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            pathname === href
              ? "bg-vex-dark text-white"
              : "text-gray-400 hover:bg-vex-dark/60 hover:text-gray-200"
          }`}
        >
          {label}
        </Link>
      ))}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="ml-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-vex-dark/60 hover:text-gray-200"
      >
        Sign out
      </button>
    </nav>
  );
}
