"use client";

import type { Product } from "@/lib/types";
import { MotionReveal } from "./MotionReveal";
import ProductShowcaseCard from "../ui/ProductShowcaseCard";

interface BestSellersProps {
  products: Product[];
  loading?: boolean;
}

export default function BestSellers({
  products,
  loading = false,
}: BestSellersProps) {
  return (
    <section id="best-sellers" className="mx-auto max-w-7xl px-6 py-20 md:py-24">
      <MotionReveal className="mb-14 text-center">
        <p className="text-xs uppercase tracking-[0.32em] text-stone-500">
          Proven Favorites
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold uppercase tracking-[-0.04em] md:text-5xl">
          Our Best Sellers
        </h2>

        <p className="mt-4 text-base leading-7 text-stone-600">
          The pairs our customers keep coming back for, celebrated for comfort,
          finish, and all-day wearability.
        </p>
      </MotionReveal>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[440px] animate-pulse rounded-[30px] bg-white/80"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-black/10 bg-white/70 px-6 py-14 text-center text-sm text-stone-500">
          Best sellers will appear here once you highlight them from the product manager.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product, index) => (
            <ProductShowcaseCard
              key={product.id}
              product={product}
              index={index}
              badge="Best Seller"
            />
          ))}
        </div>
      )}
    </section>
  );
}
