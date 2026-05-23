"use client";

import { motion } from "framer-motion";
import { MotionReveal } from "./MotionReveal";

export default function Newsletter() {
  return (
    <section id="contact" className="mx-auto max-w-5xl px-6 py-20 text-center md:py-24">
      <MotionReveal>
        <div className="relative overflow-hidden rounded-[30px] border border-black/8 bg-white px-6 py-14 md:px-10">
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.34em] text-stone-500">
              Stay Connected
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold uppercase tracking-[-0.04em] md:text-5xl">
              Stay Ahead Of The Trend
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-stone-600">
              Sign up for early access to limited drops, styling previews, and
              members-only launch updates.
            </p>

            <div className="mx-auto mt-8 flex max-w-3xl flex-col gap-4 rounded-[24px] border border-black/8 bg-[#f7f5f0] p-3 md:flex-row">
              <input
                type="email"
                placeholder="Your email address"
                className="min-h-14 flex-1 rounded-full border border-transparent bg-white px-5 text-sm outline-none placeholder:text-stone-400 focus:border-black/10"
              />

              <motion.button
                whileHover={{ y: -2 }}
                type="button"
                className="rounded-full bg-black px-8 py-4 text-sm font-semibold tracking-[0.18em] text-white"
              >
                SUBSCRIBE
              </motion.button>
            </div>
          </div>
        </div>
      </MotionReveal>
    </section>
  );
}
