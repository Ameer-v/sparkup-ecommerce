"use client";

import {
  use,
  useEffect,
  useState,
} from "react";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

import {
  ShoppingBag,
  Star,
} from "lucide-react";

import { useCart } from "../../../context/CartContext";

type Product = {
  id: string;

  name: string;

  description: string;

  price: number | string;

  stock: number;

  imageUrl: string;

  category: {
    id: string;
    name: string;
    slug?: string;
    description?: string;
  };
};

export default function ProductDetail({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = use(params);

  const { addToCart } =
    useCart();

  const [product, setProduct] =
    useState<Product | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    async function fetchProduct() {

      try {

        const res = await fetch(
          `/api/products/${id}`
        );

        if (!res.ok) {
          setProduct(null);
          return;
        }

        const data =
          (await res.json()) as Product;

        setProduct(data);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    }

    fetchProduct();

  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">

        <h1 className="text-3xl font-bold">
          Loading...
        </h1>

      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen flex items-center justify-center">

        <h1 className="text-3xl font-bold">
          Product Not Found
        </h1>

      </main>
    );
  }

  return (
    <main className="bg-white dark:bg-zinc-950 text-black dark:text-white transition-colors duration-300 min-h-screen">

      <Navbar />

      <section className="py-24">

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

          {/* IMAGE */}
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-[40px] overflow-hidden">

            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-[700px] object-cover"
            />

          </div>

          {/* CONTENT */}
          <div>

            <p className="uppercase tracking-[0.3em] text-sm text-zinc-500 dark:text-zinc-400 mb-4">

              {product.category?.name}

            </p>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">

              {product.name}

            </h1>

            {/* RATING */}
            <div className="flex items-center gap-1 mt-6">

              <Star
                size={18}
                fill="currentColor"
              />

              <Star
                size={18}
                fill="currentColor"
              />

              <Star
                size={18}
                fill="currentColor"
              />

              <Star
                size={18}
                fill="currentColor"
              />

              <Star
                size={18}
                fill="currentColor"
              />

              <span className="ml-3 text-zinc-500 dark:text-zinc-400">

                5.0 Rating

              </span>

            </div>

            {/* PRICE */}
            <p className="text-4xl font-bold mt-8">

              ${product.price}

            </p>

            {/* DESCRIPTION */}
            <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed mt-8">

              {product.description}

            </p>

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-4 mt-10">

              <button
                onClick={() => {
                  addToCart({
                    id: product.id,
                    productId: product.id,
                    title: product.name,
                    price: String(
                      product.price
                    ),
                    image:
                      product.imageUrl,
                  });
                }}
                className="bg-black text-white dark:bg-white dark:text-black px-8 py-4 rounded-full flex items-center gap-3 hover:scale-105 transition"
              >

                <ShoppingBag size={20} />

                Add To Cart

              </button>

            </div>

          </div>

        </div>

      </section>

      <Footer />

    </main>
  );
}
