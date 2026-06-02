"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, RefreshCw, Tag } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

type Category = {
  id: string;
  name: string;
  description?: string;
  slug?: string;
  _count?: { products?: number };
};

export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Inline edit/create modal
  const [modal, setModal] = useState<{ mode: "create" | "edit"; data?: Category } | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [saving, setSaving] = useState(false);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  function openCreate() {
    setFormName("");
    setFormDesc("");
    setModal({ mode: "create" });
  }

  function openEdit(cat: Category) {
    setFormName(cat.name);
    setFormDesc(cat.description ?? "");
    setModal({ mode: "edit", data: cat });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const isEdit = modal?.mode === "edit";
      const url = isEdit ? `/api/categories/${modal!.data!.id}` : "/api/categories";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: formName, description: formDesc }),
      });

      const data = await res.json();
      if (!res.ok) { alert(data.message ?? "Gagal menyimpan kategori."); return; }

      await fetchCategories();
      setModal(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm("Hapus kategori ini? Produk dalam kategori ini tidak akan terhapus.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) await fetchCategories();
      else {
        const err = await res.json();
        alert(err.message ?? "Gagal menghapus kategori.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Categories</h1>
          <p className="text-zinc-500 mt-1">
            {loading ? "Loading..." : `${categories.length} kategori`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchCategories}
            className="w-12 h-12 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-medium hover:opacity-80 transition text-sm"
          >
            <Plus size={16} />
            Tambah
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-zinc-100 dark:bg-zinc-800 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-16 text-center">
          <Tag size={36} className="text-zinc-300 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">Belum ada kategori.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-5 flex flex-col gap-3 hover:border-zinc-300 dark:hover:border-zinc-600 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <Tag size={16} className="text-zinc-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{cat.name}</p>
                    {cat.description && (
                      <p className="text-xs text-zinc-500 truncate mt-0.5">{cat.description}</p>
                    )}
                  </div>
                </div>
                {cat._count?.products !== undefined && (
                  <span className="shrink-0 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-500 font-medium">
                    {cat._count.products} produk
                  </span>
                )}
              </div>

              <div className="flex gap-2 mt-auto pt-2 border-t border-zinc-50 dark:border-zinc-800">
                <button
                  onClick={() => openEdit(cat)}
                  className="flex-1 h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-2 text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                >
                  <Pencil size={13} />
                  Edit
                </button>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  disabled={deletingId === cat.id}
                  className="flex-1 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center gap-2 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  {deletingId === cat.id ? "..." : "Hapus"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create/Edit */}
      {modal && (
        <>
          <div onClick={() => setModal(null)} className="fixed inset-0 bg-black/50 z-40" />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-zinc-200 dark:border-zinc-700 shadow-2xl">
            <h2 className="text-xl font-bold mb-1">
              {modal.mode === "create" ? "Tambah Kategori" : "Edit Kategori"}
            </h2>
            <p className="text-sm text-zinc-500 mb-6">
              {modal.mode === "create" ? "Buat kategori baru untuk produk." : `Mengedit: ${modal.data?.name}`}
            </p>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nama Kategori</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Laptops"
                  className="w-full h-12 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-transparent outline-none text-sm focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Deskripsi <span className="text-zinc-400 font-normal">(opsional)</span></label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Deskripsi singkat kategori..."
                  rows={3}
                  className="w-full p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-transparent outline-none text-sm resize-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition"
                />
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="flex-1 h-11 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 h-11 rounded-2xl bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:opacity-80 transition disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : modal.mode === "create" ? "Tambah" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}