"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ShoppingBag,
  CreditCard,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type OrderItem = {
  id: string;
  quantity: number;
  price: string | number;
  priceAtPurchase?: string | number;
  product?: { name: string; imageUrl?: string; description?: string; price?: string | number };
};

type Order = {
  id: string;
  status: string;
  totalAmount?: string | number;
  total?: string | number;
  createdAt?: string;
  items?: OrderItem[];
  orderItems?: OrderItem[];
  payment?: { status?: string; method?: string };
  payments?: { status?: string; method?: string }[];
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  processing: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock size={14} />,
  paid: <CheckCircle size={14} />,
  processing: <Package size={14} />,
  shipped: <Truck size={14} />,
  delivered: <CheckCircle size={14} />,
  cancelled: <XCircle size={14} />,
};

export default function OrdersPage() {
  const { token, user, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading]);

  async function fetchOrders() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log("my-orders response:", data);

      // Try multiple response envelope formats
      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.orders)
          ? data.orders
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.results)
              ? data.results
              : [];

      setOrders(arr);
    } catch (e) {
      console.error("fetchOrders error:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  async function payOrder(orderId: string) {
    if (!confirm("Konfirmasi pembayaran untuk pesanan ini?")) return;
    setPayingId(orderId);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId, method: "cash" }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Pembayaran berhasil!");
        await fetchOrders();
      } else {
        alert(data.message ?? "Gagal melakukan pembayaran.");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan.");
    } finally {
      setPayingId(null);
    }
  }

  function getTotal(o: Order) {
    return Number(o.totalAmount ?? o.total ?? 0);
  }

  function getItems(o: Order) {
    return o.items ?? o.orderItems ?? [];
  }

  const fallbackImage = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400";

  return (
    <main className="bg-white dark:bg-zinc-950 text-black dark:text-white min-h-screen">
      <Navbar />

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="mb-10">
            <p className="uppercase tracking-[0.3em] text-xs text-zinc-500 mb-3">Akun Saya</p>
            <h1 className="text-4xl font-bold">Pesanan Saya</h1>
            {!loading && (
              <p className="text-zinc-500 mt-2 text-sm">{orders.length} pesanan ditemukan</p>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-24 bg-zinc-50 dark:bg-zinc-900 rounded-[40px] border border-zinc-100 dark:border-zinc-800">
              <ShoppingBag size={48} className="text-zinc-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Belum ada pesanan</h3>
              <p className="text-zinc-500 text-sm mb-6">Mulai berbelanja dan pesanan kamu akan muncul di sini.</p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-sm font-medium hover:opacity-80 transition"
              >
                Mulai Belanja
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((order) => {
                const items = getItems(order);
                const isExpanded = expandedId === order.id;
                const statusKey = order.status?.toLowerCase() ?? "pending";
                const isPending = statusKey === "pending";
                const paymentStatus = order.payment?.status?.toLowerCase() ?? order.payments?.[0]?.status?.toLowerCase();
                const isPaid = paymentStatus === "paid" || paymentStatus === "success";
                const paymentMethod = order.payment?.method ?? order.payments?.[0]?.method;

                return (
                  <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm">
                    {/* Header */}
                    <div
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition"
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${STATUS_STYLES[statusKey]}`}>
                          {STATUS_ICONS[statusKey] ?? <Package size={16} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                          {order.createdAt && (
                            <p className="text-xs text-zinc-500">
                              {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[statusKey]}`}>
                          {STATUS_ICONS[statusKey]}
                          {order.status}
                        </span>
                        {isPaid && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            <CreditCard size={10} />
                            Dibayar
                          </span>
                        )}
                        <p className="font-bold text-sm">Rp {getTotal(order).toLocaleString("id-ID")}</p>
                        {isPending && !isPaid && (
                          <a
                            href={`/checkout/${order.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-80 transition"
                          >
                            <CreditCard size={12} />
                            Bayar
                          </a>
                        )}
                        {isExpanded ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
                      </div>
                    </div>

                    {/* Expanded */}
                    {isExpanded && (
                      <div className="border-t border-zinc-50 dark:border-zinc-800 p-5 space-y-5">
                        {/* Items */}
                        {items.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">Produk</p>
                            <div className="flex flex-col gap-2">
                              {items.map((item, idx) => {
                                const priceVal = Number(item.priceAtPurchase ?? item.price ?? item.product?.price ?? 0);
                                return (
                                  <div key={item.id ?? idx} className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-3">
                                    <img
                                      src={item.product?.imageUrl ?? fallbackImage}
                                      alt={item.product?.name ?? "Produk"}
                                      className="w-14 h-14 rounded-xl object-cover shrink-0 bg-zinc-100"
                                      onError={(e) => { e.currentTarget.src = fallbackImage; }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold truncate">{item.product?.name ?? "Produk"}</p>
                                      <p className="text-xs text-zinc-500 mt-0.5">
                                        {item.quantity}x · Rp {priceVal.toLocaleString("id-ID")}
                                      </p>
                                    </div>
                                    <p className="text-sm font-semibold shrink-0">
                                      Rp {(priceVal * item.quantity).toLocaleString("id-ID")}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Total & Payment */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-zinc-50 dark:border-zinc-800">
                          <div>
                            <p className="text-xs text-zinc-500">Total Pembayaran</p>
                            <p className="text-xl font-bold mt-0.5">Rp {getTotal(order).toLocaleString("id-ID")}</p>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${isPaid ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                              <CreditCard size={10} />
                              {isPaid ? `Dibayar via ${paymentMethod?.replace("_", " ") ?? "-"}` : "Belum Dibayar"}
                            </span>
                          </div>

                          {isPending && !isPaid && (
                            <a
                              href={`/checkout/${order.id}`}
                              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:opacity-80 transition"
                            >
                              <CreditCard size={15} />
                              Bayar Sekarang
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}