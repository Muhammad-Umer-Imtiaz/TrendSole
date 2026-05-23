"use client";

import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
} from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="mt-20 bg-black text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.14em]">
            TREND SOLE
          </h2>

          <p className="mt-4 text-sm leading-7 text-gray-400">
            Engineered for elite performance and street-inspired style with a
            clean luxury finish.
          </p>

          <div className="mt-6 flex gap-4 text-lg">
            <FaFacebookF />
            <FaInstagram />
            <FaXTwitter />
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold tracking-[0.24em] text-white/80">SHOP</h3>

          <ul className="space-y-3 text-gray-400 text-sm">
            <li>New Arrivals</li>
            <li>Best Sellers</li>
            <li>Limited Edition</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold tracking-[0.24em] text-white/80">SUPPORT</h3>

          <ul className="space-y-3 text-gray-400 text-sm">
            <li>Discord</li>
            <li>Shipping Info</li>
            <li>Contact Us</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold tracking-[0.24em] text-white/80">COMPANY</h3>

          <ul className="space-y-3 text-gray-400 text-sm">
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
            <li>Our Story</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} TrendSole. Engineered for elite performance.
      </div>
    </footer>
  );
}
