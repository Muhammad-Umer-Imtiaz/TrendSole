"use client";

import { FaStar } from "react-icons/fa";
import { motion } from "framer-motion";
import { MotionReveal, MotionStagger, cardReveal } from "./MotionReveal";

const reviews = [
  {
    name: "Marcus Chen",
    review:
      "The craftsmanship is unparalleled. I’ve never felt more confident on the track.",
  },
  {
    name: "Elena Rossi",
    review:
      "Elite design meets absolute performance. These are the only sneakers I wear.",
  },
  {
    name: "Jameson V",
    review:
      "A luxury experience from browsing to unboxing. The quality is insane.",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="mx-auto max-w-7xl px-6 py-20 md:py-24">
      <MotionReveal className="mx-auto mb-12 max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.32em] text-stone-500">
          Client Voices
        </p>
        <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold uppercase tracking-[-0.04em] md:text-5xl">
          The Elite Experience
        </h2>
      </MotionReveal>

      <MotionStagger className="grid gap-6 md:grid-cols-3">
        {reviews.map((item) => (
          <motion.article
            key={item.name}
            variants={cardReveal}
            whileHover={{ y: -4 }}
            className="rounded-[26px] border border-black/8 bg-white p-8"
          >
            <div className="mb-5 flex gap-1 text-amber-500">
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
            </div>

            <p className="text-lg leading-8 text-stone-600">{item.review}</p>

            <div className="mt-8 border-t border-black/8 pt-5">
              <h4 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.03em]">
                {item.name}
              </h4>
              <p className="mt-1 text-sm uppercase tracking-[0.22em] text-stone-500">
                Verified Customer
              </p>
            </div>
          </motion.article>
        ))}
      </MotionStagger>
    </section>
  );
}
