"use client";

import { use, useEffect, useState } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { ShoppingBag, Star, Package, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { useCart } from "../../../context/CartContext";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number | string;
  stock: number;
  imageUrl: string;
  category: {
    id: string;
    name: string;
    slug?: string;
    description?: string;
  };
};

const fallbackImage =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop";

export default function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) { setProduct(null); return; }
        const data = (await res.json()) as Product;
        setProduct(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  async function handleAddToCart() {
    if (!product) return;
    setAdding(true);
    await addToCart({
      id: product.id,
      productId: product.id,
      title: product.name,
      price: String(product.price),
      image: product.imageUrl || fallbackImage,
    });
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-zinc-950">
        <Navbar />
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <div className="rounded-[40px] h-[600px] bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
            <div className="space-y-5">
              <div className="h-3 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse" />
              <div className="h-12 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
              <div className="h-8 w-1/3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
              <div className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Package size={60} className="text-zinc-300" />
          <h1 className="text-3xl font-bold">Produk Tidak Ditemukan</h1>
          <Link href="/" className="text-zinc-500 hover:text-black dark:hover:text-white transition flex items-center gap-2 text-sm">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </Link>
        </div>
      </main>
    );
  }

  const price = Number(product.price);
  const inStock = product.stock > 0;

  return (
    <main className="bg-white dark:bg-zinc-950 text-black dark:text-white transition-colors duration-300 min-h-screen">
      <Navbar />

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-10">
            <Link href="/" className="hover:text-black dark:hover:text-white transition">Beranda</Link>
            <span>/</span>
            <span className="text-zinc-500">{product.category?.name}</span>
            <span>/</span>
            <span className="text-black dark:text-white font-medium line-clamp-1">{product.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* IMAGE */}
            <div className="sticky top-8">
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-[40px] overflow-hidden aspect-square">
                <img
                  src={product.imageUrl?.startsWith("http") ? product.imageUrl : fallbackImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = fallbackImage; }}
                />
              </div>
            </div>

            {/* CONTENT */}
            <div className="flex flex-col">
              {/* Category */}
              <p className="uppercase tracking-[0.3em] text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                {product.category?.name}
              </p>

              {/* Name */}
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-5">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" className="text-amber-400" />
                ))}
                <span className="ml-2 text-sm text-zinc-500">5.0 · 128 ulasan</span>
              </div>

              {/* Price */}
              <div className="py-5 border-y border-zinc-100 dark:border-zinc-800 mb-6">
                <p className="text-4xl font-bold">
                  Rp {price.toLocaleString("id-ID")}
                </p>
              </div>

              {/* Description */}
              <p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Stock indicator */}
              <div className="flex items-center gap-2 mb-8">
                <div className={`w-2 h-2 rounded-full ${inStock ? "bg-green-500" : "bg-red-500"}`} />
                <span className={`text-sm font-medium ${inStock ? "text-green-600" : "text-red-500"}`}>
                  {inStock ? `${product.stock} unit tersedia` : "Stok habis"}
                </span>
              </div>

              {/* Add to cart */}
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock || adding}
                  className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                    added
                      ? "bg-green-500 text-white"
                      : "bg-black text-white dark:bg-white dark:text-black hover:opacity-85 hover:scale-[1.02]"
                  }`}
                >
                  {adding ? (
                    <><Loader2 size={18} className="animate-spin" /> Menambahkan...</>
                  ) : added ? (
                    <><CheckCircle size={18} /> Ditambahkan ke Keranjang!</>
                  ) : (
                    <><ShoppingBag size={18} /> {inStock ? "Tambah ke Keranjang" : "Stok Habis"}</>
                  )}
                </button>
              </div>

              {/* Features */}
              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  { label: "Garansi Resmi", desc: "1 tahun garansi" },
                  { label: "Gratis Ongkir", desc: "Ke seluruh Indonesia" },
                  { label: "Pembayaran Aman", desc: "SSL encrypted" },
                  { label: "Retur Mudah", desc: "7 hari retur" },
                ].map((f) => (
                  <div
                    key={f.label}
                    className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-3"
                  >
                    <p className="text-xs font-semibold">{f.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}