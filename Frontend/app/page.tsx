"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FiArrowRight,
  FiCheckCircle,
  FiCompass,
  FiShield,
  FiShoppingBag,
  FiTruck,
  FiUser,
} from "react-icons/fi";
import Footer from "@/components/landingPage/Footer";
import Navbar from "@/components/landingPage/Navbar";
import ProductShowcaseCard from "@/components/ui/ProductShowcaseCard";
import { productApi } from "@/lib/api";
import { formatCurrency, getDiscountedPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

const quickSections = [
  {
    id: "featured",
    title: "Featured picks",
    description: "A curated edit for users who want the strongest products first.",
    icon: FiCompass,
  },
  {
    id: "new-arrivals",
    title: "New arrivals",
    description: "Fresh additions surfaced clearly without overloading the page.",
    icon: FiTruck,
  },
  {
    id: "best-sellers",
    title: "Best sellers",
    description: "Popular products arranged in a cleaner, easier-to-compare layout.",
    icon: FiShield,
  },
];

const servicePoints = [
  "Clear product browsing with lighter surfaces and softer contrast.",
  "Simple paths into account, products, and order actions.",
  "A homepage designed to support shopping, not distract from it.",
];

const trustNotes = [
  {
    title: "Product-first structure",
    description: "The landing page now leads users directly into the catalog with clearer hierarchy and fewer competing blocks.",
  },
  {
    title: "Softer presentation",
    description: "Light colors, restrained depth, and calmer spacing reduce visual fatigue across the storefront.",
  },
  {
    title: "Better continuity",
    description: "This page now feels connected to the catalog, account, and product details instead of behaving like a different site.",
  },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivalProducts, setNewArrivalProducts] = useState<Product[]>([]);
  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadLandingProducts = async () => {
      try {
        setLoadingProducts(true);

        const [featured, arrivals, bestSellers, fallbackProducts] = await Promise.all([
          productApi.list({ featured: true, limit: 4 }),
          productApi.list({ newArrival: true, limit: 4 }),
          productApi.list({ bestSeller: true, limit: 4 }),
          productApi.list({ limit: 12 }),
        ]);

        if (!isMounted) {
          return;
        }

        setFeaturedProducts(
          featured.length > 0 ? featured.slice(0, 4) : fallbackProducts.slice(0, 4)
        );
        setNewArrivalProducts(
          arrivals.length > 0 ? arrivals.slice(0, 4) : fallbackProducts.slice(4, 8)
        );
        setBestSellerProducts(
          bestSellers.length > 0
            ? bestSellers.slice(0, 4)
            : fallbackProducts.slice(8, 12).length > 0
              ? fallbackProducts.slice(8, 12)
              : fallbackProducts.slice(0, 4)
        );
      } catch {
        if (!isMounted) {
          return;
        }

        setFeaturedProducts([]);
        setNewArrivalProducts([]);
        setBestSellerProducts([]);
      } finally {
        if (isMounted) {
          setLoadingProducts(false);
        }
      }
    };

    void loadLandingProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const heroProduct = useMemo(
    () => featuredProducts[0] ?? newArrivalProducts[0] ?? bestSellerProducts[0] ?? null,
    [bestSellerProducts, featuredProducts, newArrivalProducts]
  );

  const sideProduct = useMemo(
    () => newArrivalProducts[0] ?? featuredProducts[1] ?? bestSellerProducts[1] ?? null,
    [bestSellerProducts, featuredProducts, newArrivalProducts]
  );

  const renderProductGrid = (
    products: Product[],
    loading: boolean,
    emptyMessage: string
  ) => {
    if (loading) {
      return (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-[420px] animate-pulse rounded-[30px] bg-[rgba(228,239,234,0.6)]"
            />
          ))}
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="rounded-[28px] border border-dashed border-[rgba(74,96,105,0.2)] bg-[rgba(255,255,255,0.72)] px-6 py-12 text-center text-sm text-slate-500">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product, index) => (
          <ProductShowcaseCard key={product.id} product={product} index={index} />
        ))}
      </div>
    );
  };

  const heroPrice = heroProduct
    ? getDiscountedPrice(heroProduct.productPrice, heroProduct.discountPercentage)
    : null;

  return (
    <main className="app-shell overflow-hidden text-slate-900">
      <Navbar />

      <section id="home" className="mx-auto max-w-7xl px-6 pb-8 pt-8">
        <div className="grid gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="soft-panel rounded-[38px] px-7 py-8 sm:px-10 sm:py-10">
            <p className="section-kicker">Trend Sole</p>
            <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-5xl font-semibold leading-[1.05] text-slate-950 sm:text-6xl">
              A cleaner sneaker storefront built for easier browsing and softer visual flow.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Shop featured pairs, explore new arrivals, and move into your account or product catalog through a landing page that feels lighter, calmer, and more connected to the rest of the website.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products"
                className="button-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold"
              >
                Browse products
                <FiArrowRight />
              </Link>
              <Link
                href="/account"
                className="button-secondary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold"
              >
                <FiUser />
                Open account
              </Link>
            </div>

            <div className="mt-8 grid gap-3">
              {servicePoints.map((item) => (
                <div key={item} className="flex items-start gap-3 text-sm leading-7 text-slate-600">
                  <FiCheckCircle className="mt-1 text-[var(--accent-strong)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {quickSections.map((section) => {
                const Icon = section.icon;

                return (
                  <Link
                    key={section.id}
                    href={`/#${section.id}`}
                    className="rounded-[26px] border border-[rgba(74,96,105,0.1)] bg-[rgba(255,255,255,0.76)] px-4 py-5 transition-colors hover:bg-white"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(228,239,234,0.95)] text-slate-800">
                      <Icon />
                    </div>
                    <p className="mt-4 text-base font-semibold text-slate-950">
                      {section.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {section.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="soft-card rounded-[34px] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-kicker">Featured Right Now</p>
                  <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950">
                    {heroProduct?.productName ?? "Loading featured product"}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {heroProduct?.productDescription ??
                      "A featured catalog item will appear here once live product data loads."}
                  </p>
                </div>
                {heroPrice ? (
                  <div className="rounded-full border border-[rgba(74,96,105,0.1)] bg-white px-4 py-2 text-sm font-semibold text-slate-950">
                    {formatCurrency(heroPrice)}
                  </div>
                ) : null}
              </div>

              <div className="relative mt-5 min-h-[320px] overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top,_rgba(220,233,227,0.9),_transparent_44%),linear-gradient(180deg,#fbfaf7_0%,#eff4f1_100%)]">
                {heroProduct?.productImages[0]?.url ? (
                  <Image
                    src={heroProduct.productImages[0].url}
                    alt={heroProduct.productName}
                    fill
                    className="object-contain p-8"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-400">
                    Product imagery will appear here when your catalog data is available.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="soft-card rounded-[30px] p-5">
                <p className="section-kicker">Storefront Flow</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950">
                  Products, account, and order paths now feel part of one system.
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  The landing page now hands users cleanly into the same soft design language used across the catalog and account experience.
                </p>
              </div>

              <div className="soft-card rounded-[30px] p-5">
                <p className="section-kicker">New Arrival Pick</p>
                <div className="mt-3 flex items-start gap-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[22px] bg-[radial-gradient(circle_at_top,_rgba(220,233,227,0.9),_transparent_44%),linear-gradient(180deg,#fbfaf7_0%,#eff4f1_100%)]">
                    {sideProduct?.productImages[0]?.url ? (
                      <Image
                        src={sideProduct.productImages[0].url}
                        alt={sideProduct.productName}
                        fill
                        className="object-contain p-3"
                      />
                    ) : null}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-950">
                      {sideProduct?.productName ?? "Fresh catalog item"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {sideProduct?.productCategory ??
                        "This smaller card keeps the right side useful without making the page feel heavy."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="soft-card rounded-[34px] p-7">
            <p className="section-kicker">Why It Fits Better</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-slate-950">
              The homepage now behaves like the front of the same website, not a separate visual idea.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              The structure is intentionally simpler, more product-led, and closer to the catalog experience users see after clicking through.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {trustNotes.map((note) => (
              <div key={note.title} className="soft-card rounded-[30px] p-6">
                <p className="text-lg font-semibold text-slate-950">{note.title}</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">{note.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="featured" className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="section-kicker">Featured Picks</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-slate-950">
              Start with the strongest products in the catalog.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              This section gives customers an immediate, easy-to-scan entry point into the store without crowding the page with extra decoration.
            </p>
          </div>
          <Link
            href="/products"
            className="button-secondary inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
          >
            <FiShoppingBag />
            View all products
          </Link>
        </div>

        {renderProductGrid(
          featuredProducts,
          loadingProducts,
          "Featured products will appear here once the catalog is available."
        )}
      </section>

      <section id="new-arrivals" className="mx-auto max-w-7xl px-6 py-10">
        <div className="soft-panel rounded-[38px] px-6 py-8 sm:px-8">
          <div className="mb-6 grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="section-kicker">New Arrivals</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-slate-950">
                Fresh additions with a layout that stays calm and readable.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                New products get their own dedicated section and the same softer visual treatment used across the rest of the storefront.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[26px] border border-[rgba(74,96,105,0.1)] bg-white/78 px-5 py-5">
                <p className="text-sm font-semibold text-slate-950">Less visual pressure</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Cleaner spacing and lighter contrast help users stay focused on products rather than decorative UI.
                </p>
              </div>
              <div className="rounded-[26px] border border-[rgba(74,96,105,0.1)] bg-white/78 px-5 py-5">
                <p className="text-sm font-semibold text-slate-950">Better continuity</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Moving from homepage to category and product pages now feels much more consistent.
                </p>
              </div>
            </div>
          </div>

          {renderProductGrid(
            newArrivalProducts,
            loadingProducts,
            "New arrivals will appear here once the latest products are available."
          )}
        </div>
      </section>

      <section id="best-sellers" className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.92fr]">
          <div>
            {renderProductGrid(
              bestSellerProducts,
              loadingProducts,
              "Best sellers will appear here when sales data is available."
            )}
          </div>

          <div className="soft-card rounded-[36px] p-7">
            <p className="section-kicker">Best Sellers</p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-slate-950">
              Popular products deserve a cleaner frame around them.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              This section is intentionally quieter. It gives top-performing products enough emphasis without turning the page into a heavy marketing layout.
            </p>

            <div className="mt-8 grid gap-4">
              <div className="rounded-[24px] border border-[rgba(74,96,105,0.1)] bg-[rgba(248,246,242,0.88)] px-4 py-4">
                <p className="text-sm font-semibold text-slate-950">Connected to the catalog</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Best sellers now feel like part of the same store journey instead of a separate landing gimmick.
                </p>
              </div>
              <div className="rounded-[24px] border border-[rgba(74,96,105,0.1)] bg-[rgba(248,246,242,0.88)] px-4 py-4">
                <p className="text-sm font-semibold text-slate-950">Easier product comparison</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Cleaner cards and better spacing make it easier to compare what matters: product, price, and availability.
                </p>
              </div>
            </div>

            <Link
              href="/products"
              className="button-primary mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
            >
              Continue shopping
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-4 pt-8">
        <div className="soft-panel rounded-[38px] px-7 py-8 sm:px-10 sm:py-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="section-kicker">Ready To Browse</p>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-slate-950">
                Enter the store through a layout that finally feels aligned with the rest of the website.
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                The homepage now stays simple, product-led, and consistent with the catalog, account, and detail pages so users can move through the site without friction.
              </p>
            </div>

            <Link
              href="/products"
              className="button-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold"
            >
              Explore products
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
