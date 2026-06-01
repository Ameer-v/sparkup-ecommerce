export default function Footer() {
  return (
    <footer className="bg-zinc-950 text-white border-t border-zinc-800">

      <div className="max-w-7xl mx-auto px-6 py-20">

        <div className="grid md:grid-cols-4 gap-12">

          {/* Brand */}
          <div>

            <h2 className="text-3xl font-bold">
              SparkUp
            </h2>

            <p className="text-zinc-400 mt-4 leading-relaxed">
              Plug Into Tomorrow.
              <br />
              Modern electronics for modern lifestyle.
            </p>

          </div>

          {/* Shop */}
          <div>

            <h3 className="font-semibold text-lg mb-5">
              Shop
            </h3>

            <ul className="space-y-3 text-zinc-400">
              <li>Laptops</li>
              <li>Smartphones</li>
              <li>Gaming</li>
              <li>Accessories</li>
            </ul>

          </div>

          {/* Support */}
          <div>

            <h3 className="font-semibold text-lg mb-5">
              Support
            </h3>

            <ul className="space-y-3 text-zinc-400">
              <li>Help Center</li>
              <li>Shipping</li>
              <li>Warranty</li>
              <li>Contact</li>
            </ul>

          </div>

          {/* Newsletter */}
          <div>

            <h3 className="font-semibold text-lg mb-5">
              Stay Updated
            </h3>

            <div className="flex flex-col gap-4">

              <input
                type="email"
                placeholder="Your email"
                className="bg-zinc-900 border border-zinc-800 rounded-full px-5 py-4 outline-none focus:border-white transition"
              />

              <button className="bg-white text-black py-4 rounded-full font-medium hover:bg-zinc-200 transition">
                Subscribe
              </button>

            </div>

          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-zinc-800 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">

          <p className="text-zinc-500 text-sm">
            © 2026 SparkUp. All rights reserved.
          </p>

          <p className="text-zinc-500 text-sm">
            Plug Into Tomorrow
          </p>

        </div>

      </div>

    </footer>
  );
}