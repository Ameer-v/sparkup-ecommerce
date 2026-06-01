"use client";

import { motion } from "framer-motion";

export default function Categories() {
  const categories = [
    {
      title: "Laptops",
      image:
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "Smartphones",
      image:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop",
    },
    {
      title: "Gaming",
      image:
        "https://images.unsplash.com/photo-1603481546238-487240415921?q=80&w=1200&auto=format&fit=crop",
    },
  ];

  return (
    <section className="py-24 bg-white dark:bg-zinc-950 transition-colors duration-300">

      <div className="max-w-7xl mx-auto px-6">

        {/* Heading */}
        <div className="mb-14">

          <p className="uppercase tracking-[0.3em] text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            Categories
          </p>

          <h2 className="text-5xl font-bold tracking-tight text-black dark:text-white">
            Explore Products
          </h2>

        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-8">

          {categories.map((category) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="group relative overflow-hidden rounded-[32px] h-[500px] cursor-pointer"
            >

              <img
                src={category.image}
                alt={category.title}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
              />

              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition" />

              <div className="absolute bottom-8 left-8 text-white">

                <h3 className="text-3xl font-bold">
                  {category.title}
                </h3>

                <p className="mt-2 text-white/80">
                  Discover Collection
                </p>

              </div>

            </motion.div>
          ))}

        </div>

      </div>

    </section>
  );
}