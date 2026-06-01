"use client";

import Link from "next/link";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <main className="min-h-screen flex bg-zinc-100 dark:bg-zinc-950">

      {/* SIDEBAR */}
      <aside className="w-[280px] bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-8">

        <h1 className="text-3xl font-bold mb-12">
          SparkUp
        </h1>

        <nav className="flex flex-col gap-3">

          <Link
            href="/admin"
            className="flex items-center gap-3 px-5 py-4 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >

            <LayoutDashboard size={20} />

            Dashboard

          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-3 px-5 py-4 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >

            <Package size={20} />

            Products

          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 px-5 py-4 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >

            <ShoppingCart size={20} />

            Orders

          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 px-5 py-4 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >

            <Users size={20} />

            Users

          </Link>

        </nav>

      </aside>

      {/* CONTENT */}
      <section className="flex-1 p-10">

        {children}

      </section>

    </main>
  );
}