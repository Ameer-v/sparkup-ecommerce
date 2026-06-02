"use client";

import {
  Menu, Moon, Search, ShoppingBag, Sun, X, Loader2, Package,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "next-themes";
import CartSidebar from "./CartSidebar";
import SearchModal from "./SearchModal";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { cart } = useCart();

  const { user, isAdmin, isLoading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur border-b border-zinc-100 dark:border-zinc-800">

      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* LOGO */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SparkUp</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 -mt-1">Plug Into Tomorrow</p>
        </div>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-black dark:text-white">
          <a href="/" className="hover:text-zinc-500 transition">Home</a>
          <a href="#" className="hover:text-zinc-500 transition">Shop</a>
          <a href="#" className="hover:text-zinc-500 transition">Categories</a>
          {user && (
            <a href="/orders" className="hover:text-zinc-500 transition flex items-center gap-1.5">
              <Package size={14} />
              Pesanan
            </a>
          )}
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* Auth area */}
          {isLoading ? (
            <div className="hidden md:flex items-center">
              <Loader2 size={20} className="animate-spin text-zinc-400" />
            </div>
          ) : user ? (
            <div className="hidden md:flex items-center gap-3">

              {isAdmin && (
                <a
                  href="/admin"
                  className="px-5 h-12 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center text-sm font-medium hover:opacity-80 transition"
                >
                  Admin Panel
                </a>
              )}

              <div className="px-5 h-12 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center text-sm">
                {user.name}
              </div>

              <button
                onClick={logout}
                className="px-6 h-12 rounded-full bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition"
              >
                Logout
              </button>

            </div>
          ) : (
            <>
              <a
                href="/login"
                className="hidden md:flex px-6 h-12 items-center rounded-full border border-zinc-300 dark:border-zinc-700 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
              >
                Login
              </a>
              <a
                href="/register"
                className="hidden md:flex px-6 h-12 items-center rounded-full bg-black text-white text-sm hover:opacity-80 transition"
              >
                Register
              </a>
            </>
          )}

          {/* SEARCH */}
          <button
            onClick={() => setSearchOpen(true)}
            className="w-12 h-12 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
          >
            <Search size={20} />
          </button>

          {/* THEME */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-12 h-12 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
          >
            <Sun size={20} className="hidden dark:block" />
            <Moon size={20} className="block dark:hidden" />
          </button>

          {/* CART */}
          <button
            onClick={() => setCartOpen(true)}
            className="hidden md:flex relative w-12 h-12 rounded-full bg-black text-white items-center justify-center hover:scale-105 transition"
          >
            <ShoppingBag size={20} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>

          {/* MOBILE MENU */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-12 h-12 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>

        </div>

      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <nav className="flex flex-col p-6 gap-5 text-lg font-medium">
            <a href="/">Home</a>
            <a href="#">Shop</a>
            <a href="#">Categories</a>
            {user && <a href="/orders" className="flex items-center gap-2"><Package size={16} />Pesanan Saya</a>}
            {isAdmin && (
              <a href="/admin" className="text-purple-600 dark:text-purple-400">
                Admin Panel
              </a>
            )}
            {user ? (
              <button onClick={logout} className="text-red-500 text-left">
                Logout
              </button>
            ) : (
              <>
                <a href="/login">Login</a>
                <a href="/register">Register</a>
              </>
            )}
          </nav>
        </div>
      )}

      <SearchModal open={searchOpen} setOpen={setSearchOpen} />
      <CartSidebar open={cartOpen} setOpen={setCartOpen} />

    </header>
  );
}