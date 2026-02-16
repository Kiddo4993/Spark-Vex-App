"use client";

import { useState } from "react";

type Team = {
  id: string;
  teamNumber: string;
  provinceState: string | null;
  country: string | null;
  autoStrength: number | null;
  driverStrength: number | null;
};

export function TeamProfileForm({
  team,
  onSave,
}: {
  team: Team;
  onSave: () => void;
}) {
  const [provinceState, setProvinceState] = useState(team.provinceState ?? "");
  const [country, setCountry] = useState(team.country ?? "");
  const [autoStrength, setAutoStrength] = useState(team.autoStrength ?? 5);
  const [driverStrength, setDriverStrength] = useState(team.driverStrength ?? 5);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/teams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provinceState: provinceState || null,
          country: country || null,
          autoStrength,
          driverStrength,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save");
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        onSave();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-5">
      <h3 className="section-title mb-5">Edit Profile</h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ps" className="label">Province / State</label>
            <input
              id="ps"
              type="text"
              value={provinceState}
              onChange={(e) => setProvinceState(e.target.value)}
              className="input"
              placeholder="e.g. Ontario"
            />
          </div>
          <div>
            <label htmlFor="country" className="label">Country</label>
            <input
              id="country"
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input"
              placeholder="e.g. Canada"
            />
          </div>
        </div>

        {/* Scouting Sliders */}
        <div className="border-t border-line pt-5">
          <h4 className="text-sm font-semibold text-txt-1 mb-4">Scouting Data</h4>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="label !mb-0">Autonomous Strength</label>
                <span className="font-mono text-sm text-amber font-bold">{autoStrength}</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={autoStrength}
                onChange={(e) => setAutoStrength(parseFloat(e.target.value))}
                className="w-full accent-amber cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-txt-3 mt-0.5">
                <span>0</span><span>5</span><span>10</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="label !mb-0">Driver Strength</label>
                <span className="font-mono text-sm text-success font-bold">{driverStrength}</span>
              </div>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={driverStrength}
                onChange={(e) => setDriverStrength(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-txt-3 mt-0.5">
                <span>0</span><span>5</span><span>10</span>
              </div>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        {success && <p className="text-sm text-success">✓ Profile saved</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
