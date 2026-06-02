"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  ChevronRight,
  Zap,
  Tag,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/src/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: Tag },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/users", label: "Users", icon: Users },
  ];

  return (
    <main className="min-h-screen flex bg-zinc-100 dark:bg-zinc-950">

      {/* SIDEBAR */}
      <aside className="w-[280px] bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">

        {/* Logo */}
        <div className="p-8 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none">SparkUp</h1>
              <p className="text-xs text-zinc-500 mt-0.5">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-6 flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group ${
                  isActive
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{label}</span>
                {isActive && (
                  <ChevronRight size={16} className="ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800">
          {mounted && user && (
            <>
              <div className="flex items-center gap-3 mb-4 px-2">
                <div className="w-9 h-9 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center font-bold text-sm">
                  {user.name?.[0]?.toUpperCase() ?? "A"}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{user.name}</p>
                  <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition text-sm font-medium"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          )}
        </div>

      </aside>

      {/* CONTENT */}
      <section className="flex-1 p-8 overflow-y-auto">
        {children}
      </section>

    </main>
  );
}