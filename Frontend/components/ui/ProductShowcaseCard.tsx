"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FiArrowUpRight, FiCheck } from "react-icons/fi";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/lib/types";

interface ProductShowcaseCardProps {
  product: Product;
  index?: number;
  href?: string;
  badge?: string;
  description?: string;
  compact?: boolean;
}

const getBadge = (product: Product, badge?: string) => {
  if (badge) {
    return badge;
  }

  if (product.isFeatured) {
    return "Featured";
  }

  if (product.isNewArrival) {
    return "New Arrival";
  }

  if (product.isBestSeller) {
    return "Best Seller";
  }

  return product.stock > 0 ? "In Stock" : "Sold Out";
};

const getColorSummary = (product: Product) =>
  product.colorVariants.length > 0
    ? product.colorVariants.map((variant) => variant.color).join(" • ")
    : product.colors.length > 0
      ? product.colors.join(" • ")
      : product.productCategory;

export default function ProductShowcaseCard({
  product,
  index = 0,
  href,
  badge,
  description,
  compact = false,
}: ProductShowcaseCardProps) {
  const primaryImage = product.productImages[0]?.url;
  const targetHref = href ?? `/products/${product.id}`;
  const colorSummary = getColorSummary(product);

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.45,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -5 }}
      className="group overflow-hidden rounded-[30px] border border-[#ddd5ca] bg-[linear-gradient(180deg,#fffdf9_0%,#f7f1e8_100%)] shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
    >
      <div className="relative overflow-hidden border-b border-[#e8dfd2] bg-[radial-gradient(circle_at_top,_rgba(196,166,122,0.22),_transparent_48%),linear-gradient(135deg,#fbf6ef_0%,#f2ece3_100%)]">
        <div className={`${compact ? "h-60" : "h-72"} relative`}>
          <span className="absolute left-5 top-5 z-20 rounded-full border border-black/8 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-600">
            {getBadge(product, badge)}
          </span>

          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.productName}
              fill
              className="object-contain p-8 transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-stone-400">
              No image available
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
              {product.productCategory}
            </p>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {product.productName}
            </h3>
            <p className="mt-2 text-sm text-stone-600">{colorSummary}</p>
          </div>

          <Link
            href={targetHref}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-label={`View ${product.productName}`}
          >
            <FiArrowUpRight />
          </Link>
        </div>

        <p className="line-clamp-3 text-sm leading-7 text-slate-600">
          {description ?? product.productDescription}
        </p>

        <div className="flex flex-wrap gap-2">
          {(product.colorVariants.length > 0
            ? product.colorVariants.map((variant) => variant.color)
            : product.colors
          )
            .slice(0, 3)
            .map((color) => (
            <span
              key={color}
              className="rounded-full border border-[#ddd5ca] bg-white/90 px-3 py-1 text-xs font-medium text-slate-600"
            >
              {color}
            </span>
          ))}
          {(product.colorVariants.length > 0
            ? product.colorVariants.length
            : product.colors.length) > 3 ? (
            <span className="rounded-full border border-[#ddd5ca] bg-white/90 px-3 py-1 text-xs font-medium text-slate-600">
              +
              {(product.colorVariants.length > 0
                ? product.colorVariants.length
                : product.colors.length) - 3}{" "}
              more
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-[#e7ddd1] pt-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-stone-500">
              Price
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">
              {formatCurrency(product.productPrice)}
            </p>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${
              product.stock > 0
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            }`}
          >
            <FiCheck className={product.stock > 0 ? "opacity-100" : "opacity-40"} />
            {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
