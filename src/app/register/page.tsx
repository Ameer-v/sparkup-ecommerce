"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          address: form.address,
          phone: form.phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Registrasi gagal. Silakan coba lagi.");
        return;
      }

      router.push("/login");
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full h-14 px-6 rounded-full border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition text-sm placeholder:text-zinc-400";

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-white dark:text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none">SparkUp</h1>
            <p className="text-xs text-zinc-500">Plug Into Tomorrow</p>
          </div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-[40px] p-10 border border-zinc-200 dark:border-zinc-800">

          <p className="uppercase tracking-[0.3em] text-xs text-zinc-500 mb-3">
            Bergabung Sekarang
          </p>
          <h2 className="text-4xl font-bold tracking-tight mb-8">Daftar</h2>

          {error && (
            <div className="mb-6 px-5 py-3.5 rounded-2xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <input
              type="text"
              name="name"
              placeholder="Nama Lengkap"
              value={form.name}
              onChange={handleChange}
              className={inputClass}
              required
              disabled={loading}
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className={inputClass}
              required
              disabled={loading}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className={inputClass}
              required
              disabled={loading}
            />

            <input
              type="tel"
              name="phone"
              placeholder="Nomor Telepon (e.g. 08123456789)"
              value={form.phone}
              onChange={handleChange}
              className={inputClass}
              required
              disabled={loading}
            />

            <textarea
              name="address"
              placeholder="Alamat Lengkap"
              value={form.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-6 py-4 rounded-3xl border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition text-sm placeholder:text-zinc-400 resize-none"
              required
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading}
              className="h-14 rounded-full bg-black text-white dark:bg-white dark:text-black font-medium mt-2 flex items-center justify-center gap-2 hover:opacity-80 transition disabled:opacity-50"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6">
            Sudah punya akun?{" "}
            <a href="/login" className="text-black dark:text-white font-medium hover:underline">
              Login
            </a>
          </p>

        </div>
      </div>
    </main>
  );
}