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
  autoStrength: number | null;
  driverStrength: number | null;
  strategyTags: string[];
  notes: string | null;
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
  const [drivetrainType, setDrivetrainType] = useState(team.drivetrainType ?? "");
  const [autonomousSide, setAutonomousSide] = useState(team.autonomousSide ?? "");
  const [autonReliabilityPct, setAutonReliabilityPct] = useState<number | null>(team.autonReliabilityPct);
  const [autoStrength, setAutoStrength] = useState<number | null>(team.autoStrength);
  const [driverStrength, setDriverStrength] = useState<number | null>(team.driverStrength);
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
          autoStrength,
          driverStrength,
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
      <h3 className="section-title mb-5">Edit Profile Settings</h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Location */}
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

        {/* Robot Config */}
        <div className="border-t border-line pt-5">
          <h4 className="text-sm font-semibold text-txt-1 mb-4">Robot Configuration</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="drivetrain" className="label">Drivetrain Type</label>
              <select
                id="drivetrain"
                value={drivetrainType}
                onChange={(e) => setDrivetrainType(e.target.value)}
                className="input"
              >
                <option value="">Select…</option>
                <option value="tank">Tank Drive</option>
                <option value="mecanum">Mecanum</option>
                <option value="holonomic">Holonomic / X-Drive</option>
                <option value="swerve">Swerve</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="autonSide" className="label">Autonomous Side</label>
              <select
                id="autonSide"
                value={autonomousSide}
                onChange={(e) => setAutonomousSide(e.target.value)}
                className="input"
              >
                <option value="">Select…</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="skills">Skills</option>
                <option value="both">Both</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
        </div>

        {/* Auton Reliability */}
        <div className="border-t border-line pt-5">
          <h4 className="text-sm font-semibold text-txt-1 mb-4">Autonomous Reliability</h4>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="label !mb-0">Auton Reliability %</label>
              {autonReliabilityPct !== null && (
                <button
                  type="button"
                  onClick={() => setAutonReliabilityPct(null)}
                  className="text-[10px] text-danger hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
            {autonReliabilityPct === null ? (
              <button
                type="button"
                onClick={() => setAutonReliabilityPct(50)}
                className="w-full btn-ghost border-dashed text-txt-3 hover:text-spark hover:border-spark py-2 text-xs"
              >
                + Set Reliability
              </button>
            ) : (
              <>
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs text-txt-3">0%</span>
                  <span className="font-mono text-xl font-bold text-spark">{autonReliabilityPct}%</span>
                  <span className="text-xs text-txt-3">100%</span>
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

        {/* Scouting Sliders */}
        <div className="border-t border-line pt-5">
          <h4 className="text-sm font-semibold text-txt-1 mb-4">Scouting Strength</h4>

          <div className="space-y-6">
            {/* Auto Strength */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="label !mb-0">Autonomous Strength</label>
                {autoStrength !== null && (
                  <button
                    type="button"
                    onClick={() => setAutoStrength(null)}
                    className="text-[10px] text-danger hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              {autoStrength === null ? (
                <button
                  type="button"
                  onClick={() => setAutoStrength(5)}
                  className="w-full btn-ghost border-dashed text-txt-3 hover:text-amber hover:border-amber py-2 text-xs"
                >
                  + Set Rating
                </button>
              ) : (
                <>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs text-txt-3">Low (0)</span>
                    <span className="font-mono text-xl font-bold text-amber">{autoStrength}</span>
                    <span className="text-xs text-txt-3">High (10)</span>
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
                </>
              )}
            </div>

            {/* Driver Strength */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="label !mb-0">Driver Strength</label>
                {driverStrength !== null && (
                  <button
                    type="button"
                    onClick={() => setDriverStrength(null)}
                    className="text-[10px] text-danger hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              {driverStrength === null ? (
                <button
                  type="button"
                  onClick={() => setDriverStrength(5)}
                  className="w-full btn-ghost border-dashed text-txt-3 hover:text-success hover:border-success py-2 text-xs"
                >
                  + Set Rating
                </button>
              ) : (
                <>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-xs text-txt-3">Low (0)</span>
                    <span className="font-mono text-xl font-bold text-success">{driverStrength}</span>
                    <span className="text-xs text-txt-3">High (10)</span>
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
                </>
              )}
            </div>
          </div>
        </div>

        {/* Strategy Tags */}
        <div className="border-t border-line pt-5">
          <h4 className="text-sm font-semibold text-txt-1 mb-4">Strategy Tags</h4>
          <div className="flex flex-wrap gap-2 mb-3">
            {strategyTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-spark/10 text-spark border border-spark/20"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-spark/50 hover:text-danger transition-colors"
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
            placeholder='Type a tag and press Enter (e.g. "defensive", "fast auton")'
          />
          <p className="mt-1 text-[10px] text-txt-3 font-mono">Press Enter or comma to add a tag</p>
        </div>

        {/* Notes */}
        <div className="border-t border-line pt-5">
          <h4 className="text-sm font-semibold text-txt-1 mb-4">Notes</h4>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input min-h-[100px] resize-y"
            placeholder="Add any notes about your robot, strategy, or observations…"
            rows={4}
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        {success && <p className="text-sm text-success">✓ Profile saved</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving…" : "Save Profile Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
