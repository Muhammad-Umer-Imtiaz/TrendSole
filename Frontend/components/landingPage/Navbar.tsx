"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  FiArrowRight,
  FiGrid,
  FiMenu,
  FiSearch,
  FiShoppingBag,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useAuthStore } from "@/store/auth.store";

const links = [
  { label: "Home", href: "/#home" },
  { label: "Collection", href: "/products" },
  { label: "New Arrivals", href: "/#new-arrivals" },
  { label: "Best Sellers", href: "/#best-sellers" },
  { label: "Contact", href: "/#contact" },
];

const isActiveLink = (pathname: string, href: string) => {
  if (href === "/products") {
    return pathname.startsWith("/products");
  }

  return pathname === "/" && href.startsWith("/#");
};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();

    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }

    setMobileOpen(false);
    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const accountHref = !isAuthenticated
    ? "/login"
    : user?.role === "customer"
      ? "/account"
      : "/dashboard";

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-black/8 bg-[#f5f3ee]/85 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="rounded-[30px] border border-[#ddd5ca] bg-[linear-gradient(135deg,rgba(255,255,255,0.94)_0%,rgba(247,241,232,0.92)_100%)] px-4 py-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:px-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href="/#home" className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-slate-950 text-sm font-semibold text-white shadow-[0_14px_26px_rgba(15,23,42,0.18)]">
                  TS
                </div>
                <div>
                  <p className="font-[family-name:var(--font-display)] text-lg font-semibold uppercase tracking-[0.14em] text-slate-950">
                    Trend Sole
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.26em] text-stone-500">
                    Premium sneaker store
                  </p>
                </div>
              </Link>
            </div>

            <nav className="hidden items-center gap-2 rounded-full border border-black/8 bg-white/70 px-3 py-2 lg:flex">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActiveLink(pathname, link.href)
                      ? "bg-slate-950 text-white"
                      : "text-stone-600 hover:bg-stone-100 hover:text-slate-950"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <form
                onSubmit={handleSearch}
                className="flex w-[320px] items-center rounded-full border border-black/10 bg-white px-4 py-3 shadow-[0_10px_20px_rgba(15,23,42,0.05)]"
              >
                <FiSearch className="text-stone-500" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search sneakers, colors, and categories"
                  className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
                />
              </form>

              {isAuthenticated && user?.role !== "customer" ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-950 hover:text-white"
                >
                  <FiGrid />
                  Dashboard
                </Link>
              ) : null}

              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-950 hover:text-white"
              >
                <FiShoppingBag />
                Shop
              </Link>

              <Link
                href={accountHref}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <FiUser />
                {isAuthenticated ? "Account" : "Sign in"}
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen((current) => !current)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-black/10 bg-white text-slate-900 lg:hidden"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {mobileOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>

          {mobileOpen ? (
            <div className="mt-4 space-y-4 rounded-[26px] border border-black/8 bg-white/80 p-4 lg:hidden">
              <form
                onSubmit={handleSearch}
                className="flex items-center rounded-2xl border border-black/10 bg-white px-4 py-3"
              >
                <FiSearch className="text-stone-500" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search the collection"
                  className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
                />
              </form>

              <div className="grid gap-2">
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActiveLink(pathname, link.href)
                        ? "bg-slate-950 text-white"
                        : "bg-stone-50 text-slate-700 hover:bg-stone-100"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/products"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-slate-800"
                >
                  <FiShoppingBag />
                  Browse products
                </Link>

                <Link
                  href={accountHref}
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                >
                  <FiUser />
                  {isAuthenticated ? "Open account" : "Sign in"}
                </Link>
              </div>

              {isAuthenticated && user?.role !== "customer" ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex items-center justify-between rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm font-semibold text-slate-800"
                >
                  <span className="inline-flex items-center gap-2">
                    <FiGrid />
                    Continue to dashboard
                  </span>
                  <FiArrowRight />
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </motion.header>
  );
}
