"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiPackage,
  FiShoppingBag,
  FiTruck,
} from "react-icons/fi";
import Footer from "@/components/landingPage/Footer";
import Navbar from "@/components/landingPage/Navbar";
import Modal from "@/components/ui/Modal";
import ProductShowcaseCard from "@/components/ui/ProductShowcaseCard";
import { apiErrorMessage, ordersApi, productApi } from "@/lib/api";
import { formatCurrency, getDiscountedPrice } from "@/lib/format";
import { useAuthStore } from "@/store/auth.store";
import type { Product } from "@/lib/types";

const getMatchingVariant = (product: Product | null, color: string | null) => {
  if (!product || !color) {
    return null;
  }

  return (
    product.colorVariants.find(
      (variant) => variant.color.toLowerCase() === color.toLowerCase()
    ) ?? null
  );
};

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
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
        setSelectedColor(response.product.colors[0] ?? null);
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

  const availableColors = product?.colors ?? [];
  const effectiveUnitPrice = product
    ? getDiscountedPrice(product.productPrice, product.discountPercentage)
    : 0;
  const matchingVariant = getMatchingVariant(product, selectedColor);
  const hasVariantInventory = (product?.colorVariants.length ?? 0) > 0;
  const availableUnits = hasVariantInventory
    ? matchingVariant?.stock ?? 0
    : product?.stock ?? 0;
  const canPlaceOrder = Boolean(product && product.stock > 0);
  const colorSelectionRequired = availableColors.length > 0;
  const orderTotal = effectiveUnitPrice * quantity;

  const resetOrderForm = () => {
    setQuantity(1);
    setNotes("");
    setError(null);
    setSuccessMessage(null);
    setContactPhone(user?.phone ?? "");
    setShippingAddress(user?.address ?? "");
    setSelectedColor(product?.colors[0] ?? null);
  };

  const openOrderModal = () => {
    if (!product) {
      return;
    }

    resetOrderForm();
    setOrderModalOpen(true);
  };

  const closeOrderModal = () => {
    setOrderModalOpen(false);
    setSaving(false);
  };

  const handleOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!product) {
      return;
    }

    if (colorSelectionRequired && !selectedColor) {
      setError("Choose a color before placing your order.");
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
            selectedColor: selectedColor ?? undefined,
            quantity,
          },
        ],
        contactPhone,
        shippingAddress,
        notes,
      });

      setSuccessMessage("Your order has been placed successfully.");
      setProduct((currentProduct) => {
        if (!currentProduct) {
          return currentProduct;
        }

        if (hasVariantInventory && selectedColor) {
          const nextVariants = currentProduct.colorVariants.map((variant) =>
            variant.color.toLowerCase() === selectedColor.toLowerCase()
              ? { ...variant, stock: Math.max(0, variant.stock - quantity) }
              : variant
          );

          return {
            ...currentProduct,
            colorVariants: nextVariants,
            colors: nextVariants.map((variant) => variant.color),
            stock: Math.max(0, currentProduct.stock - quantity),
          };
        }

        return {
          ...currentProduct,
          stock: Math.max(0, currentProduct.stock - quantity),
        };
      });
      setQuantity(1);
      setNotes("");
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="app-shell min-h-screen text-slate-950">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <Link
          href="/products"
          className="button-secondary inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors"
        >
          <FiArrowLeft />
          Back to products
        </Link>

        {loading ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="h-[560px] animate-pulse rounded-[32px] bg-[rgba(228,239,234,0.6)]" />
            <div className="h-[560px] animate-pulse rounded-[32px] bg-[rgba(228,239,234,0.6)]" />
          </div>
        ) : error || !product ? (
          <div className="mt-8 rounded-[28px] border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
            {error ?? "Product not found."}
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="soft-card rounded-[32px] p-5">
                <div className="relative flex min-h-[460px] items-center justify-center overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top,_rgba(215,228,221,0.88),_transparent_42%),linear-gradient(135deg,#fbfaf7_0%,#edf3f0_100%)]">
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
                        className={`relative h-24 overflow-hidden rounded-2xl border transition-colors ${
                          selectedImage === index
                            ? "border-[rgba(95,132,121,0.45)] bg-[rgba(228,239,234,0.6)]"
                            : "border-[rgba(74,96,105,0.1)] bg-white/75"
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
                <div className="soft-card rounded-[32px] p-8">
                  <p className="section-kicker">
                    {product.productCategory}
                  </p>
                  <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-[-0.03em] text-slate-950">
                    {product.productName}
                  </h1>
                  <p className="mt-4 text-base leading-8 text-slate-500">
                    {product.productDescription}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-[rgba(228,239,234,0.95)] px-4 py-2 text-sm font-semibold text-slate-900">
                      {formatCurrency(effectiveUnitPrice)}
                    </span>
                    {effectiveUnitPrice < product.productPrice ? (
                      <span className="rounded-full bg-[rgba(248,246,242,0.95)] px-4 py-2 text-sm font-semibold text-slate-500 line-through">
                        {formatCurrency(product.productPrice)}
                      </span>
                    ) : null}
                    {product.offerLabel ? (
                      <span className="rounded-full bg-[rgba(242,226,189,0.82)] px-4 py-2 text-sm font-semibold text-slate-950">
                        {product.offerLabel}
                      </span>
                    ) : null}
                    <span
                      className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                        product.stock > 0
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      }`}
                    >
                      {product.stock > 0
                        ? `${product.stock} units available`
                        : "Currently out of stock"}
                    </span>
                    <span className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700">
                      {hasVariantInventory
                        ? `${product.colorVariants.length} tracked colors`
                        : availableColors.length > 0
                          ? `${availableColors.length} selectable colors`
                          : "Single inventory pool"}
                    </span>
                  </div>

                  {availableColors.length > 0 ? (
                    <div className="mt-8">
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-slate-900">
                          Choose a color
                        </p>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          {selectedColor
                            ? hasVariantInventory
                              ? `${availableUnits} units in ${selectedColor}`
                              : `${product.stock} shared units available`
                            : "Select a color"}
                        </p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3">
                        {availableColors.map((color) => {
                          const variant = getMatchingVariant(product, color);
                          const isSelected = selectedColor === color;
                          const variantStock = variant?.stock ?? product.stock;
                          const isSoldOut = hasVariantInventory && variantStock <= 0;

                          return (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setSelectedColor(color)}
                              className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                                isSelected
                                  ? "border-[rgba(95,132,121,0.45)] bg-[rgba(228,239,234,0.95)] text-slate-900"
                                  : "border-[rgba(74,96,105,0.1)] bg-white/78 text-slate-700 hover:border-[rgba(95,132,121,0.35)]"
                              }`}
                            >
                              <p className="text-sm font-semibold">{color}</p>
                              <p
                                className={`mt-1 text-xs ${
                                  isSelected ? "text-slate-600" : "text-slate-500"
                                }`}
                              >
                                {hasVariantInventory
                                  ? isSoldOut
                                    ? "Out of stock"
                                    : `${variantStock} units`
                                  : "Uses shared stock"}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="overflow-hidden rounded-[32px] border border-[rgba(74,96,105,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(238,244,241,0.9)_100%)] text-slate-900 shadow-[0_24px_70px_rgba(84,101,111,0.08)]">
                  <div className="grid gap-6 p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="section-kicker">
                          Ready to order
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold text-slate-950">
                          Checkout this pair directly
                        </h2>
                        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                          Select your preferred color, confirm delivery details, and place the order from a focused checkout form.
                        </p>
                      </div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[rgba(228,239,234,0.95)] text-slate-800">
                        <FiShoppingBag className="text-xl" />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[24px] border border-[rgba(74,96,105,0.1)] bg-white/75 p-4">
                        <FiPackage className="text-lg text-slate-700" />
                        <p className="mt-4 text-sm font-semibold">Inventory aware</p>
                        <p className="mt-2 text-xs leading-6 text-slate-600">
                          Orders respect the stock available for the selected color.
                        </p>
                      </div>
                      <div className="rounded-[24px] border border-[rgba(74,96,105,0.1)] bg-white/75 p-4">
                        <FiTruck className="text-lg text-slate-700" />
                        <p className="mt-4 text-sm font-semibold">Fast fulfillment</p>
                        <p className="mt-2 text-xs leading-6 text-slate-600">
                          Shipping details are collected in one clean confirmation step.
                        </p>
                      </div>
                      <div className="rounded-[24px] border border-[rgba(74,96,105,0.1)] bg-white/75 p-4">
                        <FiCheckCircle className="text-lg text-slate-700" />
                        <p className="mt-4 text-sm font-semibold">Tracked selection</p>
                        <p className="mt-2 text-xs leading-6 text-slate-600">
                          The chosen color is now saved with each order for operations visibility.
                        </p>
                      </div>
                    </div>

                    {!isAuthenticated ? (
                      <div className="rounded-[24px] border border-[rgba(74,96,105,0.1)] bg-white/75 p-5 text-sm text-slate-600">
                        Sign in with a customer account to place this order.
                        <div className="mt-4">
                          <Link
                            href={`/login?next=${encodeURIComponent(`/products/${product.id}`)}`}
                            className="button-primary inline-flex items-center gap-2 rounded-full px-4 py-2.5 font-semibold"
                          >
                            Sign in to order
                            <FiArrowRight />
                          </Link>
                        </div>
                      </div>
                    ) : user?.role !== "customer" ? (
                      <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                        This checkout flow is reserved for customer accounts. Staff can still browse products here and manage catalog or order operations from the dashboard.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 rounded-[24px] border border-[rgba(74,96,105,0.1)] bg-white/75 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold">
                            {selectedColor
                              ? `Ordering ${product.productName} in ${selectedColor}`
                              : `Ordering ${product.productName}`}
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                            {hasVariantInventory && selectedColor
                              ? `${availableUnits} units currently available`
                              : `${product.stock} units in stock`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={openOrderModal}
                          disabled={!canPlaceOrder}
                          className="button-primary inline-flex h-14 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Place order
                          <FiArrowRight />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {relatedProducts.length > 0 ? (
              <div className="soft-card mt-10 rounded-[32px] p-8">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="section-kicker">
                      Similar picks
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                      More from this category
                    </h2>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  {relatedProducts.map((item) => (
                    <ProductShowcaseCard key={item.id} product={item} compact />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>

      <Footer />

      <Modal
        open={orderModalOpen}
        onClose={closeOrderModal}
        title="Complete your order"
        description="Confirm the color, quantity, and delivery details for this purchase."
      >
        {product ? (
          <form onSubmit={handleOrder} className="space-y-5">
            <div className="rounded-[26px] border border-[rgba(74,96,105,0.1)] bg-[rgba(248,246,242,0.88)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Product
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                    {product.productName}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {formatCurrency(effectiveUnitPrice)} per unit
                  </p>
                </div>
                <div className="rounded-full border border-[rgba(74,96,105,0.1)] bg-white px-4 py-2 text-xs font-semibold text-slate-600">
                  {product.stock} total units
                </div>
              </div>
            </div>

            {availableColors.length > 0 ? (
              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-700">
                  Color
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {availableColors.map((color) => {
                    const variant = getMatchingVariant(product, color);
                    const colorStock = hasVariantInventory
                      ? variant?.stock ?? 0
                      : product.stock;
                    const isSelected = selectedColor === color;

                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`rounded-[22px] border px-4 py-4 text-left transition-colors ${
                          isSelected
                            ? "border-[rgba(95,132,121,0.45)] bg-[rgba(228,239,234,0.95)] text-slate-900"
                            : "border-[rgba(74,96,105,0.1)] bg-white text-slate-700 hover:border-[rgba(95,132,121,0.35)]"
                        }`}
                      >
                        <p className="text-sm font-semibold">{color}</p>
                        <p
                          className={`mt-2 text-xs ${
                            isSelected ? "text-slate-600" : "text-slate-500"
                          }`}
                        >
                          {hasVariantInventory
                            ? `${colorStock} units available`
                            : "Uses shared stock"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(1, availableUnits)}
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(
                      Math.min(
                        Math.max(1, Number(event.target.value) || 1),
                        Math.max(1, availableUnits)
                      )
                    )
                  }
                  className="input-surface h-12 w-full rounded-2xl px-4 text-sm outline-none"
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
                  placeholder="+92 300 1234567"
                  className="input-surface h-12 w-full rounded-2xl px-4 text-sm outline-none"
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
                placeholder="House number, street, area, city"
                className="input-surface w-full rounded-2xl px-4 py-4 text-sm outline-none"
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
                className="input-surface w-full rounded-2xl px-4 py-4 text-sm outline-none"
              />
            </div>

            <div className="rounded-2xl border border-[rgba(74,96,105,0.1)] bg-[rgba(248,246,242,0.88)] px-4 py-4 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-4">
                <span>Estimated total</span>
                <span className="text-lg font-semibold text-slate-950">
                  {formatCurrency(orderTotal)}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {selectedColor
                  ? `Selected color: ${selectedColor}`
                  : "Choose a color to finish checkout."}
              </p>
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

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeOrderModal}
                className="button-secondary rounded-full px-5 py-3 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  saving ||
                  product.stock <= 0 ||
                  (colorSelectionRequired && !selectedColor) ||
                  (hasVariantInventory && availableUnits <= 0)
                }
                className="button-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Placing order..." : "Confirm order"}
                {!saving && <FiArrowRight />}
              </button>
            </div>
          </form>
        ) : null}
      </Modal>
    </main>
  );
}
