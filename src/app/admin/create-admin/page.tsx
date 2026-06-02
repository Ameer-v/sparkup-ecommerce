"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Crown } from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";

export default function CreateAdminPage() {
  const router = useRouter();
  const { token, isAdmin, isLoading } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/admin");
    }
  }, [isAdmin, isLoading]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/auth/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Gagal membuat admin.");
        return;
      }

      alert("Admin berhasil dibuat!");
      router.push("/admin/users");
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full h-12 px-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition text-sm";

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white transition text-sm mb-5"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
        <h1 className="text-4xl font-bold">Buat Admin</h1>
        <p className="text-zinc-500 mt-1">Tambah akun admin baru ke sistem.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-8 flex flex-col gap-5">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <Crown size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Akun admin memiliki akses penuh ke seluruh panel admin.
          </p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Admin Name"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 karakter"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Nomor Telepon <span className="text-zinc-400 font-normal">(opsional)</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="08123456789"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Alamat <span className="text-zinc-400 font-normal">(opsional)</span>
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={2}
              placeholder="Alamat lengkap..."
              className="w-full p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition text-sm resize-none"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 h-12 rounded-2xl border border-zinc-200 dark:border-zinc-700 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-12 rounded-2xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "Membuat..." : "Buat Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}