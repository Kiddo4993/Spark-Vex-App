"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Team = {
  id: string;
  provinceState: string | null;
  country: string | null;
  drivetrainType: string | null;
  autonomousSide: string | null;
  autonReliabilityPct: number | null;
  notes: string | null;
  strategyTags: string[];
};

export function TeamProfileForm({ team }: { team: Team }) {
  const router = useRouter();
  const [provinceState, setProvinceState] = useState(team.provinceState ?? "");
  const [country, setCountry] = useState(team.country ?? "");
  const [drivetrainType, setDrivetrainType] = useState(team.drivetrainType ?? "");
  const [autonomousSide, setAutonomousSide] = useState(team.autonomousSide ?? "");
  const [autonReliabilityPct, setAutonReliabilityPct] = useState(
    team.autonReliabilityPct != null ? String(team.autonReliabilityPct) : ""
  );
  const [notes, setNotes] = useState(team.notes ?? "");
  const [strategyTags, setStrategyTags] = useState(team.strategyTags.join(", "));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/teams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provinceState: provinceState || null,
          country: country || null,
          drivetrainType: drivetrainType || null,
          autonomousSide: autonomousSide || null,
          autonReliabilityPct: autonReliabilityPct ? parseFloat(autonReliabilityPct) : null,
          notes: notes || null,
          strategyTags: strategyTags
            ? strategyTags.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
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
    <form onSubmit={handleSubmit} className="card max-w-2xl space-y-4">
      <h2 className="text-lg font-semibold text-white">Edit profile</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-400">Province / State</label>
          <input
            type="text"
            value={provinceState}
            onChange={(e) => setProvinceState(e.target.value)}
            className="input mt-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">Country</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="input mt-1"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400">Drivetrain type</label>
        <input
          type="text"
          value={drivetrainType}
          onChange={(e) => setDrivetrainType(e.target.value)}
          className="input mt-1"
          placeholder="e.g. tank, mecanum"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400">Autonomous side</label>
        <input
          type="text"
          value={autonomousSide}
          onChange={(e) => setAutonomousSide(e.target.value)}
          className="input mt-1"
          placeholder="left / right / skills / etc"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400">Auton reliability %</label>
        <input
          type="number"
          min={0}
          max={100}
          value={autonReliabilityPct}
          onChange={(e) => setAutonReliabilityPct(e.target.value)}
          className="input mt-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400">Strategy tags (comma-separated)</label>
        <input
          type="text"
          value={strategyTags}
          onChange={(e) => setStrategyTags(e.target.value)}
          className="input mt-1"
          placeholder="defensive, fast auton"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input mt-1 min-h-[100px]"
          rows={4}
        />
      </div>
      {error && <p className="text-sm text-vex-red">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
