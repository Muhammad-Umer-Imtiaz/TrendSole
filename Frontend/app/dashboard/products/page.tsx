"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  FiEdit2,
  FiPlus,
  FiStar,
  FiTag,
  FiTrash2,
  FiX,
  FiZap,
} from "react-icons/fi";
import AuthGuard from "@/components/auth/AuthGuard";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/ui/StatusBadge";
import Table, { type TableColumn } from "@/components/ui/Table";
import { apiErrorMessage, categoriesApi, productApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { hasPermission } from "@/lib/permissions";
import { useAuthStore } from "@/store/auth.store";
import type { Category, Product, ProductFormValues } from "@/lib/types";

const emptyProductForm: ProductFormValues = {
  productName: "",
  productPrice: "",
  productCost: "",
  productDescription: "",
  productCategory: "",
  colors: [],
  colorVariants: [],
  stock: "",
  discountPercentage: "0",
  offerLabel: "",
  isActive: true,
  isFeatured: false,
  isNewArrival: false,
  isBestSeller: false,
};

export default function ProductsPage() {
  const permissions = useAuthStore((state) => state.permissions);
  const canCreate = hasPermission(permissions, "products:create");
  const canUpdate = hasPermission(permissions, "products:update");
  const canDelete = hasPermission(permissions, "products:delete");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formValues, setFormValues] = useState<ProductFormValues>(emptyProductForm);
  const [files, setFiles] = useState<File[]>([]);
  const [colorInput, setColorInput] = useState("");
  const [variantColorInput, setVariantColorInput] = useState("");
  const [variantStockInput, setVariantStockInput] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productApi.list({ includeInactive: true });
      setProducts(response);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await productApi.list({ includeInactive: true });

        if (!isMounted) {
          return;
        }

        setProducts(response);
        const categoryResponse = await categoriesApi.list({ includeInactive: true });

        if (!isMounted) {
          return;
        }

        setCategories(categoryResponse.filter((category) => category.isActive));
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

    void loadInitialProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const filePreviews = useMemo(
    () =>
      files.map((file) => ({
        id: `${file.name}-${file.lastModified}-${file.size}`,
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [files]
  );

  useEffect(() => {
    return () => {
      filePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [filePreviews]);

  const resetModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setFormValues(emptyProductForm);
    setFiles([]);
    setColorInput("");
    setVariantColorInput("");
    setVariantStockInput("");
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormValues(emptyProductForm);
    setFiles([]);
    setColorInput("");
    setVariantColorInput("");
    setVariantStockInput("");
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormValues({
      productName: product.productName,
      productPrice: String(product.productPrice),
      productCost: String(product.productCost),
      productDescription: product.productDescription,
      productCategory: product.productCategory,
      colors: product.colors,
      colorVariants: product.colorVariants,
      stock: String(product.stock),
      discountPercentage: String(product.discountPercentage ?? 0),
      offerLabel: product.offerLabel ?? "",
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isNewArrival: product.isNewArrival,
      isBestSeller: product.isBestSeller,
    });
    setFiles([]);
    setColorInput("");
    setVariantColorInput("");
    setVariantStockInput("");
    setModalOpen(true);
  };

  const removeSelectedFile = (targetId: string) => {
    setFiles((current) =>
      current.filter(
        (file) =>
          `${file.name}-${file.lastModified}-${file.size}` !== targetId
      )
    );
  };

  const addColor = () => {
    const normalizedColor = colorInput.trim();

    if (!normalizedColor) {
      return;
    }

    setFormValues((current) => ({
      ...current,
      colors: current.colors.some(
        (color) => color.toLowerCase() === normalizedColor.toLowerCase()
      )
        ? current.colors
        : [...current.colors, normalizedColor],
    }));
    setColorInput("");
  };

  const removeColor = (targetColor: string) => {
    setFormValues((current) => ({
      ...current,
      colors: current.colors.filter((color) => color !== targetColor),
      colorVariants: current.colorVariants.filter(
        (variant) => variant.color !== targetColor
      ),
    }));
  };

  const addColorVariant = () => {
    const normalizedColor = variantColorInput.trim();
    const parsedStock = Number(variantStockInput);

    if (!normalizedColor || !Number.isFinite(parsedStock) || parsedStock < 0) {
      return;
    }

    setFormValues((current) => {
      const existingIndex = current.colorVariants.findIndex(
        (variant) => variant.color.toLowerCase() === normalizedColor.toLowerCase()
      );
      const nextVariants =
        existingIndex >= 0
          ? current.colorVariants.map((variant, index) =>
              index === existingIndex
                ? { ...variant, color: normalizedColor, stock: parsedStock }
                : variant
            )
          : [...current.colorVariants, { color: normalizedColor, stock: parsedStock }];

      return {
        ...current,
        colors: current.colors.some(
          (color) => color.toLowerCase() === normalizedColor.toLowerCase()
        )
          ? current.colors
          : [...current.colors, normalizedColor],
        colorVariants: nextVariants,
      };
    });

    setVariantColorInput("");
    setVariantStockInput("");
  };

  const updateVariantStock = (targetColor: string, nextStock: string) => {
    const parsedStock = Number(nextStock);

    setFormValues((current) => ({
      ...current,
      colorVariants: current.colorVariants.map((variant) =>
        variant.color === targetColor
          ? {
              ...variant,
              stock:
                Number.isFinite(parsedStock) && parsedStock >= 0 ? parsedStock : 0,
            }
          : variant
      ),
    }));
  };

  const removeColorVariant = (targetColor: string) => {
    setFormValues((current) => ({
      ...current,
      colors: current.colors.filter((color) => color !== targetColor),
      colorVariants: current.colorVariants.filter(
        (variant) => variant.color !== targetColor
      ),
    }));
  };

  const totalVariantStock = formValues.colorVariants.reduce(
    (sum, variant) => sum + variant.stock,
    0
  );
  const effectiveStock =
    formValues.colorVariants.length > 0 ? String(totalVariantStock) : formValues.stock;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, formValues, files);
      } else {
        await productApi.create(formValues, files);
      }

      resetModal();
      await loadProducts();
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      `Delete "${product.productName}" from the catalog?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await productApi.delete(product.id);
      await loadProducts();
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    }
  };

  const baseColumns: TableColumn<Product>[] = [
    {
      key: "product",
      header: "Product",
      render: (product) => (
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-slate-100">
            {product.productImages[0]?.url ? (
              <Image
                src={product.productImages[0].url}
                alt={product.productName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-slate-400">
                No image
              </div>
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-950">{product.productName}</p>
            <p className="mt-1 text-xs text-slate-500">{product.productCategory}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.isFeatured ? (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                  Featured
                </span>
              ) : null}
              {product.isNewArrival ? (
                <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                  New
                </span>
              ) : null}
              {product.isBestSeller ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  Best seller
                </span>
              ) : null}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (product) => formatCurrency(product.productPrice),
    },
    {
      key: "stock",
      header: "Stock",
      render: (product) => (
        <div>
          <p className="font-semibold text-slate-950">{product.stock} units</p>
          <p className="mt-1 text-xs text-slate-500">
            {product.colorVariants.length > 0
              ? `${product.colorVariants.length} color variants tracked`
              : "Shared inventory"}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (product) => (
        <StatusBadge status={product.isActive ? "active" : "inactive"} />
      ),
    },
    {
      key: "updated",
      header: "Updated",
      render: (product) => formatDate(product.updatedAt),
    },
  ];

  const columns: TableColumn<Product>[] =
    !canUpdate && !canDelete
      ? baseColumns
      : [
          ...baseColumns,
          {
            key: "actions",
            header: "Actions",
            render: (product) => (
              <div className="flex gap-2">
                {canUpdate && (
                  <button
                    type="button"
                    onClick={() => openEditModal(product)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950"
                  >
                    <FiEdit2 />
                    Edit
                  </button>
                )}
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDelete(product)}
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <FiTrash2 />
                    Delete
                  </button>
                )}
              </div>
            ),
          },
        ];

  return (
    <AuthGuard requiredPermissions={["products:read"]}>
      <div className="space-y-6">
        <Card
          title="Products"
          description="Manage catalog listings, product details, and stock availability."
          action={
            canCreate ? (
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <FiPlus />
                Add product
              </button>
            ) : null
          }
        >
          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Table
            data={products}
            columns={columns}
            keyExtractor={(product) => product.id}
            isLoading={loading}
            pageSize={8}
            paginationLabel="products"
            emptyMessage="No products have been added yet."
          />
        </Card>

        <Modal
          open={modalOpen}
          onClose={resetModal}
          title={editingProduct ? "Edit product" : "Create product"}
          description="Update the product details shown to your storefront and operations teams."
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Product name</span>
                <input
                  value={formValues.productName}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      productName: event.target.value,
                    }))
                  }
                  placeholder="Air Swift Runner"
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-slate-950"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Category</span>
                <select
                  value={formValues.productCategory}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      productCategory: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-slate-950"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                  {editingProduct &&
                  formValues.productCategory &&
                  !categories.some(
                    (category) => category.name === formValues.productCategory
                  ) ? (
                    <option value={formValues.productCategory}>
                      {formValues.productCategory}
                    </option>
                  ) : null}
                </select>
                {categories.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No active categories are available yet. Create one from the Categories page first.
                  </p>
                ) : null}
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Price</span>
                <input
                  type="number"
                  min="0"
                  value={formValues.productPrice}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      productPrice: event.target.value,
                    }))
                  }
                  placeholder="14999"
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-slate-950"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Unit cost</span>
                <input
                  type="number"
                  min="0"
                  value={formValues.productCost}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      productCost: event.target.value,
                    }))
                  }
                  placeholder="9500"
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-slate-950"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Stock</span>
                <input
                  type="number"
                  min="0"
                  value={effectiveStock}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      stock: event.target.value,
                    }))
                  }
                  disabled={formValues.colorVariants.length > 0}
                  placeholder="24"
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-slate-950 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                />
                <p className="text-xs text-slate-500">
                  {formValues.colorVariants.length > 0
                    ? "Total stock is calculated automatically from your color variants."
                    : "Use shared stock when you do not need per-color inventory yet."}
                </p>
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Discount percentage</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formValues.discountPercentage}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      discountPercentage: event.target.value,
                    }))
                  }
                  placeholder="10"
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-slate-950"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Offer label</span>
                <input
                  value={formValues.offerLabel}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      offerLabel: event.target.value,
                    }))
                  }
                  placeholder="Weekend Deal"
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-slate-950"
                />
              </label>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Available colors</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Add shopper-facing colors customers can choose on the product page.
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700">
                  <FiTag />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  value={colorInput}
                  onChange={(event) => setColorInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addColor();
                    }
                  }}
                  placeholder="Type a color and press Enter"
                  className="h-12 flex-1 rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-slate-950"
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950"
                >
                  Add color
                </button>
              </div>

              {formValues.colors.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {formValues.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => removeColor(color)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      <span>{color}</span>
                      <FiX className="text-sm" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-xs text-slate-500">
                  No colors added yet.
                </p>
              )}
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Inventory by color</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Track stock for each color so customers can only order what is truly available.
                  </p>
                </div>
                <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Total {totalVariantStock} units
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_160px_auto]">
                <input
                  value={variantColorInput}
                  onChange={(event) => setVariantColorInput(event.target.value)}
                  placeholder="Color name"
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-slate-950"
                />
                <input
                  type="number"
                  min="0"
                  value={variantStockInput}
                  onChange={(event) => setVariantStockInput(event.target.value)}
                  placeholder="Units"
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-slate-950"
                />
                <button
                  type="button"
                  onClick={addColorVariant}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Save variant
                </button>
              </div>

              {formValues.colorVariants.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {formValues.colorVariants.map((variant) => (
                    <div
                      key={variant.color}
                      className="grid gap-3 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 md:grid-cols-[1fr_140px_auto]"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {variant.color}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Customer-selectable variant
                        </p>
                      </div>
                      <input
                        type="number"
                        min="0"
                        value={variant.stock}
                        onChange={(event) =>
                          updateVariantStock(variant.color, event.target.value)
                        }
                        className="h-11 rounded-2xl border border-slate-200 bg-white px-4 outline-none focus:border-slate-950"
                      />
                      <button
                        type="button"
                        onClick={() => removeColorVariant(variant.color)}
                        className="inline-flex h-11 items-center justify-center rounded-2xl border border-red-200 px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-xs text-slate-500">
                  No per-color inventory yet. Customers will use shared stock until you add variants here.
                </p>
              )}
            </div>

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Description</span>
              <textarea
                rows={5}
                value={formValues.productDescription}
                onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      productDescription: event.target.value,
                    }))
                }
                placeholder="Describe the silhouette, comfort, materials, and standout details."
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
              />
            </label>

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Product images</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(event) => {
                  const selectedFiles = Array.from(event.target.files ?? []);
                  setFiles((current) => {
                    // Prevent duplicates by checking name, lastModified, and size
                    const existingIds = new Set(current.map(file => `${file.name}-${file.lastModified}-${file.size}`));
                    const newFiles = selectedFiles.filter(file => {
                      const fileId = `${file.name}-${file.lastModified}-${file.size}`;
                      return !existingIds.has(fileId);
                    });
                    return [...current, ...newFiles];
                  });
                  // Reset input value so same file can be selected again if needed
                  event.target.value = "";
                }}
                className="block w-full rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500"
              />
              <p className="text-xs text-slate-500">
                Upload up to 5 storefront-ready product images.
              </p>
              {filePreviews.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filePreviews.map((preview) => (
                    <div
                      key={preview.id}
                      className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50"
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={preview.url}
                          alt={preview.name}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(preview.id)}
                          className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950/80 text-white transition-opacity hover:opacity-90"
                          aria-label={`Remove ${preview.name}`}
                        >
                          <FiX />
                        </button>
                      </div>
                      <div className="px-4 py-3 text-xs text-slate-500">
                        {preview.name}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              {editingProduct && filePreviews.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Leave empty to keep the existing product images.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {editingProduct.productImages.map((image, index) => (
                      <div
                        key={image.publicId}
                        className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50"
                      >
                        <div className="relative aspect-square">
                          <Image
                            src={image.url}
                            alt={`${editingProduct.productName} ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="px-4 py-3 text-xs text-slate-500">
                          Current image {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              {editingProduct && (
                <p className="text-xs text-slate-500">
                  Uploading new images will replace the current saved gallery.
                </p>
              )}
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                <input
                  type="checkbox"
                  checked={formValues.isActive}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700">
                  Product is active
                </span>
              </label>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Homepage placement</p>
                <p className="mt-1 text-xs text-slate-500">
                  Choose where this product appears across the storefront.
                </p>
                <div className="mt-4 space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formValues.isFeatured}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          isFeatured: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                      <FiStar className="text-amber-500" />
                      Featured product
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formValues.isNewArrival}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          isNewArrival: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                      <FiZap className="text-sky-500" />
                      New arrival
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formValues.isBestSeller}
                      onChange={(event) =>
                        setFormValues((current) => ({
                          ...current,
                          isBestSeller: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <span className="text-sm font-medium text-slate-700">
                      Best seller
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetModal}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingProduct
                    ? "Save changes"
                    : "Create product"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AuthGuard>
  );
}
