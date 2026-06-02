"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { useAuth } from "../../../context/AuthContext";
import {
  CreditCard,
  Wallet,
  Building2,
  Smartphone,
  QrCode,
  CheckCircle,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  Package,
} from "lucide-react";

type OrderItem = {
  id: string;
  quantity: number;
  price: string | number;
  priceAtPurchase?: string | number;
  product?: { name: string; imageUrl?: string; price?: string | number };
};

type OrderDetail = {
  id: string;
  status: string;
  totalAmount?: string | number;
  total?: string | number;
  shippingAddress?: string;
  items?: OrderItem[];
  orderItems?: OrderItem[];
  payment?: { status?: string; method?: string };
};

const PAYMENT_METHODS = [
  {
    id: "cash",
    label: "Cash on Delivery",
    desc: "Bayar saat barang diterima",
    icon: Wallet,
    color: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "transfer_bank",
    label: "Transfer Bank",
    desc: "BCA, Mandiri, BNI, BRI",
    icon: Building2,
    color: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
  },
  {
    id: "e_wallet",
    label: "E-Wallet",
    desc: "GoPay, OVO, Dana, ShopeePay",
    icon: Smartphone,
    color: "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400",
  },
  {
    id: "qris",
    label: "QRIS",
    desc: "Scan QR untuk pembayaran",
    icon: QrCode,
    color: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
  },
];

const fallbackImage =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400";

export default function CheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const router = useRouter();
  const { token, user, isLoading: authLoading } = useAuth();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading]);

  // Fetch order details
  useEffect(() => {
    if (!token) return;

    async function fetchOrder() {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setError("Pesanan tidak ditemukan.");
          return;
        }
        const data = await res.json();
        setOrder(data);

        // If already paid, show success
        const paymentStatus = data.payment?.status?.toLowerCase();
        if (paymentStatus === "paid" || paymentStatus === "success") {
          setSuccess(true);
        }
      } catch {
        setError("Gagal memuat data pesanan.");
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [token, orderId]);

  async function handlePayment() {
    if (!selectedMethod || !token) return;

    setPaying(true);
    setError(null);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId,
          method: selectedMethod,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message ?? "Pembayaran gagal. Silakan coba lagi.");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setPaying(false);
    }
  }

  function getItems(o: OrderDetail) {
    return o.items ?? o.orderItems ?? [];
  }

  function getTotal(o: OrderDetail) {
    return Number(o.totalAmount ?? o.total ?? 0);
  }

  return (
    <main className="bg-zinc-50 dark:bg-zinc-950 text-black dark:text-white min-h-screen">
      <Navbar />

      <section className="py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-6">
          {/* Back button */}
          {!success && (
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-zinc-500 hover:text-black dark:hover:text-white transition mb-8"
            >
              <ArrowLeft size={16} />
              Kembali
            </button>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 size={32} className="animate-spin text-zinc-400 mb-4" />
              <p className="text-zinc-500 text-sm">Memuat detail pesanan...</p>
            </div>
          ) : error && !order ? (
            <div className="text-center py-24 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800">
              <Package size={40} className="text-zinc-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Pesanan Tidak Ditemukan</h2>
              <p className="text-zinc-500 text-sm mb-6">{error}</p>
              <a
                href="/"
                className="inline-flex px-6 py-3 rounded-full bg-black text-white text-sm font-medium hover:opacity-80 transition"
              >
                Kembali ke Beranda
              </a>
            </div>
          ) : success ? (
            /* ── SUCCESS STATE ── */
            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-[32px] border border-zinc-100 dark:border-zinc-800 px-8">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Pembayaran Berhasil!</h2>
              <p className="text-zinc-500 text-sm mb-2">
                Pesanan #{orderId.slice(-8).toUpperCase()} telah dibayar.
              </p>
              <p className="text-zinc-400 text-xs mb-8">
                Kami akan segera memproses pesanan Anda.
              </p>

              {order && (
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-5 mb-8 max-w-sm mx-auto text-left">
                  <p className="text-xs text-zinc-500 mb-3 font-semibold uppercase tracking-wider">
                    Ringkasan
                  </p>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-500">Total</span>
                    <span className="font-bold">
                      Rp {getTotal(order).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-500">Metode</span>
                    <span className="font-medium capitalize">
                      {selectedMethod?.replace("_", " ") ?? order.payment?.method ?? "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Status</span>
                    <span className="font-medium text-green-600 dark:text-green-400">Dibayar</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="/orders"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:opacity-80 transition"
                >
                  <Package size={15} />
                  Lihat Pesanan Saya
                </a>
                <a
                  href="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  Lanjut Belanja
                </a>
              </div>
            </div>
          ) : order ? (
            /* ── PAYMENT FORM ── */
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left: Payment Methods */}
              <div className="lg:col-span-3 space-y-6">
                <div>
                  <h1 className="text-3xl font-bold">Pembayaran</h1>
                  <p className="text-zinc-500 text-sm mt-1">
                    Pilih metode pembayaran untuk pesanan #{orderId.slice(-8).toUpperCase()}
                  </p>
                </div>

                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = selectedMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                          isSelected
                            ? "border-black dark:border-white bg-white dark:bg-zinc-900 shadow-lg"
                            : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-600"
                        }`}
                      >
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${method.color}`}
                        >
                          <method.icon size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{method.label}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{method.desc}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${
                            isSelected
                              ? "border-black dark:border-white"
                              : "border-zinc-300 dark:border-zinc-600"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl px-5 py-3 text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                <button
                  onClick={handlePayment}
                  disabled={!selectedMethod || paying}
                  className="w-full h-14 rounded-2xl bg-black text-white dark:bg-white dark:text-black text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-85 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {paying ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Memproses pembayaran...
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} />
                      Bayar Rp {order ? getTotal(order).toLocaleString("id-ID") : "0"}
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 justify-center text-xs text-zinc-400">
                  <ShieldCheck size={14} />
                  Pembayaran aman dan terenkripsi
                </div>
              </div>

              {/* Right: Order Summary */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-6 sticky top-28">
                  <h3 className="font-semibold text-sm mb-4">Ringkasan Pesanan</h3>

                  {/* Items */}
                  <div className="flex flex-col gap-3 mb-5">
                    {getItems(order).map((item, idx) => {
                      const priceVal = Number(item.priceAtPurchase ?? item.price ?? item.product?.price ?? 0);
                      return (
                        <div key={item.id ?? idx} className="flex items-center gap-3">
                          <img
                            src={item.product?.imageUrl ?? fallbackImage}
                            alt={item.product?.name ?? "Produk"}
                            className="w-12 h-12 rounded-xl object-cover shrink-0 bg-zinc-100 dark:bg-zinc-800"
                            onError={(e) => {
                              e.currentTarget.src = fallbackImage;
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold truncate">
                              {item.product?.name ?? "Produk"}
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              {item.quantity}x Rp {priceVal.toLocaleString("id-ID")}
                            </p>
                          </div>
                          <p className="text-xs font-semibold shrink-0">
                            Rp {(priceVal * item.quantity).toLocaleString("id-ID")}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2">
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>Subtotal</span>
                      <span>Rp {getTotal(order).toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>Ongkos kirim</span>
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        Gratis
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="font-semibold text-sm">Total</span>
                      <span className="font-bold text-lg">
                        Rp {getTotal(order).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Shipping address */}
                  {(order.shippingAddress || user?.address) && (
                    <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <p className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold mb-1">
                        Alamat Pengiriman
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {order.shippingAddress || user?.address}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <Footer />
    </main>
  );
}
