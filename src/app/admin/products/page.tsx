"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Pencil,
  Trash2,
} from "lucide-react";

type Product = {
  id: string;

  name: string;

  price: string;

  stock: number;

  imageUrl: string;
};

export default function AdminProductsPage() {

  const [products, setProducts] =
    useState<Product[]>([]);

  async function fetchProducts() {

    try {

      const res = await fetch(
        "https://be-ecommerce.up.railway.app/products"
      );

      const data =
        await res.json();

      setProducts(data);

    } catch (error) {

      console.error(error);
    }
  }

  useEffect(() => {

    fetchProducts();

  }, []);

  async function deleteProduct(
    id: string
  ) {

    const confirmDelete =
      confirm(
        "Delete this product?"
      );

    if (!confirmDelete) return;

    try {

      await fetch(
        `https://be-ecommerce.up.railway.app/products/${id}`,
        {
          method: "DELETE",
        }
      );

      fetchProducts();

    } catch (error) {

      console.error(error);
    }
  }

  return (
    <div>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">

        <div>

          <h1 className="text-5xl font-bold">
            Products
          </h1>

          <p className="text-zinc-500 mt-3">
            Manage your store products.
          </p>

        </div>

       <a
  href="/admin/products/create"
  className="px-6 py-4 rounded-2xl bg-black text-white"
>

          Add Product

        </a>

      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden border border-zinc-200 dark:border-zinc-800">

        <table className="w-full">

          <thead className="border-b border-zinc-200 dark:border-zinc-800">

            <tr className="text-left">

              <th className="p-6">
                Product
              </th>

              <th className="p-6">
                Price
              </th>

              <th className="p-6">
                Stock
              </th>

              <th className="p-6">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {products.map(
              (product) => (
                <tr
                  key={product.id}
                  className="border-b border-zinc-100 dark:border-zinc-800"
                >

                  <td className="p-6">

                    <div className="flex items-center gap-4">

                      <img
                        src={
                          product.imageUrl
                        }
                        alt={
                          product.name
                        }
                        className="w-16 h-16 rounded-2xl object-cover"
                      />

                      <div>

                        <h3 className="font-semibold">

                          {product.name}

                        </h3>

                      </div>

                    </div>

                  </td>

                  <td className="p-6">

                    Rp{" "}
                    {Number(
                      product.price
                    ).toLocaleString()}

                  </td>

                  <td className="p-6">

                    {product.stock}

                  </td>

                  <td className="p-6">

                    <div className="flex items-center gap-3">

                      <button className="w-12 h-12 rounded-xl border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">

                        <Pencil size={18} />

                      </button>

                      <button
                        onClick={() =>
                          deleteProduct(
                            product.id
                          )
                        }
                        className="w-12 h-12 rounded-xl bg-red-500 text-white flex items-center justify-center"
                      >

                        <Trash2 size={18} />

                      </button>

                    </div>

                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}