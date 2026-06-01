import type { Metadata } from "next";

import "./globals.css";

import Providers from "../components/Providers";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";

export const metadata: Metadata = {
  title: "SparkUp",
  description: "Plug Into Tomorrow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html
      lang="en"
      suppressHydrationWarning
    >

      <body suppressHydrationWarning>

        <Providers>

          <AuthProvider>

            <CartProvider>

            {children}

            </CartProvider>

          </AuthProvider>

        </Providers>

      </body>

    </html>
  );
}