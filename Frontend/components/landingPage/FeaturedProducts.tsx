"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { MotionReveal } from "./MotionReveal";
import ProductShowcaseCard from "../ui/ProductShowcaseCard";

interface FeaturedProductsProps {
  products: Product[];
  loading?: boolean;
}

export default function FeaturedProducts({
  products,
  loading = false,
}: FeaturedProductsProps) {
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
          Featured products will appear here once you mark products as featured from the dashboard.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {products.map((product, index) => (
            <ProductShowcaseCard
              key={product.id}
              product={product}
              index={index}
              badge="Featured"
              description={product.productDescription}
            />
          ))}
        </div>
      )}
    </section>
  );
}
