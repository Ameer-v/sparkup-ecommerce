"use client";

import { X, ShoppingBag } from "lucide-react";

import { useCart } from "../context/CartContext";
import { Product } from "../data/products";

type Props = {
  product: Product | null;
  open: boolean;
  setOpen: (value: boolean) => void;
};

export default function ProductModal({
  product,
  open,
  setOpen,
}: Props) {

  const { addToCart } = useCart();

  if (!product) return null;

  return (
    <>
      {/* OVERLAY */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/60 z-50 transition ${
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
      />

      {/* MODAL */}
      <div
        className={`fixed top-1/2 left-1/2 z-50 w-[95%] max-w-5xl -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-zinc-950 rounded-[40px] overflow-hidden shadow-2xl transition-all duration-300 ${
          open
            ? "opacity-100 scale-100"
            : "opacity-0 scale-95 pointer-events-none"
        }`}
      >

        {/* CLOSE */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-black text-white flex items-center justify-center"
        >

          <X size={20} />

        </button>

        <div className="grid lg:grid-cols-2">

          {/* IMAGE */}
          <div className="bg-zinc-100 dark:bg-zinc-900">

            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />

          </div>

          {/* CONTENT */}
          <div className="p-10 lg:p-14 flex flex-col justify-center">

            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 mb-5">
              {product.category?.name}
            </p>

            <h2 className="text-5xl font-bold tracking-tight">
              {product.name}
            </h2>

            <p className="text-4xl font-bold mt-8">
              ${product.price}
            </p>

            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mt-8 text-lg">
              {product.description}
            </p>

            <button
              onClick={() => {
                addToCart({
                  id: product.id,
                  productId: product.id,
                  title: product.name,
                  price: String(
                    product.price
                  ),
                  image: product.imageUrl,
                });
              }}
              className="mt-10 bg-black text-white dark:bg-white dark:text-black py-5 rounded-full flex items-center justify-center gap-3 hover:scale-[1.02] transition"
            >

              <ShoppingBag size={20} />

              Add To Cart

            </button>

          </div>

        </div>

      </div>
    </>
  );
}
