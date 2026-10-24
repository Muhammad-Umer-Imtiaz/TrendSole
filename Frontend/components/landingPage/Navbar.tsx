"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiGrid, FiMenu, FiShoppingBag, FiUser, FiX } from "react-icons/fi";
import { useAuthStore } from "@/store/auth.store";

const links = [
  { label: "Home", href: "/#home" },
  { label: "Featured", href: "/#featured" },
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
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [mobileOpen, setMobileOpen] = useState(false);

  const accountHref = !isAuthenticated
    ? "/login"
    : user?.role === "customer"
      ? "/account"
      : "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--border)] bg-[rgba(253,252,249,0.82)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/#home" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[rgba(74,96,105,0.12)] bg-white text-sm font-semibold text-slate-900 shadow-[0_10px_24px_rgba(84,101,111,0.08)]">
            TS
          </div>
          <div>
            <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
              Trend Sole
            </p>
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
              Clean sneaker storefront
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((link) => {
            const active = isActiveLink(pathname, link.href);

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  active ? "text-slate-950" : "text-slate-600 hover:text-slate-950"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated && user?.role !== "customer" ? (
            <Link
              href="/dashboard"
              className="button-secondary inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold"
            >
              <FiGrid />
              Dashboard
            </Link>
          ) : null}

          <Link
            href="/products"
            className="button-secondary inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold"
          >
            <FiShoppingBag />
            Products
          </Link>

          <Link
            href={accountHref}
            className="button-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            <FiUser />
            {isAuthenticated ? "Account" : "Sign in"}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((current) => !current)}
          className="button-secondary inline-flex h-11 w-11 items-center justify-center rounded-2xl lg:hidden"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {mobileOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-[rgba(74,96,105,0.08)] bg-[rgba(255,255,255,0.95)] px-6 py-4 lg:hidden">
          <div className="grid gap-2">
            {links.map((link) => {
              const active = isActiveLink(pathname, link.href);

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[rgba(228,239,234,0.95)] text-slate-950"
                      : "text-slate-600 hover:bg-[rgba(248,246,242,0.95)] hover:text-slate-950"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="button-secondary inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold"
            >
              <FiShoppingBag />
              Browse products
            </Link>

            <Link
              href={accountHref}
              onClick={() => setMobileOpen(false)}
              className="button-primary inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold"
            >
              <FiUser />
              {isAuthenticated ? "Open account" : "Sign in"}
            </Link>
          </div>

          {isAuthenticated && user?.role !== "customer" ? (
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="button-secondary mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold"
            >
              <FiGrid />
              Continue to dashboard
            </Link>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
