"use client";

import {
  ShoppingBag,
  Trash2,
  X,
  Minus,
  Plus,
  ArrowRight,
  ShoppingCart,
  Loader2,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useState } from "react";
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

export default function CartSidebar({ open, setOpen }: Props) {
  const router = useRouter();
  const { cart, removeFromCart, clearCart, syncCart } = useCart();
  const { user, token } = useAuth();
  const [checkingOut, setCheckingOut] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const total = cart.reduce((acc, item) => {
    return acc + getPriceValue(item.price) * (item.quantity ?? 1);
  }, 0);

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
    } catch (error) {
      console.error(error);
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
      {/* OVERLAY */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white dark:bg-zinc-950 z-50 flex flex-col transition-transform duration-500 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ boxShadow: "-20px 0 60px rgba(0,0,0,0.15)" }}
      >
        {/* ── HEADER ── */}
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
          <button
            onClick={() => setOpen(false)}
            className="w-10 h-10 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── ITEMS ── */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {cart.length === 0 ? (
            /* Empty state */
            <div className="h-full flex flex-col items-center justify-center px-8 text-center">
              <div className="w-24 h-24 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mb-5">
                <ShoppingCart size={36} className="text-zinc-300 dark:text-zinc-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Keranjang kosong</h3>
              <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
                Belum ada produk. Yuk mulai belanja dan temukan produk favoritmu!
              </p>
              <button
                onClick={() => setOpen(false)}
                className="px-6 py-3 rounded-full bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:opacity-80 transition"
              >
                Mulai Belanja
              </button>
            </div>
          ) : (
            /* Cart items */
            <div className="p-4 flex flex-col gap-3">
              {cart.map((item, index) => {
                const price = getPriceValue(item.price);
                const qty = item.quantity ?? 1;
                const subtotal = price * qty;
                const isRemoving = removingId === item.id;

                return (
                  <div
                    key={`${item.id}-${index}`}
                    className={`group relative flex gap-4 bg-zinc-50 dark:bg-zinc-900 rounded-3xl p-4 transition-all duration-300 ${
                      isRemoving ? "opacity-40 scale-95" : "opacity-100"
                    }`}
                  >
                    {/* Product image */}
                    <div className="shrink-0 w-20 h-20 rounded-2xl overflow-hidden bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700">
                      <img
                        src={item.image || fallbackImage}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = fallbackImage;
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <p className="text-sm font-semibold leading-snug line-clamp-2">
                          {item.title}
                        </p>
                        <p className="text-xs text-zinc-400 mt-1">
                          {formatCurrency(price)} / item
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Qty badge */}
                        <div className="flex items-center gap-1">
                          <span className="w-7 h-7 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xs font-bold">
                            {qty}
                          </span>
                          <span className="text-xs text-zinc-400">×</span>
                        </div>

                        {/* Subtotal */}
                        <p className="text-sm font-bold">{formatCurrency(subtotal)}</p>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={isRemoving}
                      title="Hapus item"
                      className="absolute top-3 right-3 w-7 h-7 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    >
                      {isRemoving ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Trash2 size={12} />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        {cart.length > 0 && (
          <div className="shrink-0 border-t border-zinc-100 dark:border-zinc-800 p-5 space-y-4 bg-white dark:bg-zinc-950">
            {/* Order summary */}
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-sm text-zinc-500">
                <span>{itemCount} item</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-zinc-500">
                <span>Ongkos kirim</span>
                <span className="text-green-600 font-medium">Gratis</span>
              </div>
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">{formatCurrency(total)}</span>
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
                  {user ? "Checkout Sekarang" : "Login untuk Checkout"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Clear cart */}
            <button
              onClick={async () => {
                if (confirm("Kosongkan keranjang?")) {
                  await clearCart();
                }
              }}
              className="w-full h-10 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-500 hover:text-red-500 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
            >
              Kosongkan Keranjang
            </button>
          </div>
        )}
      </aside>
    </>
  );
}