"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

import { signIn } from "next-auth/react";

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
    if (!teamNumber) {
      alert("Please enter a team number (e.g. 1234A)");
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
          teamNumber: teamNumber.toUpperCase(),
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

      // Auto-login the user after successful signup
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created, but automatic sign in failed. Please sign in manually.");
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="flex items-center gap-2.5 mb-6">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-base"
            style={{ background: "linear-gradient(135deg, #00D4FF 0%, #0090FF 100%)", boxShadow: "0 0 18px rgba(0,212,255,.35)" }}
          >
            ⚡
          </div>
          <span className="font-head font-extrabold text-xl text-txt-1">
            Spark<span className="text-spark">VEX</span>
          </span>
        </div>
        <h1 className="font-head text-xl font-bold text-txt-1">Create account</h1>
        <p className="mt-0.5 text-xs font-mono text-txt-3 tracking-wider uppercase">One account per team number</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input" placeholder="you@example.com" required autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input" minLength={8} required autoComplete="new-password"
            />
            <p className="mt-0.5 text-[10px] text-txt-3 font-mono">At least 8 characters</p>
          </div>
          <div>
            <label htmlFor="teamNumber" className="label">
              Team Number <span className="text-danger">*</span>
            </label>
            <input
              id="teamNumber" type="text"
              value={teamNumber}
              onChange={(e) => setTeamNumber(e.target.value)}
              className="input" placeholder="e.g. 12345A" required
            />
          </div>
          <div>
            <label htmlFor="provinceState" className="label">Province / State</label>
            <input
              id="provinceState" type="text" value={provinceState}
              onChange={(e) => setProvinceState(e.target.value)}
              className="input" placeholder="e.g. Ontario"
            />
          </div>
          <div>
            <label htmlFor="country" className="label">Country</label>
            <input
              id="country" type="text" value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input" placeholder="e.g. Canada"
            />
          </div>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-txt-3">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-spark hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
