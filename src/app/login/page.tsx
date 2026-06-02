"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Login failed. Please try again.");
        return;
      }

      // Support multiple token field names backends might use
      const token =
        data.access_token ??
        data.accessToken ??
        data.token ??
        data.jwt;

      if (!token) {
        setError("Token tidak ditemukan dalam response.");
        return;
      }

      // Pass the entire data.user object (or data itself) so AuthContext
      // can normalise and extract the role immediately
      const userPayload = data.user ?? data.data?.user ?? data;
      await login(token, userPayload);

      // AuthContext.login() already fetched the full profile, so
      // isAdmin is now reliable
      const storedUser = JSON.parse(
        localStorage.getItem("sparkup-user") ?? "{}"
      );
      const roleName = storedUser?.role?.name?.toLowerCase() ?? "";

      if (roleName === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const busy = submitting || isLoading;

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-zinc-50 dark:bg-zinc-900 rounded-[40px] p-10 border border-zinc-200 dark:border-zinc-800">

        <p className="uppercase tracking-[0.3em] text-sm text-zinc-500 mb-4">
          Welcome Back
        </p>

        <h1 className="text-5xl font-bold tracking-tight mb-10">
          Login
        </h1>

        {error && (
          <div className="mb-6 px-5 py-3.5 rounded-2xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-14 px-6 rounded-full border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition"
            required
            disabled={busy}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 px-6 rounded-full border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition"
            required
            disabled={busy}
          />

          <button
            type="submit"
            disabled={busy}
            className="h-14 rounded-full bg-black text-white dark:bg-white dark:text-black font-medium mt-4 flex items-center justify-center gap-2 hover:opacity-80 transition disabled:opacity-50"
          >
            {busy && <Loader2 size={18} className="animate-spin" />}
            {busy ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Don't have an account?{" "}
          <a href="/register" className="text-black dark:text-white font-medium hover:underline">
            Register
          </a>
        </p>

      </div>

    </main>
  );
}