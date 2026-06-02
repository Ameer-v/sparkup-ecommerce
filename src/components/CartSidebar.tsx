"use client";

import {
  ShoppingBag,
  Trash2,
  X,
  ArrowRight,
  ShoppingCart,
  Loader2,
  Package,
  Star,
  Tag,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

function getPriceValue(price: string) {
  const cleaned = String(price).replace(/[^0-9.]/g, "");
  const value = parseFloat(cleaned);
  return Number.isNaN(value) ? 0 : value;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

type ProductDetail = {
  id: string;
  name: string;
  description?: string;
  price: string | number;
  stock: number;
  imageUrl?: string;
  category?: { name: string };
};

export default function CartSidebar({ open, setOpen }: Props) {
  const router = useRouter();
  const { cart, removeFromCart, clearCart, syncCart } = useCart();
  const { user, token } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [productDetails, setProductDetails] = useState<Record<string, ProductDetail>>({});
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  // Fetch product details
  useEffect(() => {
    if (!open) return;
    cart.forEach((item) => {
      const pid = item.productId ?? item.id;
      if (pid && !productDetails[pid] && !loadingDetails.has(pid)) {
        setLoadingDetails((prev) => new Set(prev).add(pid));
        fetch(`/api/products/${pid}`)
          .then((r) => r.ok ? r.json() : null)
          .then((data) => {
            if (data) setProductDetails((prev) => ({ ...prev, [pid]: data }));
          })
          .catch(() => {})
          .finally(() => {
            setLoadingDetails((prev) => {
              const next = new Set(prev);
              next.delete(pid);
              return next;
            });
          });
      }
    });
  }, [open, cart]);

  const total = cart.reduce((acc, item) => acc + getPriceValue(item.price) * (item.quantity ?? 1), 0);
  const itemCount = cart.reduce((acc, item) => acc + (item.quantity ?? 1), 0);

  async function handleCheckout() {
    if (!user || !token) {
      setOpen(false);
      router.push("/login");
      return;
    }
    if (cart.length === 0) return;
    setCheckingOut(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        alert(data?.message || "Checkout gagal. Silakan coba lagi.");
        return;
      }
      await clearCart();
      await syncCart();
      setOpen(false);
      router.push("/orders");
    } catch {
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setCheckingOut(false);
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    await removeFromCart(id);
    setRemovingId(null);
  }

  const fallbackImage =
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400";

  return (
    <>
      {/* ── BACKDROP ── */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          backgroundColor: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
          transition: "opacity 0.3s ease, visibility 0.3s ease",
        }}
      />

      {/* ── SIDEBAR (slides in from RIGHT) ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Keranjang belanja"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "100%",
          maxWidth: "420px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          /* THE KEY: translate X based on open state */
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)",
          willChange: "transform",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
        }}
        className="bg-white dark:bg-zinc-950"
      >

        {/* ══ HEADER ══ */}
        <div className="shrink-0 flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black dark:bg-white flex items-center justify-center">
              <ShoppingBag size={18} className="text-white dark:text-black" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-none">Keranjang</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* ✕ Close / Back */}
          <button
            onClick={() => setOpen(false)}
            className="w-10 h-10 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            title="Tutup keranjang"
          >
            <X size={18} />
          </button>
        </div>

        {/* ══ BODY ══ */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[320px] px-8 text-center">
              <div className="w-20 h-20 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-5">
                <ShoppingCart size={32} className="text-zinc-300 dark:text-zinc-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Keranjang kosong</h3>
              <p className="text-sm text-zinc-500 mb-6 leading-relaxed max-w-xs">
                Belum ada produk. Yuk mulai belanja!
              </p>
              <button
                onClick={() => setOpen(false)}
                className="px-8 py-3 rounded-full bg-black text-white dark:bg-white dark:text-black text-sm font-semibold hover:opacity-80 transition"
              >
                Mulai Belanja
              </button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800">
              {cart.map((item, index) => {
                const pid = item.productId ?? item.id;
                const detail = productDetails[pid];
                const isLoadingDetail = loadingDetails.has(pid);
                const price = getPriceValue(item.price);
                const qty = item.quantity ?? 1;
                const subtotal = price * qty;
                const isRemoving = removingId === item.id;
                const stock = detail?.stock ?? null;
                const category = detail?.category?.name;
                const description = detail?.description;
                const imageUrl = detail?.imageUrl || item.image || fallbackImage;

                return (
                  <div
                    key={`${item.id}-${index}`}
                    className={`group flex gap-4 px-5 py-4 transition-all duration-300 ${
                      isRemoving ? "opacity-30 scale-[0.97]" : "opacity-100"
                    }`}
                  >
                    {/* Image */}
                    <div className="shrink-0 relative">
                      <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                        <img
                          src={imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = fallbackImage; }}
                        />
                      </div>
                      {qty > 1 && (
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold flex items-center justify-center shadow">
                          {qty}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {/* Category */}
                      {(category || isLoadingDetail) && (
                        <div className="flex items-center gap-1 mb-1">
                          {isLoadingDetail && !category
                            ? <Loader2 size={10} className="animate-spin text-zinc-400" />
                            : <Tag size={10} className="text-zinc-400 shrink-0" />
                          }
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                            {category ?? "Memuat..."}
                          </span>
                        </div>
                      )}

                      {/* Name */}
                      <p className="text-sm font-semibold leading-snug line-clamp-2 pr-7">
                        {item.title}
                      </p>

                      {/* Description */}
                      {description && (
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                          {description}
                        </p>
                      )}

                      {/* Price row */}
                      <div className="flex items-center justify-between mt-2.5 flex-wrap gap-1">
                        <div>
                          {qty > 1 && (
                            <p className="text-[11px] text-zinc-400 leading-none mb-0.5">
                              {formatCurrency(price)} × {qty}
                            </p>
                          )}
                          <p className="text-sm font-bold">{formatCurrency(subtotal)}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Stock badge */}
                          {stock !== null && (
                            <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                              stock > 10
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : stock > 0
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-red-100 text-red-600"
                            }`}>
                              {stock > 0 ? `Stok ${stock}` : "Habis"}
                            </span>
                          )}
                          {/* Stars */}
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={10} fill="currentColor" className="text-amber-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Remove button — always visible */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={isRemoving}
                      title="Hapus"
                      className="absolute right-5 mt-0 w-7 h-7 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 transition disabled:opacity-50 self-start"
                      style={{ position: "relative", flexShrink: 0, marginTop: "2px" }}
                    >
                      {isRemoving
                        ? <Loader2 size={13} className="animate-spin" />
                        : <Trash2 size={13} />
                      }
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ══ FOOTER ══ */}
        {cart.length > 0 && (
          <div className="shrink-0 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-5 space-y-4">

            {/* Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Subtotal ({itemCount} item)</span>
                <span className="font-medium">{formatCurrency(total)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Ongkos kirim</span>
                <span className="text-green-600 font-semibold">Gratis</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="font-bold text-base">Total</span>
                <span className="font-bold text-xl">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Login notice */}
            {!user && (
              <div className="text-center text-xs text-zinc-500 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl py-2.5 px-4">
                Login diperlukan untuk checkout
              </div>
            )}

            {/* Checkout button */}
            <button
              onClick={handleCheckout}
              disabled={checkingOut || cart.length === 0}
              className="w-full h-13 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-semibold flex items-center justify-center gap-2 hover:opacity-85 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              style={{ height: "52px" }}
            >
              {checkingOut ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Package size={16} />
                  {user ? "Checkout Sekarang" : "Login untuk Checkout"}
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            {/* Clear cart */}
            <button
              onClick={async () => {
                if (confirm("Kosongkan semua isi keranjang?")) {
                  await clearCart();
                }
              }}
              className="w-full h-10 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-500 hover:text-red-500 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
            >
              Kosongkan Keranjang
            </button>
          </div>
        )}
      </div>
    </>
  );
}