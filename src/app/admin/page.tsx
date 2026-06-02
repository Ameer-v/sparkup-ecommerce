"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Tag,
  ShoppingCart,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  Truck,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

type Stats = {
  products: number;
  categories: number;
  orders: number;
  users: number;
};

type RecentOrder = {
  id: string;
  status: string;
  totalAmount?: string | number;
  total?: string | number;
  createdAt?: string;
  user?: { name: string; email: string };
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400",
  paid: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400",
  processing: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400",
  shipped: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400",
  delivered: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400",
  cancelled: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock size={12} />,
  paid: <CheckCircle size={12} />,
  processing: <Package size={12} />,
  shipped: <Truck size={12} />,
  delivered: <CheckCircle size={12} />,
};

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats>({
    products: 0,
    categories: 0,
    orders: 0,
    users: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    async function fetchDashboardData() {
      setLoading(true);
      try {
        const [productsRes, categoriesRes, ordersRes, usersRes] =
          await Promise.allSettled([
            fetch("/api/products"),
            fetch("/api/categories"),
            fetch("/api/orders", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("/api/users", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        let productCount = 0;
        let categoryCount = 0;
        let orderCount = 0;
        let userCount = 0;
        let orders: RecentOrder[] = [];

        if (productsRes.status === "fulfilled" && productsRes.value.ok) {
          const data = await productsRes.value.json();
          const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.products) ? data.products : [];
          productCount = arr.length;
        }
        if (categoriesRes.status === "fulfilled" && categoriesRes.value.ok) {
          const data = await categoriesRes.value.json();
          const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.categories) ? data.categories : [];
          categoryCount = arr.length;
        }
        if (ordersRes.status === "fulfilled" && ordersRes.value.ok) {
          const data = await ordersRes.value.json();
          const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : data.orders ?? [];
          orderCount = arr.length;
          orders = arr.slice(0, 5);
        }
        if (usersRes.status === "fulfilled" && usersRes.value.ok) {
          const data = await usersRes.value.json();
          const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.users) ? data.users : [];
          userCount = arr.length;
        }

        console.log("dashboard data:", { productCount, categoryCount, orderCount, userCount });

        setStats({
          products: productCount,
          categories: categoryCount,
          orders: orderCount,
          users: userCount,
        });
        setRecentOrders(orders);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [token]);

  const statCards = [
    {
      label: "Total Produk",
      value: stats.products,
      icon: Package,
      href: "/admin/products",
      color: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Kategori",
      value: stats.categories,
      icon: Tag,
      href: "/admin/categories",
      color: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total Pesanan",
      value: stats.orders,
      icon: ShoppingCart,
      href: "/admin/orders",
      color: "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400",
    },
    {
      label: "Total Users",
      value: stats.users,
      icon: Users,
      href: "/admin/users",
      color: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-zinc-500 mt-1">
          Selamat datang di admin panel SparkUp
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-6 flex items-start gap-4 hover:border-zinc-300 dark:hover:border-zinc-600 transition group"
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${card.color}`}
            >
              <card.icon size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-zinc-500">{card.label}</p>
              {loading ? (
                <Loader2
                  size={20}
                  className="animate-spin text-zinc-400 mt-1"
                />
              ) : (
                <p className="text-3xl font-bold mt-0.5">{card.value}</p>
              )}
            </div>
            <ArrowRight
              size={16}
              className="ml-auto text-zinc-300 group-hover:text-zinc-500 transition mt-1"
            />
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/products/create"
          className="bg-black dark:bg-white text-white dark:text-black rounded-2xl px-6 py-4 font-medium flex items-center gap-3 hover:opacity-80 transition"
        >
          <Package size={18} />
          Tambah Produk Baru
        </Link>
        <Link
          href="/admin/categories"
          className="bg-white dark:bg-zinc-900 rounded-2xl px-6 py-4 font-medium border border-zinc-200 dark:border-zinc-700 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
        >
          <Tag size={18} />
          Kelola Kategori
        </Link>
        <Link
          href="/admin/orders"
          className="bg-white dark:bg-zinc-900 rounded-2xl px-6 py-4 font-medium border border-zinc-200 dark:border-zinc-700 flex items-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
        >
          <ShoppingCart size={18} />
          Lihat Pesanan
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <TrendingUp size={16} className="text-zinc-500" />
            </div>
            <div>
              <h2 className="font-semibold">Pesanan Terbaru</h2>
              <p className="text-xs text-zinc-400">5 pesanan terakhir</p>
            </div>
          </div>
          <Link
            href="/admin/orders"
            className="text-sm text-zinc-500 hover:text-black dark:hover:text-white transition flex items-center gap-1"
          >
            Lihat semua
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-zinc-400" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart size={32} className="text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">Belum ada pesanan.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-50 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Order
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider hidden md:table-cell">
                  Customer
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider hidden sm:table-cell">
                  Total
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider hidden lg:table-cell">
                  Tanggal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
              {recentOrders.map((order) => {
                const statusKey = order.status?.toLowerCase() ?? "pending";
                const total = Number(
                  order.totalAmount ?? order.total ?? 0
                );
                return (
                  <tr
                    key={order.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition"
                  >
                    <td className="px-6 py-4">
                      <p className="font-mono text-sm font-semibold">
                        #{order.id.slice(-8).toUpperCase()}
                      </p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-sm">{order.user?.name ?? "—"}</p>
                      <p className="text-xs text-zinc-400">
                        {order.user?.email ?? ""}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[statusKey] ?? "bg-zinc-100 text-zinc-500"}`}
                      >
                        {STATUS_ICONS[statusKey]}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell font-semibold text-sm">
                      Rp {total.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-sm text-zinc-500">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}