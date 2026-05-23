"use client";

import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import AuthGuard from "@/components/auth/AuthGuard";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/ui/StatusBadge";
import Table, { type TableColumn } from "@/components/ui/Table";
import { apiErrorMessage, categoriesApi } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { hasPermission } from "@/lib/permissions";
import { useAuthStore } from "@/store/auth.store";
import type { Category, CategoryFormValues } from "@/lib/types";

const emptyCategoryForm: CategoryFormValues = {
  name: "",
  description: "",
  isActive: true,
};

export default function CategoriesPage() {
  const permissions = useAuthStore((state) => state.permissions);
  const canCreate = hasPermission(permissions, "categories:create");
  const canUpdate = hasPermission(permissions, "categories:update");
  const canDelete = hasPermission(permissions, "categories:delete");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formValues, setFormValues] = useState<CategoryFormValues>(emptyCategoryForm);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoriesApi.list({ includeInactive: true });
      setCategories(response);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await categoriesApi.list({ includeInactive: true });

        if (!isMounted) {
          return;
        }

        setCategories(response);
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

    void loadInitialCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const resetModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    setFormValues(emptyCategoryForm);
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormValues(emptyCategoryForm);
    setModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormValues({
      name: category.name,
      description: category.description,
      isActive: category.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, formValues);
      } else {
        await categoriesApi.create(formValues);
      }

      resetModal();
      await loadCategories();
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    const confirmed = window.confirm(
      `Delete "${category.name}" from the category list?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await categoriesApi.delete(category.id);
      await loadCategories();
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    }
  };

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return categories;
    }

    return categories.filter((category) =>
      [category.name, category.slug, category.description]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [categories, searchTerm]);

  const baseColumns: TableColumn<Category>[] = [
    {
      key: "category",
      header: "Category",
      render: (category) => (
        <div>
          <p className="font-semibold text-slate-950">{category.name}</p>
          <p className="mt-1 text-xs text-slate-500">{category.slug}</p>
        </div>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (category) =>
        category.description || "No description added yet.",
    },
    {
      key: "products",
      header: "Products",
      render: (category) => `${category.productCount} linked`,
    },
    {
      key: "status",
      header: "Status",
      render: (category) => (
        <StatusBadge status={category.isActive ? "active" : "inactive"} />
      ),
    },
    {
      key: "updated",
      header: "Updated",
      render: (category) => formatDate(category.updatedAt),
    },
  ];

  const columns: TableColumn<Category>[] =
    canUpdate || canDelete
      ? [
          ...baseColumns,
          {
            key: "actions",
            header: "Actions",
            render: (category) => (
              <div className="flex gap-2">
                {canUpdate ? (
                  <button
                    type="button"
                    onClick={() => openEditModal(category)}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950"
                  >
                    <FiEdit2 />
                    Edit
                  </button>
                ) : null}
                {canDelete ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(category)}
                    className="inline-flex items-center gap-2 rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <FiTrash2 />
                    Delete
                  </button>
                ) : null}
              </div>
            ),
          },
        ]
      : baseColumns;

  return (
    <AuthGuard requiredPermissions={["categories:read"]}>
      <div className="space-y-6">
        <Card
          title="Categories"
          description="Manage the catalog taxonomy used by products and inventory operations."
          action={
            canCreate ? (
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <FiPlus />
                Add category
              </button>
            ) : null
          }
        >
          <div className="mb-5">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by category name, slug, or description"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            />
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Table
            data={filteredCategories}
            columns={columns}
            keyExtractor={(category) => category.id}
            isLoading={loading}
            pageSize={8}
            paginationLabel="categories"
            emptyMessage={
              searchTerm.trim()
                ? "No categories match your search."
                : "No categories have been added yet."
            }
          />
        </Card>

        <Modal
          open={modalOpen}
          onClose={resetModal}
          title={editingCategory ? "Edit category" : "Create category"}
          description="Keep category naming consistent across your full product catalog."
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Name</span>
              <input
                value={formValues.name}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none"
              />
            </label>

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Description</span>
              <textarea
                rows={4}
                value={formValues.description}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
              />
            </label>

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
                Category is active
              </span>
            </label>

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
                  : editingCategory
                    ? "Save changes"
                    : "Create category"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AuthGuard>
  );
}
