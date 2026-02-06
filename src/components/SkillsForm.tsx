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
    <form onSubmit={handleSubmit} className="card max-w-xl space-y-4">
      <h2 className="text-lg font-semibold text-white">Skills scores</h2>
      <p className="text-sm text-gray-400">Update your driver, autonomous, and combined skills scores.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-gray-400">Driver skills</label>
          <input
            type="number"
            min={0}
            value={driver}
            onChange={(e) => setDriver(e.target.value)}
            className="input mt-1"
            placeholder="—"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">Autonomous skills</label>
          <input
            type="number"
            min={0}
            value={auton}
            onChange={(e) => setAuton(e.target.value)}
            className="input mt-1"
            placeholder="—"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">Combined skills</label>
          <input
            type="number"
            min={0}
            value={combined}
            onChange={(e) => setCombined(e.target.value)}
            className="input mt-1"
            placeholder="—"
          />
        </div>
      </div>
      {error && <p className="text-sm text-vex-red">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Saving…" : "Save skills"}
      </button>
    </form>
  );
}
