"use client";

import { bestSellerProducts } from "@/lib/landingContent";
import { MotionReveal } from "./MotionReveal";
import ProductCard from "./ProductCard";

export default function BestSellers() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">
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

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {bestSellerProducts.map((item, index) => (
          <ProductCard key={item.title} index={index} {...item} />
        ))}
      </div>
    </section>
  );
}
