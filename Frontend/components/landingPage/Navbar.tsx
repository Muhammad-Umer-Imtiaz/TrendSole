"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  FiGrid,
  FiMenu,
  FiShoppingBag,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useAuthStore } from "@/store/auth.store";
import Image from "next/image";

const links = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/products" },
  { label: "New", href: "/#new-arrivals" },
  { label: "Best Seller", href: "/#best-sellers" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const accountHref = !isAuthenticated
    ? "/login"
    : user?.role === "customer"
      ? "/account"
      : "/dashboard";

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-lg"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
         <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl">
  <Image
    src="/Logo.png"
    alt="TrendSole Logo"
    width={44}
    height={44}
    className="object-cover"
  />
</div>
          <div>
            <h2 className="text-lg font-bold tracking-wide text-black">
              TrendSole
            </h2>
            <p className="text-xs text-zinc-500">
              Premium Sneakers
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" &&
                pathname.startsWith(link.href));

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative text-sm font-medium transition ${
                  active
                    ? "text-black"
                    : "text-zinc-500 hover:text-black"
                }`}
              >
                {link.label}

                {active && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-black"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          
          {isAuthenticated && user?.role !== "customer" && (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white"
            >
              <FiGrid />
              Dashboard
            </Link>
          )}

          <Link
            href="/products"
            className="flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-black transition hover:bg-black hover:text-white"
          >
            <FiShoppingBag />
            Shop
          </Link>

          <Link
            href={accountHref}
            className="flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            <FiUser />
            {isAuthenticated ? "Account" : "Sign In"}
          </Link>
        </div>

        {/* Mobile Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-300 lg:hidden"
        >
          {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-zinc-200 bg-white px-4 py-5 lg:hidden"
        >
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full border border-zinc-300 px-4 py-3 text-sm font-medium"
            >
              <FiShoppingBag />
              Shop
            </Link>

            <Link
              href={accountHref}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-medium text-white"
            >
              <FiUser />
              {isAuthenticated ? "Account" : "Sign In"}
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}