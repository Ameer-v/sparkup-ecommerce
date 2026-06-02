"use client";

import { X, ShoppingBag, CheckCircle, Star, Package } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { Product } from "../data/products";

type Props = {
  product: Product | null;
  open: boolean;
  setOpen: (value: boolean) => void;
};

export default function ProductModal({ product, open, setOpen }: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  if (!product) return null;

  async function handleAdd() {
    if (!product) return;
    await addToCart({
      id: product.id,
      productId: product.id,
      title: product.name,
      price: String(product.price),
      image: product.imageUrl,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const price = Number(product.price);

  return (
    <>
      {/* OVERLAY */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* MODAL */}
      <div
        className={`fixed top-1/2 left-1/2 z-50 w-[95%] max-w-4xl -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-950 rounded-[40px] overflow-hidden shadow-2xl transition-all duration-300 ${
          open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* CLOSE */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-5 right-5 z-10 w-11 h-11 rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-black/20 transition"
        >
          <X size={18} />
        </button>

        <div className="grid lg:grid-cols-2">
          {/* IMAGE */}
          <div className="bg-zinc-100 dark:bg-zinc-900 h-[400px] lg:h-auto overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800";
              }}
            />
          </div>

          {/* CONTENT */}
          <div className="p-8 lg:p-10 flex flex-col justify-center">
            {/* Category */}
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 mb-4">
              {product.category?.name}
            </p>

            {/* Name */}
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight mb-4">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} fill="currentColor" className="text-amber-400" />
              ))}
              <span className="ml-2 text-sm text-zinc-500">5.0 (128 ulasan)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <p className="text-3xl font-bold">
                Rp {price.toLocaleString("id-ID")}
              </p>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              <Package size={14} className="text-zinc-400" />
              <span className={`text-sm ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                {product.stock > 0 ? `Stok: ${product.stock} tersedia` : "Stok habis"}
              </span>
            </div>

            {/* Description */}
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm mb-8 line-clamp-4">
              {product.description}
            </p>

            {/* Add to Cart */}
            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-semibold transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
                added
                  ? "bg-green-500 text-white"
                  : "bg-black text-white dark:bg-white dark:text-black hover:opacity-85"
              }`}
            >
              {added ? (
                <>
                  <CheckCircle size={18} />
                  Ditambahkan!
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  {product.stock === 0 ? "Stok Habis" : "Tambah ke Keranjang"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}