"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiGrid, FiHeart, FiSearch, FiUser } from "react-icons/fi";
import { useAuthStore } from "@/store/auth.store";

const links = [
  { label: "Home", href: "/#home" },
  { label: "Shop", href: "/products" },
  { label: "Categories", href: "/#categories" },
  { label: "Reviews", href: "/#testimonials" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();

    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }

    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const accountHref = !isAuthenticated
    ? "/login"
    : user?.role === "customer"
      ? "/account"
      : "/dashboard";

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 w-full border-b border-black/8 bg-[#f5f3ee]/95 backdrop-blur"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-4 md:gap-10">
          <Link href="/#home" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
              TS
            </div>

            <div className="hidden sm:block">
              <p className="font-[family-name:var(--font-display)] text-lg font-semibold uppercase tracking-[0.16em]">
                Trend Sole
              </p>
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                Elevated Sneakers
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 text-sm text-stone-600 md:flex">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="transition-colors duration-300 hover:text-black"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          className="hidden w-[340px] items-center rounded-full border border-black/10 bg-white px-4 py-2.5 md:flex"
        >
          <FiSearch className="text-stone-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search sneakers..."
            className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
          />
        </form>

        <div className="flex items-center gap-2 text-lg">
          <Link
            href="/products"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white transition-colors duration-200 hover:bg-black hover:text-white"
            aria-label="Browse products"
          >
            <FiHeart />
          </Link>

          {isAuthenticated && user?.role !== "customer" ? (
            <Link
              href="/dashboard"
              className="hidden items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-black hover:text-white sm:inline-flex"
            >
              <FiGrid className="text-base" />
              Dashboard
            </Link>
          ) : null}

          <Link
            href={accountHref}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-black text-white transition-opacity duration-200 hover:opacity-85"
            aria-label={isAuthenticated ? "Open account" : "Sign in"}
          >
            <FiUser />
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
