"use client";

import { useState, KeyboardEvent } from "react";

type Team = {
  id: string;
  teamNumber: string;
  provinceState: string | null;
  country: string | null;
  drivetrainType: string | null;
  autonomousSide: string | null;
  autonReliabilityPct: number | null;
  strategyTags: string[];
  notes: string | null;
};

export function TeamProfileForm({
  team,
  onSave,
}: {
  team: Team;
  onSave?: () => void;
}) {
  const [provinceState, setProvinceState] = useState(team.provinceState ?? "");
  const [country, setCountry] = useState(team.country ?? "");
  const [drivetrainType, setDrivetrainType] = useState(team.drivetrainType ?? "");
  const [autonomousSide, setAutonomousSide] = useState(team.autonomousSide ?? "");
  const [autonReliabilityPct, setAutonReliabilityPct] = useState<number | null>(team.autonReliabilityPct);
  const [strategyTags, setStrategyTags] = useState<string[]>(team.strategyTags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState(team.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleAddTag(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (!strategyTags.includes(tag)) {
        setStrategyTags([...strategyTags, tag]);
      }
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setStrategyTags(strategyTags.filter((t) => t !== tag));
  }

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
          drivetrainType: drivetrainType || null,
          autonomousSide: autonomousSide || null,
          autonReliabilityPct: autonReliabilityPct,
          strategyTags,
          notes: notes || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save");
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        if (onSave) onSave();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="card-header bg-surface-bg border-b border-line py-2">
        <span className="text-[10px] font-mono tracking-widest text-txt-3 uppercase">Edit Profile Settings</span>
      </div>
      <div className="p-5 bg-surface-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ps" className="label text-[10px] font-mono tracking-widest uppercase">Province / State</label>
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
              <label htmlFor="country" className="label text-[10px] font-mono tracking-widest uppercase">Country</label>
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

          {/* Robot Config */}
          <div className="border-t border-line pt-6">
            <h4 className="text-[11px] font-mono tracking-widest uppercase text-txt-1 mb-4">Robot Configuration</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="drivetrain" className="label text-[10px] font-mono tracking-widest uppercase">Drivetrain</label>
                <select
                  id="drivetrain"
                  value={drivetrainType}
                  onChange={(e) => setDrivetrainType(e.target.value)}
                  className="input"
                >
                  <option value="">Select…</option>
                  <option value="full-omni">Full Omni Tank Drive</option>
                  <option value="traction">Traction Tank Drive</option>
                  <option value="x-drive">X-Drive</option>
                  <option value="h-drive">H-Drive</option>
                  <option value="mecanum">Mecanum drive</option>
                </select>
              </div>
              <div>
                <label htmlFor="autonSide" className="label text-[10px] font-mono tracking-widest uppercase">Auton Side</label>
                <select
                  id="autonSide"
                  value={autonomousSide}
                  onChange={(e) => setAutonomousSide(e.target.value)}
                  className="input"
                >
                  <option value="">Select…</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="both">Both</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
          </div>

          {/* Auton Reliability */}
          <div className="border-t border-line pt-6">
            <h4 className="text-[11px] font-mono tracking-widest uppercase text-txt-1 mb-4">Autonomous Reliability</h4>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="label text-[10px] font-mono tracking-widest uppercase !mb-0">Reliability %</label>
                {autonReliabilityPct !== null && (
                  <button
                    type="button"
                    onClick={() => setAutonReliabilityPct(null)}
                    className="text-[10px] text-danger font-mono tracking-widest uppercase hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
              {autonReliabilityPct === null ? (
                <button
                  type="button"
                  onClick={() => setAutonReliabilityPct(50)}
                  className="w-full border border-dashed border-line text-txt-3 hover:text-spark hover:border-spark py-3 text-[11px] uppercase tracking-widest font-mono transition-colors"
                >
                  + Set Reliability
                </button>
              ) : (
                <>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs font-mono tracking-widest text-txt-3">0%</span>
                    <span className="font-mono text-xl font-bold text-spark">{autonReliabilityPct}%</span>
                    <span className="text-xs font-mono tracking-widest text-txt-3">100%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={autonReliabilityPct}
                    onChange={(e) => setAutonReliabilityPct(parseInt(e.target.value))}
                    className="w-full accent-spark cursor-pointer"
                  />
                </>
              )}
            </div>
          </div>


          {/* Strategy Tags */}
          <div className="border-t border-line pt-6">
            <h4 className="text-[11px] font-mono tracking-widest uppercase text-txt-1 mb-4">Strategy Tags</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {strategyTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-txt-1 text-surface-bg"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-surface-bg/50 hover:text-danger hover:bg-surface-bg transition-colors w-4 h-4 ml-1 flex items-center justify-center -mr-1 rounded-sm"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="input"
              placeholder='Add tag + Enter (e.g. "DEFENSIVE", "RUSH")'
            />
          </div>

          {/* Notes */}
          <div className="border-t border-line pt-6">
            <h4 className="text-[11px] font-mono tracking-widest uppercase text-txt-1 mb-4">Scout Notes</h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input min-h-[100px] resize-y font-mono text-[13px]"
              placeholder="Observed details, auto path breakdowns..."
              rows={4}
            />
          </div>

          {error && <p className="text-sm font-mono tracking-widest uppercase text-danger mt-4">{error}</p>}
          {success && <p className="text-sm font-mono tracking-widest uppercase text-success mt-4">Profile Synced</p>}

          <div className="pt-2">
            <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
              {saving ? "SYNCING…" : "SAVE CHANGES"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
