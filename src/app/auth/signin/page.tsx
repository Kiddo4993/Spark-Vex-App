"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          required
          autoComplete="current-password"
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function SignInPage() {
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
        <h1 className="font-head text-xl font-bold text-txt-1">Sign in</h1>
        <p className="mt-0.5 text-xs font-mono text-txt-3 tracking-wider uppercase">Use your team account</p>
        <Suspense fallback={<div className="mt-6 text-center text-txt-3 text-sm">Loading...</div>}>
          <SignInForm />
        </Suspense>
        <p className="mt-5 text-center text-xs text-txt-3">
          No account?{" "}
          <Link href="/auth/signup" className="text-spark hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
