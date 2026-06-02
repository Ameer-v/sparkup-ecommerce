"use client";

import { useEffect, useState } from "react";
import { RefreshCw, CreditCard, Search, CheckCircle, Clock, XCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

type Payment = {
  id: string;
  orderId?: string;
  status?: string;
  method?: string;
  amount?: string | number;
  createdAt?: string;
  order?: {
    id: string;
    status?: string;
    totalAmount?: string | number;
    user?: { name: string; email: string };
  };
};

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400",
  success: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400",
  pending: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400",
  failed: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
};

export default function AdminPaymentsPage() {
  const { token } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function fetchPayments() {
    setLoading(true);
    try {
      const res = await fetch("/api/payments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : data.payments ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) fetchPayments();
  }, [token]);

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.id?.toLowerCase().includes(q) ||
      p.order?.user?.name?.toLowerCase().includes(q) ||
      p.order?.user?.email?.toLowerCase().includes(q) ||
      p.status?.toLowerCase().includes(q)
    );
  });

  const totalRevenue = payments
    .filter((p) => ["paid", "success"].includes(p.status?.toLowerCase() ?? ""))
    .reduce((acc, p) => acc + Number(p.amount ?? p.order?.totalAmount ?? 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Payments</h1>
          <p className="text-zinc-500 mt-1">
            {loading ? "Loading..." : `${payments.length} transaksi`}
          </p>
        </div>
        <button
          onClick={fetchPayments}
          className="w-12 h-12 rounded-2xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
          <p className="text-xs text-zinc-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold">Rp {totalRevenue.toLocaleString("id-ID")}</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
          <p className="text-xs text-zinc-500 mb-1">Pembayaran Sukses</p>
          <p className="text-2xl font-bold text-green-600">
            {payments.filter((p) => ["paid", "success"].includes(p.status?.toLowerCase() ?? "")).length}
          </p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
          <p className="text-xs text-zinc-500 mb-1">Menunggu</p>
          <p className="text-2xl font-bold text-yellow-600">
            {payments.filter((p) => p.status?.toLowerCase() === "pending").length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder="Cari payment ID, nama customer, atau status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-12 pl-11 pr-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
              <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-500">Payment ID</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-500 hidden md:table-cell">Customer</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-500">Status</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-500 hidden sm:table-cell">Jumlah</th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-zinc-500 hidden lg:table-cell">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-zinc-400 text-sm">Memuat data...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <CreditCard size={36} className="text-zinc-300 mx-auto mb-3" />
                  <p className="text-zinc-400 text-sm">Tidak ada pembayaran ditemukan.</p>
                </td>
              </tr>
            ) : (
              filtered.map((payment) => {
                const statusKey = payment.status?.toLowerCase() ?? "pending";
                const amount = Number(payment.amount ?? payment.order?.totalAmount ?? 0);
                const StatusIcon = statusKey === "paid" || statusKey === "success"
                  ? CheckCircle
                  : statusKey === "failed"
                  ? XCircle
                  : Clock;

                return (
                  <tr key={payment.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${STATUS_STYLES[statusKey] ?? "bg-zinc-100 text-zinc-500"}`}>
                          <StatusIcon size={14} />
                        </div>
                        <div>
                          <p className="font-mono text-sm font-semibold">#{payment.id.slice(-8).toUpperCase()}</p>
                          {payment.order?.id && (
                            <p className="text-xs text-zinc-400">Order #{payment.order.id.slice(-6).toUpperCase()}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      {payment.order?.user ? (
                        <div>
                          <p className="text-sm font-medium">{payment.order.user.name}</p>
                          <p className="text-xs text-zinc-400">{payment.order.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[statusKey] ?? "bg-zinc-100 text-zinc-500"}`}>
                        <StatusIcon size={10} />
                        {payment.status ?? "unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell font-semibold text-sm">
                      Rp {amount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-sm text-zinc-500">
                      {payment.createdAt
                        ? new Date(payment.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}