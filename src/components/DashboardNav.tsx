"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type TeamResult = { id: string; teamNumber: string; performanceRating: number };

export function DashboardNav() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TeamResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleChange(value: string) {
    setQuery(value);
    if (timer.current) clearTimeout(timer.current);
    if (value.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/teams?search=${encodeURIComponent(value.trim())}`);
        if (res.ok) {
          const data = await res.json();
          const teams = Array.isArray(data) ? data : data.teams ?? [];
          setResults(teams.slice(0, 8));
          setOpen(teams.length > 0);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function handleSelect(teamNumber: string) {
    setOpen(false);
    setQuery("");
    router.push(`/dashboard/teams/${teamNumber}`);
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 bg-surface-card border border-line rounded px-3 py-1.5 w-[240px] text-[13px] text-txt-3 hover:border-line-hi transition-colors focus-within:border-txt-3">
        <span className="opacity-50 text-[12px]">◈</span>
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="Search teams, matches…"
          className="bg-transparent border-none outline-none w-full text-[12px] font-mono text-txt-1 placeholder:text-txt-3/50"
        />
        {loading && (
          <div className="w-2.5 h-2.5 border border-txt-3/30 border-t-txt-1 rounded-full animate-spin" />
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 mt-1.5 w-full bg-surface-card border border-line rounded z-[100] overflow-hidden animate-fade-in shadow-2xl shadow-black">
          {results.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelect(t.teamNumber)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-surface-hover transition-colors text-left border-b border-line last:border-0"
            >
              <div>
                <span className="font-mono text-[13px] font-bold text-txt-1">{t.teamNumber}</span>
              </div>
              <span className="font-mono text-[11px] text-gold">{Math.round(t.performanceRating * 10) / 10}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
