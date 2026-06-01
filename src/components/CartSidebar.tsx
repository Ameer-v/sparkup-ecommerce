"use client";

import {
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { useCart } from "../context/CartContext";

import { useAuth } from "../context/AuthContext";

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

function getPriceValue(price: string) {
  const value = Number(
    price.replace(/[^0-9]/g, "")
  );

  return Number.isNaN(value) ? 0 : value;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }
  ).format(value);
}

export default function CartSidebar({
  open,
  setOpen,
}: Props) {

  const router = useRouter();

  const {
    cart,
    removeFromCart,
    clearCart,
    syncCart,
  } = useCart();

  const { user, token } = useAuth();

  const total = cart.reduce(
    (acc, item) => {
      return (
        acc +
        getPriceValue(item.price) *
          (item.quantity ?? 1)
      );
    },
    0
  );

  async function handleCheckout() {

    if (!user || !token) {

      alert(
        "Please login first"
      );

      router.push("/login");

      return;
    }

    if (cart.length === 0) {
      return;
    }

    try {
      const response = await fetch(
        "/api/orders",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        alert(
          data?.message ||
            "Checkout failed"
        );
        return;
      }

      await clearCart();
      await syncCart();

      alert(
        "Checkout success!"
      );
    } catch (error) {
      console.error(error);
      alert(
        "Something went wrong"
      );
    }
  }

  async function handleClearCart() {
    await clearCart();
  }

  async function handleRemoveItem(
    id: string
  ) {
    await removeFromCart(id);
  }

  return (
    <>
      {/* OVERLAY */}
      <div
        onClick={() =>
          setOpen(false)
        }
        className={`fixed inset-0 bg-black/50 z-40 transition ${
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
      />

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white dark:bg-zinc-950 z-50 shadow-2xl transition-transform duration-300 flex flex-col ${
          open
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >

        {/* HEADER */}
        <div className="shrink-0 flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">

          <div className="flex items-center gap-3">

            <ShoppingBag size={24} />

            <h2 className="text-2xl font-bold">
              Your Cart
            </h2>

          </div>

          <button
            onClick={() =>
              setOpen(false)
            }
          >

            <X />

          </button>

        </div>

        {/* ITEMS */}
        <div className="flex-1 min-h-0 p-6 flex flex-col gap-4 overflow-y-auto">

          {cart.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">

              <ShoppingBag
                size={60}
                className="text-zinc-300 dark:text-zinc-700"
              />

              <p className="mt-6 text-zinc-500">
                Your cart is empty.
              </p>

            </div>
          )}

          {cart.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="flex gap-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-3"
            >

              <img
                src={item.image}
                alt={item.title}
                className="w-24 h-24 shrink-0 rounded-2xl object-cover bg-zinc-100 dark:bg-zinc-900"
              />

              <div className="min-w-0 flex-1">

                <h3 className="font-semibold truncate">
                  {item.title}
                </h3>

                <p className="text-zinc-500 mt-1">
                  {formatCurrency(
                    getPriceValue(
                      item.price
                    )
                  )}
                </p>

                {(item.quantity ?? 1) >
                  1 && (
                  <p className="text-xs text-zinc-500 mt-1">
                    Qty:{" "}
                    {item.quantity}
                  </p>
                )}

                <button
                  onClick={() =>
                    handleRemoveItem(
                      item.id
                    )
                  }
                  className="text-red-500 text-sm mt-3 flex items-center gap-2"
                >

                  <Trash2 size={14} />

                  Remove

                </button>

              </div>

            </div>
          ))}

        </div>

        {/* FOOTER */}
        <div className="shrink-0 w-full p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">

          <div className="flex items-center justify-between mb-6">

            <p className="text-lg font-medium">
              Total
            </p>

            <p className="text-2xl font-bold">
              {formatCurrency(total)}
            </p>

          </div>

          <div className="flex flex-col gap-3">

            <button
              onClick={
                handleCheckout
              }
              disabled={cart.length === 0}
              className="w-full bg-black text-white dark:bg-white dark:text-black py-4 rounded-full font-medium hover:scale-[1.02] transition disabled:opacity-50 disabled:hover:scale-100"
            >

              Checkout

            </button>

            {cart.length > 0 && (
              <button
                onClick={
                  handleClearCart
                }
                className="w-full border border-zinc-300 dark:border-zinc-700 py-4 rounded-full"
              >

                Clear Cart

              </button>
            )}

          </div>

        </div>

      </div>
    </>
  );
}
