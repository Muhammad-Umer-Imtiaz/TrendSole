"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FiArrowRight } from "react-icons/fi";

const stats = [
  { value: "24H", label: "Early Drop Access" },
  { value: "4.9★", label: "Customer Rating" },
  { value: "Free", label: "Shipping Worldwide" },
];

const sneakerImages = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
  "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519",
  "https://images.unsplash.com/photo-1543508282-6319a3e2621f",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a",
];

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) =>
        prev === sneakerImages.length - 1 ? 0 : prev + 1
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="home"
      className="relative overflow-hidden px-6 pb-24 pt-12 md:px-10 lg:px-16"
    >
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        
        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] text-zinc-700">
            <span className="h-2 w-2 rounded-full bg-black" />
            New Season Collection
          </div>

          <h1 className="mt-7 text-5xl font-black uppercase leading-[0.95] tracking-[-0.05em] md:text-7xl">
            Future Of <br />
            Sneaker Culture
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-zinc-600 md:text-lg">
            Discover premium sneakers crafted with modern comfort,
            bold aesthetics, and streetwear energy.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <button className="group flex items-center justify-center gap-2 rounded-full bg-black px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white">
              Shop Now
              <FiArrowRight className="transition group-hover:translate-x-1" />
            </button>

            <button className="rounded-full border border-zinc-300 bg-white px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-black hover:text-white">
              Explore More
            </button>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <h3 className="text-3xl font-black">{item.value}</h3>

                <p className="mt-1 text-sm text-zinc-500">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT SIDE IMAGE SLIDER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55 }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-[40px] border border-zinc-200 bg-gradient-to-br from-white to-zinc-100 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.08)]">

            <div className="absolute right-6 top-6 z-20 rounded-full bg-black px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] text-white">
              Limited Edition
            </div>

            <div className="relative flex min-h-[520px] items-center justify-center overflow-hidden rounded-[30px] bg-gradient-to-br from-zinc-100 to-stone-200">

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImage}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Image
                    src={sneakerImages[currentImage]}
                    alt="Sneaker"
                    fill
                    priority
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Dots */}
            <div className="mt-6 flex items-center justify-center gap-2">
              {sneakerImages.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentImage === index
                      ? "w-8 bg-black"
                      : "w-2 bg-zinc-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}