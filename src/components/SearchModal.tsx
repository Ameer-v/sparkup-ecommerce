"use client";

import { Search, X } from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

type Product = {
  id: string;

  name: string;

  imageUrl: string;
};

type Props = {
  open: boolean;

  setOpen: (
    value: boolean
  ) => void;
};

export default function SearchModal({
  open,
  setOpen,
}: Props) {

  const [query, setQuery] =
    useState("");

  const [products, setProducts] =
    useState<Product[]>([]);

  useEffect(() => {

    async function fetchProducts() {

      try {

        const res = await fetch("/api/products");

        if (!res.ok) {
          throw new Error(
            "Failed to fetch products"
          );
        }

        const data =
          (await res.json()) as Product[];

        setProducts(data);

      } catch (error) {

        console.error(error);
      }
    }

    fetchProducts();

  }, []);

  const filtered =
    products.filter((product) =>
      product.name
        .toLowerCase()
        .includes(
          query.toLowerCase()
        )
    );

  return (
    <>
      {/* OVERLAY */}
      <div
        onClick={() =>
          setOpen(false)
        }
        className={`fixed inset-0 bg-black/50 z-50 transition ${
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
      />

      {/* MODAL */}
      <div
        className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white dark:bg-zinc-950 z-50 rounded-b-[40px] shadow-2xl transition-all duration-300 ${
          open
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >

        {/* HEADER */}
        <div className="flex items-center gap-4 p-6 border-b border-zinc-200 dark:border-zinc-800">

          <Search className="text-zinc-500" />

          <input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) =>
              setQuery(
                e.target.value
              )
            }
            className="flex-1 bg-transparent outline-none text-lg"
          />

          <button
            onClick={() =>
              setOpen(false)
            }
          >

            <X />

          </button>

        </div>

        {/* RESULTS */}
        <div className="max-h-[500px] overflow-y-auto p-6 flex flex-col gap-4">

          {filtered.length ===
            0 && (
            <p className="text-zinc-500">
              No products found.
            </p>
          )}

          {filtered.map(
            (product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                onClick={() =>
                  setOpen(false)
                }
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
              >

                <img
                  src={
                    product.imageUrl
                  }
                  alt={product.name}
                  className="w-20 h-20 rounded-2xl object-cover"
                />

                <h3 className="font-semibold text-lg">

                  {product.name}

                </h3>

              </Link>
            )
          )}

        </div>

      </div>
    </>
  );
}
