"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Pencil, ShoppingBag, Trash2, CheckCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import ProductModal from "./ProductModal";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  imageUrl: string;
  category: {
    id: string;
    name: string;
  };
};

const fallbackImage =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop";

export default function Products() {
  const { isAdmin } = useAuth();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  async function fetchProducts() {
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
    if (!confirm("Hapus produk ini?")) return;
    try {
      const token = localStorage.getItem("sparkup-token");
      await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleAddToCart(product: Product) {
    await addToCart({
      id: product.id,
      productId: product.id,
      title: product.name,
      price: String(product.price),
      image: product.imageUrl || fallbackImage,
    });
    setAddedIds((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 1500);
  }

  // "Best sellers" = produk dengan stock terbanyak terjual (simulasi: ambil 6 pertama)
  // Jika ada endpoint khusus bestseller di masa depan, ganti fetch di sini
  const bestSellers = products.slice(0, 6);

  if (loading) {
    return (
      <section className="py-24 bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-14">
            <p className="uppercase tracking-[0.3em] text-sm text-zinc-500 mb-4">Featured Products</p>
            <h2 className="text-5xl font-bold tracking-tight">Best Sellers</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-[32px] overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                <div className="h-[350px] bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                <div className="p-8 space-y-3">
                  <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse" />
                  <div className="h-5 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse" />
                  <div className="h-8 w-1/2 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse mt-6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-24 bg-zinc-50 dark:bg-zinc-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-14">
            <div>
              <p className="uppercase tracking-[0.3em] text-sm text-zinc-500 dark:text-zinc-400 mb-4 flex items-center gap-2">
                <TrendingUp size={14} />
                Featured Products
              </p>
              <h2 className="text-5xl font-bold tracking-tight text-black dark:text-white">
                Best Sellers
              </h2>
            </div>

            {isAdmin && (
              <a
                href="/admin/products/create"
                className="px-6 py-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-medium hover:opacity-80 transition text-sm"
              >
                + Add Product
              </a>
            )}
          </div>

          {/* GRID */}
          {bestSellers.length === 0 ? (
            <div className="text-center py-20 text-zinc-400">
              <ShoppingBag size={48} className="mx-auto mb-4 opacity-30" />
              <p>Belum ada produk tersedia.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bestSellers.map((product, rank) => {
                const isAdded = addedIds.has(product.id);

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition duration-500 group"
                  >
                    {/* IMAGE */}
                    <div className="relative overflow-hidden">
                      <Link href={`/product/${product.id}`}>
                        <img
                          src={product.imageUrl?.startsWith("http") ? product.imageUrl : fallbackImage}
                          alt={product.name}
                          className="w-full h-[350px] object-cover group-hover:scale-105 transition duration-700"
                          onError={(e) => { e.currentTarget.src = fallbackImage; }}
                        />
                      </Link>

                      {/* Rank badge – top 3 */}
                      {rank < 3 && (
                        <div className="absolute top-5 left-5 w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold shadow-lg">
                          #{rank + 1}
                        </div>
                      )}

                      {/* Quick view */}
                      <button
                        onClick={() => { setSelectedProduct(product); setOpen(true); }}
                        className="absolute top-5 right-5 w-12 h-12 rounded-full bg-white dark:bg-black shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                        title="Lihat detail"
                      >
                        <Eye size={18} />
                      </button>

                      {/* Admin actions */}
                      {isAdmin && (
                        <div className="absolute top-5 left-5 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition">
                          <a
                            href={`/admin/products/edit/${product.id}`}
                            className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition"
                          >
                            <Pencil size={15} />
                          </a>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}

                      {/* Stock badge */}
                      {product.stock <= 5 && product.stock > 0 && (
                        <div className="absolute bottom-4 left-4">
                          <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold">
                            Sisa {product.stock}
                          </span>
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="px-4 py-2 rounded-full bg-white text-black text-sm font-semibold">
                            Habis
                          </span>
                        </div>
                      )}
                    </div>

                    {/* CONTENT */}
                    <div className="p-8">
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                        {product.category?.name}
                      </p>
                      <h3 className="text-xl font-semibold line-clamp-2 leading-snug mb-1">
                        {product.name}
                      </h3>

                      <div className="flex items-center justify-between mt-6">
                        <p className="text-2xl font-bold">
                          Rp {Number(product.price).toLocaleString("id-ID")}
                        </p>

                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                          title={product.stock === 0 ? "Stok habis" : "Tambah ke keranjang"}
                          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
                            isAdded
                              ? "bg-green-500 text-white scale-95"
                              : "bg-black text-white dark:bg-white dark:text-black hover:scale-110"
                          }`}
                        >
                          {isAdded ? (
                            <CheckCircle size={20} />
                          ) : (
                            <ShoppingBag size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <ProductModal product={selectedProduct} open={open} setOpen={setOpen} />
    </>
  );
}