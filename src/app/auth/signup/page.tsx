"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [teamNumber, setTeamNumber] = useState("");
  const [provinceState, setProvinceState] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const num = parseInt(teamNumber, 10);
    if (Number.isNaN(num) || num < 1) {
      setError("Enter a valid team number");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          teamNumber: num,
          provinceState: provinceState || undefined,
          country: country || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sign up failed");
        setLoading(false);
        return;
      }
      router.push("/auth/signin");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-bold text-white">Create account</h1>
        <p className="mt-1 text-sm text-gray-400">One account per team number</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input mt-1"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input mt-1"
              minLength={8}
              required
              autoComplete="new-password"
            />
            <p className="mt-0.5 text-xs text-gray-500">At least 8 characters</p>
          </div>
          <div>
            <label htmlFor="teamNumber" className="block text-sm font-medium text-gray-300">
              Team number <span className="text-vex-red">*</span>
            </label>
            <input
              id="teamNumber"
              type="number"
              min={1}
              value={teamNumber}
              onChange={(e) => setTeamNumber(e.target.value)}
              className="input mt-1"
              placeholder="e.g. 12345"
              required
            />
          </div>
          <div>
            <label htmlFor="provinceState" className="block text-sm font-medium text-gray-300">
              Province / State
            </label>
            <input
              id="provinceState"
              type="text"
              value={provinceState}
              onChange={(e) => setProvinceState(e.target.value)}
              className="input mt-1"
              placeholder="e.g. Ontario"
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-300">
              Country
            </label>
            <input
              id="country"
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input mt-1"
              placeholder="e.g. Canada"
            />
          </div>
          {error && <p className="text-sm text-vex-red">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-vex-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
