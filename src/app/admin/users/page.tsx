"use client";

import { useEffect, useState } from "react";
import { Trash2, RefreshCw, Search, ShieldCheck, User as UserIcon, Mail, Crown, Plus } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

type User = {
  id: string;
  name: string;
  email: string;
  role?: { name: string };
  createdAt?: string;
};

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Create admin modal
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  async function deleteUser(id: string) {
    if (!confirm("Hapus user ini?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) await fetchUsers();
      else alert("Gagal menghapus user.");
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  }

  async function createAdmin(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/auth/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName, email: newEmail, password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message ?? "Gagal membuat admin."); return; }
      alert("Admin berhasil dibuat!");
      setShowCreateAdmin(false);
      setNewName(""); setNewEmail(""); setNewPassword("");
      await fetchUsers();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Users</h1>
          <p className="text-zinc-500 mt-1">
            {loading ? "Loading..." : `${users.length} users terdaftar`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchUsers}
            className="w-12 h-12 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowCreateAdmin(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-medium hover:opacity-80 transition text-sm"
          >
            <Crown size={16} />
            Buat Admin
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Cari user berdasarkan nama atau email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-12 pl-11 pr-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
              <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-500">User</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-500 hidden md:table-cell">Email</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-500">Role</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-500 hidden lg:table-cell">Joined</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-zinc-400 text-sm">Memuat data...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <UserIcon size={36} className="text-zinc-300" />
                    <p className="text-zinc-400 text-sm">Tidak ada user ditemukan.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((user) => {
                const isAdmin = user.role?.name?.toLowerCase() === "admin";
                return (
                  <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${isAdmin ? "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"}`}>
                          {user.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{user.name}</p>
                          <p className="text-xs text-zinc-400 md:hidden">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <Mail size={13} />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${isAdmin ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
                        {isAdmin ? <Crown size={11} /> : <UserIcon size={11} />}
                        {user.role?.name ?? "user"}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-sm text-zinc-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteUser(user.id)}
                        disabled={deletingId === user.id || isAdmin}
                        title={isAdmin ? "Tidak bisa hapus admin" : "Hapus user"}
                        className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Admin Modal */}
      {showCreateAdmin && (
        <>
          <div
            onClick={() => setShowCreateAdmin(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-700 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                <Crown size={18} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Buat Admin Baru</h2>
                <p className="text-xs text-zinc-500">User akan memiliki akses penuh ke admin panel</p>
              </div>
            </div>
            <form onSubmit={createAdmin} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Nama lengkap"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full h-12 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-transparent outline-none text-sm focus:ring-2 focus:ring-amber-400/30 transition"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full h-12 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-transparent outline-none text-sm focus:ring-2 focus:ring-amber-400/30 transition"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-transparent outline-none text-sm focus:ring-2 focus:ring-amber-400/30 transition"
                required
              />
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateAdmin(false)}
                  className="flex-1 h-11 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 h-11 rounded-2xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition disabled:opacity-50"
                >
                  {creating ? "Membuat..." : "Buat Admin"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}