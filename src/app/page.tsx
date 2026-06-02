"use client";

import { motion } from "framer-motion";

import Navbar from "../components/Navbar";
import Categories from "../components/Categories";
import PromoBanner from "../components/PromoBanner";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="bg-white dark:bg-zinc-950 text-black dark:text-white transition-colors duration-300">

      <Navbar />

      {/* HERO */}
      <section className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center">

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >

            <p className="uppercase tracking-[0.3em] text-sm text-zinc-500 mb-5">
              SparkUp Technology
            </p>

            <h1 className="text-5xl md:text-7xl font-bold leading-none tracking-tight">
              Plug Into
              <br />
              Tomorrow
            </h1>

            <p className="text-zinc-600 dark:text-zinc-400 text-lg mt-8 max-w-xl leading-relaxed">
              Discover premium laptops, smartphones,
              gaming gear, and modern accessories
              designed for your digital lifestyle.
            </p>

            <div className="flex gap-4 mt-10">

              <a
                href="#shop"
                className="bg-black text-white dark:bg-white dark:text-black px-8 py-4 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-100 transition flex items-center justify-center font-medium text-sm md:text-base cursor-pointer"
              >
                Shop Now
              </a>

              <a
                href="#categories"
                className="border border-black dark:border-white px-8 py-4 rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition flex items-center justify-center font-medium text-sm md:text-base cursor-pointer"
              >
                Explore
              </a>

            </div>

          </motion.div>

          {/* RIGHT */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >

            <img
              src="https://doran.id/wp-content/uploads/2024/08/image7-3.jpg"
              alt="Laptop"
              className="rounded-[40px] shadow-2xl"
            />

          </motion.div>

        </div>

      </section>

      <Categories />

      <PromoBanner />

      <Footer />

    </main>
  );
}