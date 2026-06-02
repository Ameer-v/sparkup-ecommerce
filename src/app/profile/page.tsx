"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { User, Mail, Phone, MapPin, Shield, Loader2, Save } from "lucide-react";

export default function ProfilePage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? "",
        phone: user.phone ?? "",
        address: user.address ?? "",
      });
    }
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Gagal menyimpan perubahan.");
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white dark:bg-zinc-950">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-zinc-400" />
        </div>
      </main>
    );
  }

  const inputClass =
    "w-full h-12 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition text-sm";

  return (
    <main className="bg-white dark:bg-zinc-950 text-black dark:text-white min-h-screen">
      <Navbar />

      <section className="py-16">
        <div className="max-w-2xl mx-auto px-6">
          <div className="mb-10">
            <p className="uppercase tracking-[0.3em] text-xs text-zinc-500 mb-3">Akun Saya</p>
            <h1 className="text-4xl font-bold">Profil</h1>
          </div>

          {/* Avatar & info card */}
          <div className="bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-6 mb-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-black dark:bg-white flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-white dark:text-black">
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </span>
            </div>
            <div>
              <p className="font-bold text-lg">{user?.name}</p>
              <p className="text-sm text-zinc-500 flex items-center gap-1.5 mt-0.5">
                <Mail size={13} />
                {user?.email}
              </p>
              {user?.role && (
                <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-semibold">
                  <Shield size={11} />
                  {user.role.name}
                </span>
              )}
            </div>
          </div>

          {/* Edit form */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-8">
            <h2 className="text-lg font-semibold mb-6">Edit Informasi</h2>

            {error && (
              <div className="mb-5 px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <User size={14} />
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Phone size={14} />
                  Nomor Telepon
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="08123456789"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <MapPin size={14} />
                  Alamat
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  rows={3}
                  placeholder="Alamat lengkap..."
                  className="w-full p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className={`h-12 rounded-2xl font-medium flex items-center justify-center gap-2 transition text-sm disabled:opacity-50 ${
                  saved
                    ? "bg-green-500 text-white"
                    : "bg-black text-white dark:bg-white dark:text-black hover:opacity-80"
                }`}
              >
                {saving ? (
                  <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
                ) : saved ? (
                  "✓ Tersimpan!"
                ) : (
                  <><Save size={16} /> Simpan Perubahan</>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}