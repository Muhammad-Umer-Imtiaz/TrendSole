"use client";

import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { newArrivals } from "@/lib/landingContent";
import { MotionReveal } from "./MotionReveal";
import ProductCard from "./ProductCard";

export default function NewArrivals() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">
      <MotionReveal className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-stone-500">
            Fresh Rotation
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold uppercase tracking-[-0.04em] md:text-5xl">
            New Arrivals
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-stone-600">
            New silhouettes arriving with cleaner construction, softer cushioning,
            and standout seasonal finishes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white transition-colors duration-200 hover:bg-black hover:text-white"
            aria-label="Previous arrivals"
          >
            <FiArrowLeft />
          </button>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-black text-white transition-opacity duration-200 hover:opacity-85"
            aria-label="Next arrivals"
          >
            <FiArrowRight />
          </button>
        </div>
      </MotionReveal>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {newArrivals.map((item, index) => (
          <ProductCard key={item.title} index={index} {...item} />
        ))}
      </div>
    </section>
  );
}
