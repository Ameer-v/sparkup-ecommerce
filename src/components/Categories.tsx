"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Eye, CheckCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useCart } from "../context/CartContext";

type Category = {
  id: string;
  name: string;
  description?: string;
  slug?: string;
};

type Product = {
  id: string;
  name: string;
  description?: string;
  price: string | number;
  stock: number;
  imageUrl: string;
  category?: { id: string; name: string };
};

const CATEGORY_IMAGES: Record<string, string> = {
  laptops: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&auto=format&fit=crop",
  laptop: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&auto=format&fit=crop",
  smartphones: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop",
  smartphone: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop",
  phones: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop",
  gaming: "https://images.unsplash.com/photo-1603481546238-487240415921?q=80&w=1200&auto=format&fit=crop",
  accessories: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=1200&auto=format&fit=crop",
  audio: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
  tablets: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=1200&auto=format&fit=crop",
  cameras: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1200&auto=format&fit=crop",
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1491933382434-500287f9b54b?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=1200&auto=format&fit=crop",
];

const PRODUCT_FALLBACK =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop";

function getCategoryImage(name: string, index: number): string {
  const key = name.toLowerCase().trim();
  for (const [k, v] of Object.entries(CATEGORY_IMAGES)) {
    if (key.includes(k)) return v;
  }
  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

export default function Categories() {
  const { addToCart } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [activeCat, setActiveCat] = useState<string>("all");
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingProds, setLoadingProds] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Fetch categories
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingCats(false);
      }
    }
    load();
  }, []);

  // Fetch all products once
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setAllProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingProds(false);
      }
    }
    load();
  }, []);

  const filteredProducts =
    activeCat === "all"
      ? allProducts
      : allProducts.filter((p) => p.category?.id === activeCat);

  async function handleAddToCart(product: Product) {
    await addToCart({
      id: product.id,
      productId: product.id,
      title: product.name,
      price: String(product.price),
      image: product.imageUrl || PRODUCT_FALLBACK,
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

  const loading = loadingCats || loadingProds;

  return (
    <section className="py-24 bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">

        {/* ── Heading ── */}
        <div className="mb-14">
          <p className="uppercase tracking-[0.3em] text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            Categories
          </p>
          <h2 className="text-5xl font-bold tracking-tight text-black dark:text-white">
            Explore Products
          </h2>
        </div>

        {/* ── Hero category cards (max 3) ── */}
        {!loadingCats && categories.length > 0 && (
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {categories.slice(0, 3).map((cat, i) => (
              <motion.button
                key={cat.id}
                onClick={() => setActiveCat(cat.id === activeCat ? "all" : cat.id)}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`group relative overflow-hidden rounded-[32px] h-[500px] cursor-pointer text-left focus:outline-none ring-offset-2 transition-all ${
                  activeCat === cat.id
                    ? "ring-4 ring-black dark:ring-white scale-[0.98]"
                    : "hover:scale-[1.01]"
                }`}
              >
                <img
                  src={getCategoryImage(cat.name, i)}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                />
                <div
                  className={`absolute inset-0 transition duration-300 ${
                    activeCat === cat.id
                      ? "bg-black/60"
                      : "bg-black/30 group-hover:bg-black/50"
                  }`}
                />

                {/* Active indicator */}
                {activeCat === cat.id && (
                  <div className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white flex items-center justify-center">
                    <CheckCircle size={18} className="text-black" />
                  </div>
                )}

                <div className="absolute bottom-8 left-8 text-white">
                  <h3 className="text-3xl font-bold">{cat.name}</h3>
                  {cat.description && (
                    <p className="mt-1 text-white/70 text-sm">{cat.description}</p>
                  )}
                  <p className="mt-3 text-white/80 text-sm flex items-center gap-1">
                    {activeCat === cat.id ? "Klik untuk semua" : "Lihat produk"}
                    <ChevronRight size={14} />
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* ── Category pill filters ── */}
        <div className="flex items-center gap-3 flex-wrap mb-10">
          <button
            onClick={() => setActiveCat("all")}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeCat === "all"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
            }`}
          >
            Semua
          </button>
          {loadingCats
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="h-9 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
              ))
            : categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id === activeCat ? "all" : cat.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    activeCat === cat.id
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
        </div>

        {/* ── Product grid ── */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-[28px] overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                <div className="h-60 bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                <div className="p-5 space-y-2">
                  <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse" />
                  <div className="h-4 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse" />
                  <div className="h-6 w-1/2 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800">
            <ShoppingBag size={48} className="mx-auto mb-4 text-zinc-300" />
            <p className="text-zinc-500">
              {activeCat === "all"
                ? "Belum ada produk tersedia."
                : "Tidak ada produk di kategori ini."}
            </p>
            {activeCat !== "all" && (
              <button
                onClick={() => setActiveCat("all")}
                className="mt-4 text-sm font-medium underline text-zinc-600 dark:text-zinc-400"
              >
                Lihat semua produk
              </button>
            )}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCat}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {filteredProducts.map((product, i) => {
                const isAdded = addedIds.has(product.id);
                const inStock = product.stock > 0;

                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                    className="group bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[28px] overflow-hidden hover:shadow-xl transition-shadow duration-500"
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden h-60">
                      <Link href={`/product/${product.id}`}>
                        <img
                          src={
                            product.imageUrl?.startsWith("http")
                              ? product.imageUrl
                              : PRODUCT_FALLBACK
                          }
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                          onError={(e) => {
                            e.currentTarget.src = PRODUCT_FALLBACK;
                          }}
                        />
                      </Link>

                      {/* Quick view */}
                      <Link
                        href={`/product/${product.id}`}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white dark:bg-zinc-900 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <Eye size={15} />
                      </Link>

                      {/* Stock badges */}
                      {!inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="px-4 py-2 rounded-full bg-white text-black text-xs font-semibold">
                            Habis
                          </span>
                        </div>
                      )}
                      {inStock && product.stock <= 5 && (
                        <div className="absolute bottom-3 left-3">
                          <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold">
                            Sisa {product.stock}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <p className="text-xs text-zinc-400 mb-1">{product.category?.name}</p>
                      <h3 className="text-sm font-semibold line-clamp-2 leading-snug mb-3">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold">
                          Rp {Number(product.price).toLocaleString("id-ID")}
                        </p>
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={!inStock}
                          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
                            isAdded
                              ? "bg-green-500 text-white scale-95"
                              : "bg-black text-white dark:bg-white dark:text-black hover:scale-110"
                          }`}
                        >
                          {isAdded ? (
                            <CheckCircle size={16} />
                          ) : (
                            <ShoppingBag size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}