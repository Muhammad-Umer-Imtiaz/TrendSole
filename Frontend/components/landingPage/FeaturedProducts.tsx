"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { featuredProducts } from "@/lib/landingContent";
import { MotionReveal } from "./MotionReveal";
import ProductCard from "./ProductCard";

export default function FeaturedProducts() {
  return (
    <section id="featured" className="mx-auto max-w-7xl px-6 py-20 md:py-24">
      <MotionReveal className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-stone-500">
            Editor&apos;s Choice
          </p>

          <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold uppercase tracking-[-0.04em] md:text-5xl">
            Featured Products
          </h2>

          <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">
            Signature silhouettes curated for the sharpest balance of comfort,
            presence, and limited-drop appeal.
          </p>
        </div>

        <motion.div
          whileHover={{ y: -3 }}
          className="w-fit"
        >
          <Link
            href="/products"
            className="inline-flex rounded-full border border-black/10 bg-white/80 px-5 py-3 text-sm font-semibold tracking-[0.18em] text-black shadow-[0_14px_30px_rgba(17,17,17,0.06)]"
          >
            Shop All Featured
          </Link>
        </motion.div>
      </MotionReveal>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {featuredProducts.map((product, index) => (
          <ProductCard key={product.title} index={index} {...product} />
        ))}
      </div>
    </section>
  );
}
