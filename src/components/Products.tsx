"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Pencil, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import ProductModal from "./ProductModal";
import { useAuth } from "../context/AuthContext";

type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  stock: number;
  imageUrl: string;
  category: {
    id: string;
    name: string;
  };
};

const fallbackImage =
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop";

export default function Products() {
  const { isAdmin } = useAuth(); // ← pakai isAdmin langsung, tidak perlu user?.role?.name

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  async function fetchProducts() {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function deleteProduct(id: string) {
    const confirmDelete = confirm("Delete this product?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("sparkup-token");
      await fetch(`https://be-ecommerce.up.railway.app/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <section className="py-24 flex items-center justify-center">
        <p className="text-xl">Loading products...</p>
      </section>
    );
  }

  return (
    <>
      <section className="py-24 bg-zinc-50 dark:bg-zinc-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">

          {/* HEADER */}
          <div className="flex items-center justify-between mb-14">
            <div>
              <p className="uppercase tracking-[0.3em] text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                Featured Products
              </p>
              <h2 className="text-5xl font-bold tracking-tight text-black dark:text-white">
                Best Sellers
              </h2>
            </div>

            {/* ADMIN BUTTON */}
            {isAdmin && ( // ← ganti dari user?.role?.name === "admin"
              <a
                href="/admin/products/create"
                className="px-6 py-4 rounded-2xl bg-black text-white"
              >
                Add Product
              </a>
            )}
          </div>

          {/* GRID */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition duration-500 group"
              >
                {/* IMAGE */}
                <div className="relative overflow-hidden">
                  <Link href={`/product/${product.id}`}>
                    <img
                      src={
                        product.imageUrl?.startsWith("http")
                          ? product.imageUrl
                          : fallbackImage
                      }
                      alt={product.name}
                      className="w-full h-[350px] object-cover group-hover:scale-105 transition duration-700"
                      onError={(e) => {
                        e.currentTarget.src = fallbackImage;
                      }}
                    />
                  </Link>

                  {/* QUICK VIEW */}
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setOpen(true);
                    }}
                    className="absolute top-5 right-5 w-12 h-12 rounded-full bg-white dark:bg-black shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <Eye size={20} />
                  </button>

                  {/* ADMIN ACTIONS */}
                  {isAdmin && (
                    <div className="absolute top-5 left-5 flex gap-3 z-20">
                      <a
                        href={`/admin/products/edit/${product.id}`}
                        className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg"
                      >
                        <Pencil size={18} />
                      </a>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>

                {/* CONTENT */}
                <div className="p-8">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                    {product.category?.name}
                  </p>
                  <h3 className="text-2xl font-semibold">{product.name}</h3>
                  <div className="flex items-center justify-between mt-8">
                    <p className="text-2xl font-bold">
                      Rp {Number(product.price).toLocaleString()}
                    </p>
                    <button className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition">
                      <ShoppingBag size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MODAL */}
      <ProductModal product={selectedProduct} open={open} setOpen={setOpen} />
    </>
  );
}