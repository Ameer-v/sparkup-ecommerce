"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, RefreshCw } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

type Product = {
  id: string;
  name: string;
  price: string;
  stock: number;
  imageUrl: string;
  category?: { name: string };
};

const fallbackImage =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400&auto=format&fit=crop";

export default function AdminProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchProducts() {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function deleteProduct(id: string) {
    const confirmDelete = confirm("Yakin hapus produk ini?");
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Gagal menghapus produk");
        return;
      }

      await fetchProducts();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-5xl font-bold tracking-tight">Products</h1>
          <p className="text-zinc-500 mt-3">
            {loading ? "Loading..." : `${products.length} products total`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchProducts}
            className="w-12 h-12 rounded-2xl border border-zinc-300 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <a
            href="/admin/products/create"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-black text-white font-medium hover:opacity-80 transition"
          >
            <Plus size={18} />
            Add Product
          </a>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
        {loading ? (
          <div className="p-10 flex items-center justify-center">
            <p className="text-zinc-500 animate-pulse">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center text-zinc-500">
            Belum ada produk.{" "}
            <a href="/admin/products/create" className="underline">
              Tambah sekarang
            </a>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
              <tr className="text-left text-sm text-zinc-500">
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.imageUrl?.startsWith("http") ? product.imageUrl : fallbackImage}
                        alt={product.name}
                        className="w-14 h-14 rounded-2xl object-cover bg-zinc-100"
                        onError={(e) => { e.currentTarget.src = fallbackImage; }}
                      />
                      <p className="font-semibold">{product.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-500 text-sm">
                    {product.category?.name ?? "-"}
                  </td>
                  <td className="px-6 py-4 font-medium">
                    Rp {Number(product.price).toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        product.stock > 10
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : product.stock > 0
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/admin/products/edit/${product.id}`}
                        className="w-10 h-10 rounded-xl border border-zinc-300 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                      >
                        <Pencil size={16} />
                      </a>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        disabled={deletingId === product.id}
                        className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}