"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";

interface Props {
  title: string;
  subtitle: string;
  price: string;
  image: string;
  label: string;
  href?: string;
  surfaceClassName?: string;
  imageClassName?: string;
  index?: number;
}

export default function ProductCard({
  title,
  subtitle,
  price,
  image,
  label,
  href = "/products",
  surfaceClassName = "from-stone-100 via-white to-zinc-100",
  imageClassName = "",
  index = 0,
}: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4 }}
      className="group rounded-[26px] border border-black/8 bg-white p-3"
    >
      <div
        className={`relative flex h-[260px] items-center justify-center overflow-hidden rounded-[20px] bg-gradient-to-br ${surfaceClassName}`}
      >
        <span className="absolute left-4 top-4 rounded-full border border-black/8 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-stone-600">
          {label}
        </span>

        <Image
          src={image}
          alt={title}
          width={320}
          height={320}
          className={`relative z-10 w-[88%] object-contain transition-transform duration-300 group-hover:scale-[1.02] ${imageClassName}`}
        />
      </div>

      <div className="mt-5 flex items-start justify-between gap-4 px-1 pb-1">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.03em]">
            {title}
          </h3>

          <p className="mt-1 text-sm text-stone-500">{subtitle}</p>

          <p className="mt-4 text-lg font-semibold text-black">{price}</p>
        </div>

        <Link
          href={href}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-black text-white transition-opacity duration-200 group-hover:opacity-85"
          aria-label={`View ${title}`}
        >
          <FiArrowUpRight />
        </Link>
      </div>
    </motion.article>
  );
}
