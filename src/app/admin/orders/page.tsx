"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Search, Package, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

type OrderItem = {
  id: string;
  quantity: number;
  price: string | number;
  product?: { name: string; imageUrl?: string };
};

type Order = {
  id: string;
  status: string;
  totalAmount?: string | number;
  total?: string | number;
  createdAt?: string;
  user?: { name: string; email: string };
  items?: OrderItem[];
  orderItems?: OrderItem[];
};

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400",
  processing: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400",
  shipped: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400",
  delivered: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400",
  cancelled: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock size={12} />,
  processing: <Package size={12} />,
  shipped: <Truck size={12} />,
  delivered: <CheckCircle size={12} />,
  cancelled: <XCircle size={12} />,
};

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : data.orders ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status } : o))
        );
      } else {
        const err = await res.json();
        alert(err.message ?? "Gagal update status.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.id?.toLowerCase().includes(q) ||
      o.user?.name?.toLowerCase().includes(q) ||
      o.user?.email?.toLowerCase().includes(q) ||
      o.status?.toLowerCase().includes(q)
    );
  });

  function getTotal(o: Order) {
    const val = o.totalAmount ?? o.total ?? 0;
    return Number(val);
  }

  function getItems(o: Order) {
    return o.items ?? o.orderItems ?? [];
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold">Orders</h1>
          <p className="text-zinc-500 mt-1">
            {loading ? "Loading..." : `${orders.length} total pesanan`}
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="w-12 h-12 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition self-start sm:self-auto"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {STATUS_OPTIONS.map((s) => {
          const count = orders.filter((o) => o.status?.toLowerCase() === s).length;
          return (
            <div key={s} className={`rounded-2xl p-4 border ${STATUS_STYLES[s]?.replace("text-", "border-").replace(/\s.+/, "")} bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800`}>
              <p className="text-xs text-zinc-500 capitalize mb-1">{s}</p>
              <p className="text-2xl font-bold">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Cari order ID, nama customer, atau status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-12 pl-11 pr-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition text-sm"
        />
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-16 text-center text-zinc-400 text-sm">
            Memuat pesanan...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-16 text-center">
            <Package size={36} className="text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">Tidak ada pesanan ditemukan.</p>
          </div>
        ) : (
          filtered.map((order) => {
            const items = getItems(order);
            const isExpanded = expandedId === order.id;
            const statusKey = order.status?.toLowerCase() ?? "pending";

            return (
              <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                {/* Order Header */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${STATUS_STYLES[statusKey]}`}>
                      {STATUS_ICONS[statusKey] ?? <Package size={16} />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm font-mono">#{order.id.slice(-8).toUpperCase()}</p>
                      {order.user && (
                        <p className="text-xs text-zinc-500 truncate">{order.user.name} · {order.user.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[statusKey]}`}>
                      {STATUS_ICONS[statusKey]}
                      {order.status}
                    </span>

                    <p className="font-bold text-sm">
                      Rp {getTotal(order).toLocaleString("id-ID")}
                    </p>

                    {order.createdAt && (
                      <p className="text-xs text-zinc-400 hidden lg:block">
                        {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}

                    {isExpanded ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="border-t border-zinc-100 dark:border-zinc-800 p-5 space-y-4">
                    {/* Items */}
                    {items.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Items</p>
                        <div className="flex flex-col gap-2">
                          {items.map((item, idx) => (
                            <div key={item.id ?? idx} className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-3">
                              {item.product?.imageUrl && (
                                <img
                                  src={item.product.imageUrl}
                                  alt={item.product.name}
                                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.product?.name ?? "Produk"}</p>
                                <p className="text-xs text-zinc-500">Qty: {item.quantity} · Rp {Number(item.price).toLocaleString("id-ID")}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Update Status */}
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Update Status</p>
                      <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus(order.id, s)}
                            disabled={updatingId === order.id || order.status?.toLowerCase() === s}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition disabled:opacity-50 ${
                              order.status?.toLowerCase() === s
                                ? STATUS_STYLES[s] + " ring-2 ring-offset-2 ring-current"
                                : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                            }`}
                          >
                            {updatingId === order.id ? "..." : s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}