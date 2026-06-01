"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

export default function CreateProductPage() {

  const router = useRouter();

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [stock, setStock] =
    useState("");

  const [imageUrl, setImageUrl] =
    useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /* FETCH CATEGORIES */
  useEffect(() => {

    async function fetchCategories() {

      try {

        const res = await fetch(
          "https://be-ecommerce.up.railway.app/categories"
        );

        const data =
          await res.json();

        setCategories(data);

      } catch (error) {

        console.error(error);
      }
    }

    fetchCategories();

  }, []);

  /* SUBMIT */
  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    setLoading(true);

    try {

      const token =
        localStorage.getItem(
          "sparkup-token"
        );

      const res = await fetch(
        "https://be-ecommerce.up.railway.app/products",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

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
        }
      );

      const data =
        await res.json();

      if (!res.ok) {

        alert(
          data.message ||
            "Failed to create product"
        );

        return;
      }

      alert(
        "Product created!"
      );

      router.push(
        "/admin/products"
      );

    } catch (error) {

      console.error(error);

      alert("Something went wrong");

    } finally {

      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl">

      {/* HEADER */}
      <div className="mb-10">

        <h1 className="text-5xl font-bold">
          Add Product
        </h1>

        <p className="text-zinc-500 mt-3">
          Create new product for SparkUp.
        </p>

      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-10 flex flex-col gap-6"
      >

        {/* NAME */}
        <div>

          <label className="block mb-3 font-medium">
            Product Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            className="w-full h-14 px-5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none"
            required
          />

        </div>

        {/* DESCRIPTION */}
        <div>

          <label className="block mb-3 font-medium">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
            className="w-full min-h-[140px] p-5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none"
            required
          />

        </div>

        {/* PRICE */}
        <div>

          <label className="block mb-3 font-medium">
            Price
          </label>

          <input
            type="number"
            value={price}
            onChange={(e) =>
              setPrice(
                e.target.value
              )
            }
            className="w-full h-14 px-5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none"
            required
          />

        </div>

        {/* STOCK */}
        <div>

          <label className="block mb-3 font-medium">
            Stock
          </label>

          <input
            type="number"
            value={stock}
            onChange={(e) =>
              setStock(
                e.target.value
              )
            }
            className="w-full h-14 px-5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none"
            required
          />

        </div>

        {/* IMAGE URL */}
        <div>

          <label className="block mb-3 font-medium">
            Image URL
          </label>

          <input
            type="text"
            value={imageUrl}
            onChange={(e) =>
              setImageUrl(
                e.target.value
              )
            }
            className="w-full h-14 px-5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none"
            required
          />

        </div>

        {/* CATEGORY */}
        <div>

          <label className="block mb-3 font-medium">
            Category
          </label>

          <select
            value={categoryId}
            onChange={(e) =>
              setCategoryId(
                e.target.value
              )
            }
            className="w-full h-14 px-5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-transparent outline-none"
            required
          >

            <option value="">
              Select category
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={
                    category.id
                  }
                >

                  {category.name}

                </option>
              )
            )}

          </select>

        </div>

        {/* BUTTON */}
        <button
          disabled={loading}
          className="h-14 rounded-2xl bg-black text-white font-medium mt-4"
        >

          {loading
            ? "Creating..."
            : "Create Product"}

        </button>

      </form>

    </div>
  );
}