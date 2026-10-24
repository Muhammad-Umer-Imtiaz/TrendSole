"use client";

import Image from "next/image";
import Link from "next/link";
import { FiArrowUpRight, FiCheck } from "react-icons/fi";
import { formatCurrency, getDiscountedPrice } from "@/lib/format";
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
  const discountedPrice = getDiscountedPrice(
    product.productPrice,
    product.discountPercentage
  );
  const hasDiscount = discountedPrice < product.productPrice;

  return (
    <article
      className="group overflow-hidden rounded-[30px] border border-[rgba(74,96,105,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(248,246,242,0.96)_100%)] shadow-[0_20px_50px_rgba(88,104,113,0.08)] transition-transform duration-200 hover:-translate-y-1"
      style={{ transitionDelay: `${index * 30}ms` }}
    >
      <div className="relative overflow-hidden border-b border-[rgba(74,96,105,0.08)] bg-[radial-gradient(circle_at_top,_rgba(215,228,221,0.85),_transparent_48%),linear-gradient(135deg,#fbfaf7_0%,#f0f4f1_100%)]">
        <div className={`${compact ? "h-60" : "h-72"} relative`}>
          <div className="absolute left-5 top-5 z-20 flex flex-wrap gap-2">
            <span className="rounded-full border border-[rgba(74,96,105,0.1)] bg-white/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600">
              {getBadge(product, badge)}
            </span>
            {product.offerLabel ? (
              <span className="rounded-full bg-[rgba(242,226,189,0.82)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-800">
                {product.offerLabel}
              </span>
            ) : null}
          </div>

          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.productName}
              fill
              className="object-contain p-8 transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No image available
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              {product.productCategory}
            </p>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-[-0.03em] text-slate-950">
              {product.productName}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{colorSummary}</p>
          </div>

          <Link
            href={targetHref}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[rgba(228,239,234,0.95)] text-slate-800 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
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
              className="rounded-full border border-[rgba(74,96,105,0.1)] bg-white/92 px-3 py-1 text-xs font-medium text-slate-600"
            >
              {color}
            </span>
          ))}
          {(product.colorVariants.length > 0
            ? product.colorVariants.length
            : product.colors.length) > 3 ? (
            <span className="rounded-full border border-[rgba(74,96,105,0.1)] bg-white/92 px-3 py-1 text-xs font-medium text-slate-600">
              +
              {(product.colorVariants.length > 0
                ? product.colorVariants.length
                : product.colors.length) - 3}{" "}
              more
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-[rgba(74,96,105,0.09)] pt-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              Price
            </p>
            <div className="mt-1">
              <p className="text-2xl font-semibold text-slate-950">
                {formatCurrency(discountedPrice)}
              </p>
              {hasDiscount ? (
                <p className="text-sm text-slate-400 line-through">
                  {formatCurrency(product.productPrice)}
                </p>
              ) : null}
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${
              product.stock > 0
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            <FiCheck className={product.stock > 0 ? "opacity-100" : "opacity-40"} />
            {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
          </div>
        </div>
      </div>
    </article>
  );
}
