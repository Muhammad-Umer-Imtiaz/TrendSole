"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { FiFilter, FiSearch, FiSliders } from "react-icons/fi";
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
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
    <main className="min-h-screen bg-[#f5f3ee] text-slate-950">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside className="h-fit rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Filters
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-950">
                  Refine the catalog
                </h1>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <FiSliders />
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Search
                </label>
                <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4">
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
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
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
                    className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-semibold text-slate-700">
                  Categories
                </p>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.name)}
                        onChange={() => toggleCategory(category.name)}
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      <span className="flex-1">{category.name}</span>
                      <span className="text-xs text-slate-400">
                        {category.productCount}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950"
              >
                <FiFilter />
                Clear filters
              </button>
            </div>
          </aside>

          <div>
            <div className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                    Product Catalog
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                    Find your next pair
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                    Search the catalog, narrow by category, and filter by price
                    range with live data from the backend.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
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
                <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[360px] animate-pulse rounded-[24px] bg-slate-100"
                    />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="mt-8 rounded-[24px] border border-dashed border-slate-300 px-6 py-14 text-center text-sm text-slate-500">
                  No products match the current filters. Try widening the search
                  or clearing one of the category or price constraints.
                </div>
              ) : (
                <>
                  <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {products.map((product) => (
                      <ProductShowcaseCard
                        key={product.id}
                        product={product}
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
