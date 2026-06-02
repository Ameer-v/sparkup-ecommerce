"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "../../../../../context/AuthContext";

type Category = {
  id: string;
  name: string;
};

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { token } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingProduct, setFetchingProduct] = useState(true);

  /* Fetch product */
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        setName(data.name ?? "");
        setDescription(data.description ?? "");
        setPrice(String(data.price ?? ""));
        setStock(String(data.stock ?? ""));
        setImageUrl(data.imageUrl ?? "");
        setCategoryId(data.category?.id ?? data.categoryId ?? "");
      } catch (error) {
        console.error(error);
        alert("Failed to load product.");
      } finally {
        setFetchingProduct(false);
      }
    }
    fetchProduct();
  }, [id]);

  /* Fetch categories */
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
      }
    }
    fetchCategories();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          description,
          price: Number(price),
          stock: Number(stock),
          imageUrl,
          categoryId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message ?? "Failed to update product.");
        return;
      }
      alert("Product updated!");
      router.push("/admin/products");
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (fetchingProduct) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">

      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-500 hover:text-black dark:hover:text-white transition text-sm mb-5"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <h1 className="text-4xl font-bold">Edit Product</h1>
        <p className="text-zinc-500 mt-1">Update product details below.</p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-8 flex flex-col gap-6"
      >

        {/* Image preview */}
        {imageUrl && (
          <div className="w-full h-48 rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}

        {/* Name */}
        <div>
          <label className="block mb-2 font-medium text-sm">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-12 px-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-2 font-medium text-sm">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-transparent outline-none resize-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition"
            required
          />
        </div>

        {/* Price & Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium text-sm">Price (Rp)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full h-12 px-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition"
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-medium text-sm">Stock</label>
            <input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className="w-full h-12 px-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition"
              required
            />
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className="block mb-2 font-medium text-sm">Image URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full h-12 px-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-transparent outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block mb-2 font-medium text-sm">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full h-12 px-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 transition"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 h-12 rounded-2xl border border-zinc-200 dark:border-zinc-700 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 h-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-medium hover:opacity-80 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </form>

    </div>
  );
}