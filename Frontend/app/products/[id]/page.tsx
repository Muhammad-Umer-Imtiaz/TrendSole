"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiAlertCircle, FiArrowLeft, FiArrowRight, FiShoppingBag } from "react-icons/fi";
import Footer from "@/components/landingPage/Footer";
import Navbar from "@/components/landingPage/Navbar";
import { apiErrorMessage, ordersApi, productApi } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useAuthStore } from "@/store/auth.store";
import type { Product } from "@/lib/types";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [contactPhone, setContactPhone] = useState(user?.phone ?? "");
  const [shippingAddress, setShippingAddress] = useState(user?.address ?? "");
  const [notes, setNotes] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productApi.getById(params.id);

        if (!isMounted) {
          return;
        }

        setProduct(response.product);
        setRelatedProducts(response.relatedProducts);
        setSelectedImage(0);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(apiErrorMessage(requestError));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadProduct();

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const handleOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!product) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      await ordersApi.create({
        items: [
          {
            productId: product.id,
            quantity,
          },
        ],
        contactPhone,
        shippingAddress,
        notes,
      });

      setSuccessMessage("Your order has been placed successfully.");
      setQuantity(1);
      setNotes("");
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-slate-950">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950"
        >
          <FiArrowLeft />
          Back to products
        </Link>

        {loading ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="h-[560px] animate-pulse rounded-[32px] bg-slate-100" />
            <div className="h-[560px] animate-pulse rounded-[32px] bg-slate-100" />
          </div>
        ) : error || !product ? (
          <div className="mt-8 rounded-[28px] border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
            {error ?? "Product not found."}
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[32px] border border-black/8 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
                <div className="relative flex min-h-[460px] items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br from-stone-100 via-white to-stone-200">
                  {product.productImages[selectedImage]?.url ? (
                    <Image
                      src={product.productImages[selectedImage].url}
                      alt={product.productName}
                      fill
                      className="object-contain p-8"
                    />
                  ) : (
                    <div className="text-sm text-slate-400">No image available</div>
                  )}
                </div>

                {product.productImages.length > 1 ? (
                  <div className="mt-4 grid grid-cols-4 gap-3">
                    {product.productImages.map((image, index) => (
                      <button
                        key={image.publicId || image.url}
                        type="button"
                        onClick={() => setSelectedImage(index)}
                        className={`relative h-24 overflow-hidden rounded-2xl border ${
                          selectedImage === index
                            ? "border-slate-950"
                            : "border-slate-200"
                        }`}
                      >
                        <Image
                          src={image.url}
                          alt={`${product.productName} ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="space-y-6">
                <div className="rounded-[32px] border border-black/8 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                    {product.productCategory}
                  </p>
                  <h1 className="mt-3 text-4xl font-semibold text-slate-950">
                    {product.productName}
                  </h1>
                  <p className="mt-4 text-base leading-8 text-slate-500">
                    {product.productDescription}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                      {formatCurrency(product.productPrice)}
                    </span>
                    <span
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        product.stock > 0
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {product.stock > 0
                        ? `${product.stock} units available`
                        : "Currently out of stock"}
                    </span>
                  </div>
                </div>

                <div className="rounded-[32px] border border-black/8 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <FiShoppingBag />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-950">
                        Place your order
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Direct checkout for signed-in customer accounts.
                      </p>
                    </div>
                  </div>

                  {!isAuthenticated ? (
                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                      Sign in first to place an order for this product.
                      <div className="mt-3">
                        <Link
                          href={`/login?next=${encodeURIComponent(`/products/${product.id}`)}`}
                          className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 font-semibold text-white"
                        >
                          Sign in to order
                          <FiArrowRight />
                        </Link>
                      </div>
                    </div>
                  ) : user?.role !== "customer" ? (
                    <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-700">
                      This checkout flow is reserved for customer accounts. Your
                      current role can still browse the storefront and manage
                      operations from the dashboard.
                    </div>
                  ) : (
                    <form onSubmit={handleOrder} className="mt-6 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={Math.max(1, product.stock)}
                            value={quantity}
                            onChange={(event) =>
                              setQuantity(
                                Math.min(
                                  Math.max(1, Number(event.target.value) || 1),
                                  Math.max(1, product.stock)
                                )
                              )
                            }
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Contact phone
                          </label>
                          <input
                            type="tel"
                            value={contactPhone}
                            onChange={(event) => setContactPhone(event.target.value)}
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Shipping address
                        </label>
                        <textarea
                          value={shippingAddress}
                          onChange={(event) => setShippingAddress(event.target.value)}
                          rows={4}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Order notes
                        </label>
                        <textarea
                          value={notes}
                          onChange={(event) => setNotes(event.target.value)}
                          rows={3}
                          placeholder="Optional delivery notes"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm outline-none"
                        />
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                        Estimated total:{" "}
                        <span className="font-semibold text-slate-950">
                          {formatCurrency(product.productPrice * quantity)}
                        </span>
                      </div>

                      {(error || successMessage) && (
                        <div
                          className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ${
                            error
                              ? "border border-red-200 bg-red-50 text-red-700"
                              : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          <FiAlertCircle className="mt-0.5 shrink-0" />
                          <p>{error ?? successMessage}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={saving || product.stock <= 0}
                        className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? "Placing order..." : "Place order"}
                        {!saving && <FiArrowRight />}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {relatedProducts.length > 0 ? (
              <div className="mt-10 rounded-[32px] border border-black/8 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                      Similar picks
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                      More from this category
                    </h2>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {relatedProducts.map((item) => (
                    <Link
                      key={item.id}
                      href={`/products/${item.id}`}
                      className="overflow-hidden rounded-[24px] border border-slate-200 transition-transform hover:-translate-y-1"
                    >
                      <div className="relative h-48 bg-gradient-to-br from-stone-100 via-white to-stone-200">
                        {item.productImages[0]?.url ? (
                          <Image
                            src={item.productImages[0].url}
                            alt={item.productName}
                            fill
                            className="object-contain p-4"
                          />
                        ) : null}
                      </div>
                      <div className="p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          {item.productCategory}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-950">
                          {item.productName}
                        </h3>
                        <p className="mt-3 text-sm font-semibold text-slate-800">
                          {formatCurrency(item.productPrice)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}
