"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { disciplines } from "@/lib/landingContent";
import { MotionReveal, MotionStagger, cardReveal } from "./MotionReveal";

export default function DisciplineSection() {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-6 py-20 md:py-24">
      <MotionReveal className="mx-auto mb-12 max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.32em] text-stone-500">
          Shop By Discipline
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold uppercase tracking-[-0.04em] md:text-5xl">
          Built For Every Pace
        </h2>
        <p className="mt-4 text-base leading-7 text-stone-600">
          Explore categories shaped around how the collection moves through
          daily wear, training, and statement styling.
        </p>
      </MotionReveal>

      <MotionStagger className="grid gap-6 md:grid-cols-3">
        {disciplines.map((item) => (
          <motion.article
            key={item.title}
            variants={cardReveal}
            whileHover={{ y: -4 }}
            className={`relative overflow-hidden rounded-[28px] border border-black/8 bg-gradient-to-br ${item.surfaceClassName} p-7`}
          >
            <div className="relative z-10 max-w-[14rem]">
              <p className="text-xs uppercase tracking-[0.3em] text-black/55">
                {item.subtitle}
              </p>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold uppercase tracking-[-0.04em] text-black">
                {item.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-black/65">{item.description}</p>
              <button
                type="button"
                className="mt-8 rounded-full border border-black/10 bg-white px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-black"
              >
                Explore Now
              </button>
            </div>

            <Image
              src="/ShoesImage.webp"
              alt={`${item.title} category sneaker`}
              width={360}
              height={360}
              className={`absolute h-auto w-[78%] max-w-[320px] object-contain ${item.imageClassName ?? ""}`}
            />
          </motion.article>
        ))}
      </MotionStagger>
    </section>
  );
}
