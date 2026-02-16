"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Team = { id: string; teamNumber: string };

export function AddMatchForm({ teams }: { teams: Team[] }) {
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [red1, setRed1] = useState("");
  const [red2, setRed2] = useState("");
  const [red3, setRed3] = useState("");
  const [blue1, setBlue1] = useState("");
  const [blue2, setBlue2] = useState("");
  const [blue3, setBlue3] = useState("");
  const [redScore, setRedScore] = useState(0);
  const [blueScore, setBlueScore] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const ids = [red1, red2, red3, blue1, blue2, blue3].filter(Boolean);
  const unique = new Set(ids).size === ids.length && ids.length === 6;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!unique || !eventName.trim()) {
      setError("Select 6 unique teams and enter event name.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: eventName.trim(),
          date: new Date(date).toISOString(),
          redTeam1Id: red1,
          redTeam2Id: red2,
          redTeam3Id: red3,
          blueTeam1Id: blue1,
          blueTeam2Id: blue2,
          blueTeam3Id: blue3,
          redScore,
          blueScore,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to add match");
        setLoading(false);
        return;
      }
      setSubmitted(true);
      setTimeout(() => {
        router.push("/dashboard/matches");
        router.refresh();
      }, 2000);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  const select = (value: string, onChange: (id: string) => void, label: string) => (
    <div>
      <label className="label">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input mt-1 cursor-pointer"
        required
      >
        <option value="">Select team</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.teamNumber}
          </option>
        ))}
      </select>
    </div>
  );

  if (submitted) {
    return (
      <div className="text-center py-12 space-y-3">
        <div className="text-4xl">✅</div>
        <h2 className="font-head text-xl font-bold text-txt-1">Match Added!</h2>
        <p className="text-sm text-txt-2">Bayesian ratings updated. Redirecting…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Event Name</label>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="input"
            placeholder="e.g. Provincial Championship"
            required
          />
        </div>
        <div>
          <label className="label">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
            required
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="card p-5 border-l-[3px] border-l-danger">
          <h3 className="font-head text-sm font-bold text-danger mb-4">Red Alliance</h3>
          <div className="space-y-3">
            {select(red1, setRed1, "Team 1")}
            {select(red2, setRed2, "Team 2")}
            {select(red3, setRed3, "Team 3")}
            <div>
              <label className="label">Red Score</label>
              <input
                type="number"
                min={0}
                value={redScore}
                onChange={(e) => setRedScore(parseInt(e.target.value, 10) || 0)}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="card p-5 border-l-[3px] border-l-spark">
          <h3 className="font-head text-sm font-bold text-spark mb-4">Blue Alliance</h3>
          <div className="space-y-3">
            {select(blue1, setBlue1, "Team 1")}
            {select(blue2, setBlue2, "Team 2")}
            {select(blue3, setBlue3, "Team 3")}
            <div>
              <label className="label">Blue Score</label>
              <input
                type="number"
                min={0}
                value={blueScore}
                onChange={(e) => setBlueScore(parseInt(e.target.value, 10) || 0)}
                className="input"
              />
            </div>
          </div>
        </div>
      </div>

      {!unique && ids.length === 6 && (
        <p className="text-sm text-danger font-bold">Please select 6 different teams.</p>
      )}
      {error && <p className="text-sm text-danger font-bold">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={loading || !unique} className="btn-primary">
          {loading ? "Adding…" : "Submit Match"}
        </button>
      </div>
    </form>
  );
}
