"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Skills = {
  driverSkillsScore: number | null;
  autonomousSkillsScore: number | null;
  combinedSkillsScore: number | null;
} | null;

export function SkillsForm({ initialSkills }: { initialSkills: Skills }) {
  const router = useRouter();
  const [driver, setDriver] = useState(initialSkills?.driverSkillsScore ?? "");
  const [auton, setAuton] = useState(initialSkills?.autonomousSkillsScore ?? "");
  const [combined, setCombined] = useState(initialSkills?.combinedSkillsScore ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverSkillsScore: driver === "" ? null : parseInt(String(driver), 10),
          autonomousSkillsScore: auton === "" ? null : parseInt(String(auton), 10),
          combinedSkillsScore: combined === "" ? null : parseInt(String(combined), 10),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Update failed");
        setLoading(false);
        return;
      }
      router.refresh();
      setLoading(false);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="card-header bg-surface-bg border-b border-line py-2">
        <span className="text-[10px] font-mono tracking-widest text-txt-3 uppercase">Skills Scores</span>
      </div>
      <div className="p-5 bg-surface-card">
        <p className="text-xs font-mono text-txt-3 mb-6 uppercase tracking-widest">Update driver, autonomous, and combined skills.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label text-[10px] font-mono tracking-widest uppercase text-txt-2">Driver Skills</label>
              <input
                type="number"
                min={0}
                value={driver}
                onChange={(e) => setDriver(e.target.value)}
                className="input font-mono text-lg font-bold"
                placeholder="—"
              />
            </div>
            <div>
              <label className="label text-[10px] font-mono tracking-widest uppercase text-txt-2">Auto Skills</label>
              <input
                type="number"
                min={0}
                value={auton}
                onChange={(e) => setAuton(e.target.value)}
                className="input font-mono text-lg font-bold text-amber-500"
                placeholder="—"
              />
            </div>
            <div>
              <label className="label text-[10px] font-mono tracking-widest uppercase text-txt-2">Combined</label>
              <input
                type="number"
                min={0}
                value={combined}
                onChange={(e) => setCombined(e.target.value)}
                className="input font-mono text-lg font-bold text-cyan-400"
                placeholder="—"
              />
            </div>
          </div>
          {error && <p className="text-sm font-mono tracking-widest uppercase text-danger mt-2">{error}</p>}
          <div className="pt-2">
            <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
              {loading ? "SAVING…" : "SAVE SKILLS"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
