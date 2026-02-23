"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        login,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid team number or password");
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
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="login" className="label">TEAM NUMBER</label>
        <input
          id="login"
          type="text"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          className="input"
          placeholder="e.g. 1234A"
          required
          autoComplete="username"
        />
      </div>
      <div>
        <label htmlFor="password" className="label">PASSWORD</label>
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
      {error && (
        <div className="bg-danger/10 border border-danger/30 p-3 text-[11px] font-mono text-danger uppercase tracking-widest text-center">
          {error}
        </div>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full justify-center !font-mono !tracking-widest !uppercase !text-[12px] !py-3">
        {loading ? "AUTHENTICATING…" : "[ SIGN IN ]"}
      </button>
    </form>
  );
}

export default function SignInPage() {
  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gold flex items-center justify-center text-surface-bg font-mono font-bold text-lg">
            X
          </div>
          <div>
            <span className="font-head font-extrabold text-xl text-txt-1">
              Spark<span className="text-spark">VEX</span>
            </span>
            <p className="text-[10px] font-mono text-txt-3 tracking-widest uppercase">ANALYST SUITE</p>
          </div>
        </div>

        <div className="border-b border-line pb-4 mb-2">
          <h1 className="text-[14px] font-mono tracking-widest uppercase font-bold text-txt-1">AUTHENTICATION</h1>
          <p className="mt-1 text-[10px] font-mono text-txt-3 tracking-widest uppercase">
            Enter your team credentials to access the dashboard
          </p>
        </div>

        <Suspense fallback={<div className="mt-6 text-center text-txt-3 text-[11px] font-mono uppercase tracking-widest">Loading...</div>}>
          <SignInForm />
        </Suspense>

        <div className="mt-6 pt-4 border-t border-line">
          <p className="text-[10px] font-mono text-txt-3 tracking-widest uppercase text-center">
            Contact your admin for team credentials
          </p>
        </div>
      </div>
    </div>
  );
}
