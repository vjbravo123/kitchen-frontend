import type { Metadata } from "next";
import { Outfit, Fraunces } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers/Providers";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kitchen Math & Costing | Artisan Kitchen Manager",
  description: "Accurate recipe costing, inventory math, live scaling and production tracking for passionate bakers and culinary makers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable}`}>
      <body className="min-h-screen flex flex-col font-sans bg-[#FAF6F0] text-[#2F2924] selection:bg-[#E7B86A]/40 selection:text-[#2F2924]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
