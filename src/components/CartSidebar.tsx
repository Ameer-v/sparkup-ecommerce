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
  Minus,
  Plus,
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

  // Local quantity state for UI (synced with cart)
  const [localQtys, setLocalQtys] = useState<Record<string, number>>({});

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

  // Sync local quantities from cart
  useEffect(() => {
    const qtys: Record<string, number> = {};
    cart.forEach((item) => {
      qtys[item.id] = item.quantity ?? 1;
    });
    setLocalQtys(qtys);
  }, [cart]);

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

  const total = cart.reduce(
    (acc, item) => acc + getPriceValue(item.price) * (localQtys[item.id] ?? item.quantity ?? 1),
    0
  );
  const itemCount = cart.reduce((acc, item) => acc + (localQtys[item.id] ?? item.quantity ?? 1), 0);

  async function handleCheckout() {
    if (!user || !token) {
      setOpen(false);
      router.push("/login");
      return;
    }
    if (cart.length === 0) return;
    setCheckingOut(true);
    try {
      // First, ensure all cart items exist on the backend
      for (const item of cart) {
        const pid = item.productId ?? item.id;
        if (pid) {
          const cartRes = await fetch("/api/cart", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId: pid,
              quantity: localQtys[item.id] ?? item.quantity ?? 1,
            }),
          });
          if (!cartRes.ok) {
            const errData = await cartRes.json().catch(() => null);
            console.error("Cart sync failed for", pid, errData);
          }
        }
      }

      // Verify backend cart is not empty
      const cartCheck = await fetch("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartData = await cartCheck.json().catch(() => null);
      console.log("Backend cart before order:", cartData);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shippingAddress: user?.address || "-",
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        console.error("Order creation failed:", data);
        alert(data?.message || "Checkout gagal. Silakan coba lagi.");
        return;
      }
      const orderId = data?.id ?? data?.order?.id;
      await clearCart();
      await syncCart();
      setOpen(false);
      if (orderId) {
        router.push(`/checkout/${orderId}`);
      } else {
        router.push("/orders");
      }
    } catch (err) {
      console.error("Checkout error:", err);
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

  if (!open) return null;

  return (
    <>
      {/* ── BACKDROP ── */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm"
        style={{ animation: "fadeIn 0.2s ease" }}
      />

      {/* ── MODAL (centered popup) ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Keranjang belanja"
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-[28px] border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col pointer-events-auto"
          style={{
            maxHeight: "min(640px, 90vh)",
            animation: "popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* ══ HEADER ══ */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-black dark:bg-white flex items-center justify-center">
                <ShoppingBag size={16} className="text-white dark:text-black" />
              </div>
              <div>
                <h2 className="text-sm font-semibold leading-none text-black dark:text-white">
                  Keranjang Belanja
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {itemCount} item{itemCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-zinc-500"
              title="Tutup"
            >
              <X size={15} />
            </button>
          </div>

          {/* ══ BODY ══ */}
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col gap-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-4">
                  <ShoppingCart size={28} className="text-zinc-300 dark:text-zinc-600" />
                </div>
                <h3 className="text-sm font-semibold mb-1 text-black dark:text-white">
                  Keranjang kosong
                </h3>
                <p className="text-xs text-zinc-400 mb-5 max-w-[200px] leading-relaxed">
                  Belum ada produk. Yuk mulai belanja!
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="px-6 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-80 transition"
                >
                  Mulai Belanja
                </button>
              </div>
            ) : (
              cart.map((item, index) => {
                const pid = item.productId ?? item.id;
                const detail = productDetails[pid];
                const isLoadingDetail = loadingDetails.has(pid);
                const price = getPriceValue(item.price);
                const qty = localQtys[item.id] ?? item.quantity ?? 1;
                const subtotal = price * qty;
                const isRemoving = removingId === item.id;
                const stock = detail?.stock ?? null;
                const category = detail?.category?.name;
                const description = detail?.description;
                const imageUrl = detail?.imageUrl || item.image || fallbackImage;

                return (
                  <div
                    key={`${item.id}-${index}`}
                    className={`border border-zinc-100 dark:border-zinc-800 rounded-2xl p-3 flex flex-col gap-2.5 transition-all duration-300 ${
                      isRemoving ? "opacity-30 scale-[0.97]" : "opacity-100"
                    }`}
                  >
                    {/* Top: image + info */}
                    <div className="flex gap-3">
                      {/* Image */}
                      <div className="relative shrink-0">
                        <img
                          src={imageUrl}
                          alt={item.title}
                          className="w-[68px] h-[68px] rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800"
                          onError={(e) => { e.currentTarget.src = fallbackImage; }}
                        />
                        {qty > 1 && (
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold flex items-center justify-center">
                            {qty}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        {/* Category */}
                        <div className="flex items-center gap-1 mb-1">
                          {isLoadingDetail && !category ? (
                            <Loader2 size={9} className="animate-spin text-zinc-400" />
                          ) : category ? (
                            <Tag size={9} className="text-zinc-400 shrink-0" />
                          ) : null}
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                            {category ?? (isLoadingDetail ? "Memuat..." : "")}
                          </span>
                        </div>

                        {/* Name */}
                        <p className="text-xs font-semibold text-black dark:text-white leading-snug line-clamp-1 mb-1">
                          {item.title}
                        </p>

                        {/* Description */}
                        {description ? (
                          <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-2">
                            {description}
                          </p>
                        ) : isLoadingDetail ? (
                          <div className="h-3 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded-full animate-pulse mt-1" />
                        ) : null}
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={isRemoving}
                        title="Hapus"
                        className="self-start w-7 h-7 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 transition disabled:opacity-50 flex-shrink-0"
                      >
                        {isRemoving ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Trash2 size={12} />
                        )}
                      </button>
                    </div>

                    {/* Bottom: price + qty + meta */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-zinc-50 dark:border-zinc-800/60">
                      {/* Price */}
                      <div>
                        {qty > 1 && (
                          <p className="text-[10px] text-zinc-400 leading-none mb-0.5">
                            {formatCurrency(price)} × {qty}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-black dark:text-white">
                          {formatCurrency(subtotal)}
                        </p>
                      </div>

                      {/* Right side: rating + stock + qty ctrl */}
                      <div className="flex items-center gap-2">
                        {/* Stars */}
                        <div className="hidden sm:flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={9} fill="currentColor" className="text-amber-400" />
                          ))}
                        </div>

                        {/* Stock */}
                        {stock !== null && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              stock > 10
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : stock > 0
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {stock > 0 ? `Stok ${stock}` : "Habis"}
                          </span>
                        )}

                        {/* Qty control */}
                        <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 p-0.5">
                          <button
                            onClick={() =>
                              setLocalQtys((prev) => ({
                                ...prev,
                                [item.id]: Math.max(1, (prev[item.id] ?? 1) - 1),
                              }))
                            }
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition text-xs"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="text-xs font-semibold w-5 text-center text-black dark:text-white">
                            {qty}
                          </span>
                          <button
                            onClick={() =>
                              setLocalQtys((prev) => ({
                                ...prev,
                                [item.id]: (prev[item.id] ?? 1) + 1,
                              }))
                            }
                            disabled={stock !== null && qty >= stock}
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition text-xs disabled:opacity-30"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ══ FOOTER ══ */}
          {cart.length > 0 && (
            <div className="flex-shrink-0 border-t border-zinc-100 dark:border-zinc-800 px-5 py-4 flex flex-col gap-3">
              {/* Summary */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Subtotal ({itemCount} item)</span>
                  <span className="font-medium text-black dark:text-white">{formatCurrency(total)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Ongkos kirim</span>
                  <span className="text-green-600 dark:text-green-400 font-semibold">Gratis</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-sm font-semibold text-black dark:text-white">Total</span>
                  <span className="text-base font-bold text-black dark:text-white">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Login notice */}
              {!user && (
                <div className="text-center text-xs text-zinc-500 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl py-2 px-3">
                  Login diperlukan untuk checkout
                </div>
              )}

              {/* Checkout button */}
              <button
                onClick={handleCheckout}
                disabled={checkingOut || cart.length === 0}
                className="w-full h-11 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-semibold flex items-center justify-center gap-2 hover:opacity-85 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {checkingOut ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Package size={15} />
                    {user ? "Checkout Sekarang" : "Login untuk Checkout"}
                    <ArrowRight size={14} />
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
                className="w-full h-9 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-500 hover:text-red-500 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
              >
                Kosongkan Keranjang
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}