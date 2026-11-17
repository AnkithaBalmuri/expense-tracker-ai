"use client";

import { useState } from "react";

export default function AuthScreen({ onSignedIn }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/auth/${mode === "login" ? "login" : "signup"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not continue.");
      onSignedIn(data.user);
    } catch (authError) {
      setError(authError.message);
    } finally {
      setSaving(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <main className="auth-page min-h-screen p-4 sm:p-6">
      <section className="auth-card card mx-auto grid max-w-4xl overflow-hidden md:grid-cols-[1.1fr_0.9fr]">
        <div className="auth-art p-7 sm:p-10">
          <div className="auth-doodle auth-rupee">₹</div>
          <div className="auth-doodle auth-dollar">$</div>
          <div className="auth-doodle auth-coin">+</div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#536b31]">Personal finance</p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-[#2f4124]">Expense<br />Tracker</h1>
          <p className="mt-4 max-w-sm font-bold leading-7 text-[#5d6d4d]">A simple private place for your bills, spending, budgets, and monthly insights.</p>
          <div className="auth-note mt-8">
            <span>✓</span>
            Your expenses stay tied to your account.
          </div>
        </div>

        <div className="bg-[#fffdf8] p-7 sm:p-10">
          <div className="mb-7 flex rounded-full bg-[#edf3e3] p-1">
            <button type="button" className={isLogin ? "auth-tab active" : "auth-tab"} onClick={() => setMode("login")}>
              Login
            </button>
            <button type="button" className={!isLogin ? "auth-tab active" : "auth-tab"} onClick={() => setMode("signup")}>
              Sign up
            </button>
          </div>

          <h2 className="text-2xl font-black text-[#314522]">{isLogin ? "Welcome back" : "Create your account"}</h2>
          <p className="mt-1 font-bold text-[#71806a]">{isLogin ? "Sign in to open your dashboard." : "Start tracking your expenses today."}</p>

          <form className="mt-6 grid gap-4" onSubmit={submit}>
            {!isLogin ? (
              <label className="label">
                Your name
                <input className="field" value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Your name" required />
              </label>
            ) : null}
            <label className="label">
              Email address
              <input className="field" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="name@example.com" required />
            </label>
            <label className="label">
              Password
              <input className="field" type="password" minLength="6" value={form.password} onChange={(event) => update("password", event.target.value)} placeholder="At least 6 characters" required />
            </label>
            {error ? <p className="auth-error">{error}</p> : null}
            <button className="btn btn-primary mt-1" disabled={saving} type="submit">
              {saving ? "Please wait..." : isLogin ? "Login to Dashboard" : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-bold text-[#69785d]">
            {isLogin ? "New here?" : "Already have an account?"}{" "}
            <button className="auth-switch" type="button" onClick={() => setMode(isLogin ? "signup" : "login")}>
              {isLogin ? "Sign up" : "Login"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
