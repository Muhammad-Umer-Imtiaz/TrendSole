"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const stats = [
  { value: "24h", label: "Early drop access" },
  { value: "4.9", label: "Average product rating" },
  { value: "Free", label: "Express shipping over $180" },
];

export default function HeroSection() {
  return (
    <section id="home" className="mx-auto max-w-7xl px-6 pb-20 pt-10 md:pb-28 md:pt-14">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-white px-4 py-2 text-xs uppercase tracking-[0.32em] text-stone-600">
            <span className="h-2 w-2 rounded-full bg-black" />
            Spring / Summer Drop
          </div>

          <h1 className="mt-7 max-w-2xl font-[family-name:var(--font-display)] text-5xl font-semibold uppercase leading-[0.92] tracking-[-0.04em] text-balance md:text-7xl">
            Step Into The Future Of Street Performance
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-stone-600 md:text-lg">
            Limited-edition sneakers designed to feel sharp, premium, and fast.
            Trend Sole blends technical comfort with a clean black-and-white
            attitude built for everyday movement.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <button className="rounded-full bg-black px-7 py-3.5 text-sm font-semibold tracking-[0.18em] text-white transition-opacity duration-200 hover:opacity-85">
              SHOP COLLECTION
            </button>

            <button className="rounded-full border border-black/10 bg-white px-7 py-3.5 text-sm font-semibold tracking-[0.18em] text-black transition-colors duration-200 hover:bg-black hover:text-white">
              VIEW LOOKBOOK
            </button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {stats.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: 0.12 + index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="rounded-[24px] border border-black/8 bg-white px-5 py-5"
              >
                <p className="font-[family-name:var(--font-display)] text-3xl font-semibold">
                  {item.value}
                </p>
                <p className="mt-1 text-sm leading-6 text-stone-600">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-[32px] border border-black/8 bg-white px-6 pb-8 pt-10 md:px-8">
            <div className="absolute right-8 top-8 rounded-full border border-black/8 bg-[#f5f3ee] px-4 py-2 text-xs uppercase tracking-[0.3em] text-stone-600">
              Carbon Mesh Upper
            </div>

            <div className="relative mx-auto flex min-h-[440px] items-center justify-center rounded-[28px] bg-[#f3f1eb]">
              <Image
                src="/ShoesImage.webp"
                alt="Trend Sole signature sneaker"
                width={720}
                height={720}
                priority
                className="relative z-10 w-full max-w-xl -rotate-[11deg] object-contain"
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-full border border-black/10 bg-black px-4 py-2 text-sm text-white">
                TS-01 Eclipse
              </div>
              <div className="rounded-full border border-black/10 bg-[#f5f3ee] px-4 py-2 text-sm text-stone-600">
                Responsive foam chassis
              </div>
              <div className="rounded-full border border-black/10 bg-[#f5f3ee] px-4 py-2 text-sm text-stone-600">
                Performance tuned
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
