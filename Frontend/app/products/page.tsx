"use client";

import { Suspense, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FiFilter, FiSearch, FiSliders, FiX } from "react-icons/fi";
import Footer from "@/components/landingPage/Footer";
import Navbar from "@/components/landingPage/Navbar";
import PaginationControls from "@/components/ui/PaginationControls";
import ProductShowcaseCard from "@/components/ui/ProductShowcaseCard";
import { apiErrorMessage, categoriesApi, productApi } from "@/lib/api";
import type { Category, PaginationMeta, Product } from "@/lib/types";

const DEFAULT_PAGINATION: PaginationMeta = {
  page: 1,
  limit: 9,
  total: 0,
  totalPages: 1,
};

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("search") ?? "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const deferredSearch = useDeferredValue(searchTerm);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const response = await categoriesApi.list();

        if (!isMounted) {
          return;
        }

        setCategories(response.filter((category) => category.isActive));
      } catch {
        // Keep category filters optional if the request fails.
      }
    };

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await productApi.listPaginated({
          page,
          limit: 9,
          search: deferredSearch,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
          category: selectedCategories,
        });

        if (!isMounted) {
          return;
        }

        setProducts(response.items);
        setPagination(response.pagination);
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

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, [deferredSearch, maxPrice, minPrice, page, selectedCategories]);

  const activeFilterCount = useMemo(
    () =>
      selectedCategories.length +
      (minPrice ? 1 : 0) +
      (maxPrice ? 1 : 0) +
      (searchTerm.trim() ? 1 : 0),
    [maxPrice, minPrice, searchTerm, selectedCategories.length]
  );

  const toggleCategory = (categoryName: string) => {
    setPage(1);
    setSelectedCategories((current) =>
      current.includes(categoryName)
        ? current.filter((item) => item !== categoryName)
        : [...current, categoryName]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  return (
    <main className="app-shell min-h-screen text-slate-950">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="soft-panel rounded-[36px] px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-kicker">Product Catalog</p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold text-slate-950 sm:text-5xl">
                Find your next pair in a cleaner browsing experience.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                Search the catalog, narrow by category, and filter by price in a simpler layout designed to keep product exploration easy on the eyes.
              </p>
            </div>

            <div className="grid gap-3 rounded-[28px] border border-[rgba(74,96,105,0.1)] bg-[rgba(248,246,242,0.88)] px-5 py-4 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                <p className="font-semibold text-slate-950">{pagination.total}</p>
                <p>Products found</p>
              </div>
              <div>
                <p className="font-semibold text-slate-950">{activeFilterCount}</p>
                <p>Active filters</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="grid gap-8 lg:grid-cols-[310px_1fr]">
          <aside className="soft-card h-fit rounded-[32px] p-6 lg:sticky lg:top-28">
            <div className="flex items-center justify-between">
              <div>
                <p className="section-kicker">Filters</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Refine your selection
                </h2>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(228,239,234,0.95)] text-slate-800">
                <FiSliders />
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Search
                </label>
                <div className="input-surface flex items-center rounded-2xl px-4">
                  <FiSearch className="text-slate-400" />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search sneakers, colors, or categories"
                    className="h-12 w-full bg-transparent pl-3 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-slate-700">
                  Price range
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(event) => {
                      setMinPrice(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Minimum PKR"
                    className="input-surface h-12 rounded-2xl px-4 text-sm outline-none"
                  />
                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(event) => {
                      setMaxPrice(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Maximum PKR"
                    className="input-surface h-12 rounded-2xl px-4 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-slate-700">
                  Categories
                </p>
                <div className="space-y-3">
                  {categories.map((category) => {
                    const isSelected = selectedCategories.includes(category.name);

                    return (
                      <label
                        key={category.id}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-colors ${
                          isSelected
                            ? "border-[rgba(95,132,121,0.35)] bg-[rgba(228,239,234,0.68)] text-slate-900"
                            : "border-[rgba(74,96,105,0.1)] bg-white/78 text-slate-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCategory(category.name)}
                          className="h-4 w-4 rounded border-slate-300"
                        />
                        <span className="flex-1">{category.name}</span>
                        <span className="text-xs text-slate-400">
                          {category.productCount}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="button-secondary inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors"
              >
                <FiFilter />
                Clear filters
              </button>
            </div>
          </aside>

          <div className="space-y-5">
            {(searchTerm || selectedCategories.length > 0 || minPrice || maxPrice) && (
              <div className="soft-card rounded-[28px] p-5">
                <div className="flex flex-wrap gap-2">
                  {searchTerm ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(74,96,105,0.1)] bg-white/92 px-3 py-2 text-xs font-semibold text-slate-700">
                      Search: {searchTerm}
                    </span>
                  ) : null}
                  {selectedCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className="inline-flex items-center gap-2 rounded-full border border-[rgba(74,96,105,0.1)] bg-white/92 px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      {category}
                      <FiX />
                    </button>
                  ))}
                  {minPrice ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(74,96,105,0.1)] bg-white/92 px-3 py-2 text-xs font-semibold text-slate-700">
                      Min PKR {minPrice}
                    </span>
                  ) : null}
                  {maxPrice ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(74,96,105,0.1)] bg-white/92 px-3 py-2 text-xs font-semibold text-slate-700">
                      Max PKR {maxPrice}
                    </span>
                  ) : null}
                </div>
              </div>
            )}

            <div className="soft-card rounded-[32px] p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="section-kicker">Collection View</p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                    Product results
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                    Every result card is simplified to highlight the product, key details, and next action without unnecessary motion or heavy contrast.
                  </p>
                </div>

                <div className="rounded-2xl border border-[rgba(74,96,105,0.1)] bg-[rgba(248,246,242,0.88)] px-4 py-3 text-sm text-slate-500">
                  {pagination.total} products found
                  {activeFilterCount > 0 ? ` • ${activeFilterCount} active filters` : ""}
                </div>
              </div>

              {error ? (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {loading ? (
                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[420px] animate-pulse rounded-[30px] bg-[rgba(228,239,234,0.6)]"
                    />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="mt-6 rounded-[28px] border border-dashed border-[rgba(74,96,105,0.2)] bg-[rgba(255,255,255,0.7)] px-6 py-12 text-center text-sm text-slate-500">
                  No products match your current filters.
                </div>
              ) : (
                <>
                  <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {products.map((product, index) => (
                      <ProductShowcaseCard
                        key={product.id}
                        product={product}
                        index={index}
                        compact
                      />
                    ))}
                  </div>

                  <PaginationControls
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    total={pagination.total}
                    label="products"
                    onPageChange={setPage}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function ProductsPage() {
  return (
    // URL search parameters are available after hydration on this static route.
    <Suspense
      fallback={
        <main className="app-shell min-h-screen text-slate-950">
          <Navbar />
          <div role="status" className="mx-auto max-w-7xl px-6 py-8">
            <div className="soft-panel rounded-3xl px-8 py-6 text-sm text-slate-500">
              Loading products...
            </div>
          </div>
          <Footer />
        </main>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
