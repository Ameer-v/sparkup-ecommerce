export default function PromoBanner() {
  return (
    <section className="py-24 bg-white dark:bg-zinc-950 transition-colors duration-300">

      <div className="max-w-7xl mx-auto px-6">

        <div className="relative overflow-hidden rounded-[40px] bg-black text-white">

          {/* Background Image */}
          <img
            src="https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1600&auto=format&fit=crop"
            alt="Promo"
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />

          {/* Content */}
          <div className="relative z-10 px-10 py-24 md:px-20 max-w-3xl">

            <p className="uppercase tracking-[0.3em] text-sm text-zinc-300 mb-5">
              SparkUp Exclusive
            </p>

            <h2 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
              Upgrade Your
              <br />
              Setup Today
            </h2>

            <p className="mt-8 text-zinc-300 text-lg leading-relaxed">
              Discover futuristic devices and premium
              accessories crafted for creators,
              gamers, and professionals.
            </p>

            <a
              href="#shop"
              className="inline-block mt-10 bg-white text-black px-8 py-4 rounded-full font-medium hover:scale-105 transition cursor-pointer"
            >
              Shop Collection
            </a>

          </div>

        </div>

      </div>

    </section>
  );
}