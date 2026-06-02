"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Search, Package } from "lucide-react";

type Product = {
  id: string;
  name: string;
  price: string;
  stock: number;
  imageUrl: string;
  category?: { name: string };
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchProducts() {
    try {
      const res = await fetch("https://be-ecommerce.up.railway.app/products");
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
    const confirmDelete = confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      const token = localStorage.getItem("sparkup-token");
      const res = await fetch(
        `https://be-ecommerce.up.railway.app/products/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Failed to delete product.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setDeletingId(null);
    }
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Products</h1>
          <p className="text-zinc-500 mt-1">
            {loading ? "Loading..." : `${products.length} products total`}
          </p>
        </div>
        <a
          href="/admin/products/create"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-medium hover:opacity-80 transition"
        >
          <Plus size={18} />
          Add Product
        </a>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-13 pl-12 pr-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition"
          style={{ height: "52px" }}
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
              <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-500">Product</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-500 hidden md:table-cell">Category</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-500">Price</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-500 hidden sm:table-cell">Stock</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-zinc-400">
                  Loading products...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Package size={40} className="text-zinc-300" />
                    <p className="text-zinc-400">No products found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-14 h-14 rounded-2xl object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400";
                        }}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold truncate max-w-[200px]">{product.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5 md:hidden">{product.category?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 text-sm hidden md:table-cell">
                    {product.category?.name ?? "—"}
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    Rp {Number(product.price).toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        product.stock > 10
                          ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400"
                          : product.stock > 0
                          ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-400"
                          : "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400"
                      }`}
                    >
                      {product.stock} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/admin/products/edit/${product.id}`}
                        className="w-10 h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </a>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        disabled={deletingId === product.id}
                        className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}