"use client";

import Link from "next/link";
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";

const footerLinks = {
  Shop: [
    { label: "All products", href: "/products" },
    { label: "Featured", href: "/#featured" },
    { label: "New arrivals", href: "/#new-arrivals" },
    { label: "Best sellers", href: "/#best-sellers" },
  ],
  Support: [
    { label: "My account", href: "/account" },
    { label: "Sign in", href: "/login" },
    { label: "Reset password", href: "/forgot-password" },
  ],
};

export default function Footer() {
  return (
    <footer
      id="contact"
      className="mt-20 border-t border-[color:var(--border)] bg-[rgba(255,255,255,0.52)]"
    >
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.7fr_0.7fr]">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950">
              Trend Sole
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-600">
              Modern sneakers, clear product browsing, and a storefront designed
              to feel easy from the first visit to the final order.
            </p>

            <div className="mt-6 flex items-center gap-3 text-slate-600">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(74,96,105,0.1)] bg-white">
                <FaFacebookF />
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(74,96,105,0.1)] bg-white">
                <FaInstagram />
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(74,96,105,0.1)] bg-white">
                <FaXTwitter />
              </span>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <p className="section-kicker">{title}</p>
              <div className="mt-4 grid gap-3">
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-slate-600 transition-colors hover:text-slate-950"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[rgba(74,96,105,0.08)] pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Trend Sole. Built for clear browsing and calm shopping.</p>
          <p>Soft contrast, simpler structure, and product-first design.</p>
        </div>
      </div>
    </footer>
  );
}
