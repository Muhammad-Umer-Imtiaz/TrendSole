"use client";

import { motion } from "framer-motion";
import { MotionReveal } from "./MotionReveal";

export default function MembershipBanner() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 md:py-24">
      <MotionReveal>
        <div className="relative overflow-hidden rounded-[30px] border border-black/8 bg-black px-6 py-18 text-center text-white md:px-10">
          <div className="relative z-10">
            <p className="text-sm uppercase tracking-[0.4em] text-white/70">
              Exclusive Membership
            </p>

            <h2 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-semibold uppercase leading-[0.95] tracking-[-0.04em] md:text-6xl">
              Trend Sole Rewards
              <br />
              Join The Elite
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/72">
              Unlock priority access, members-only price drops, and early styling
              previews before each collection goes public.
            </p>

            <motion.button
              whileHover={{ y: -2 }}
              type="button"
              className="mt-8 rounded-full bg-white px-8 py-3.5 text-sm font-semibold tracking-[0.2em] text-black"
            >
              START YOUR JOURNEY
            </motion.button>
          </div>
        </div>
      </MotionReveal>
    </section>
  );
}
