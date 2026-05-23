"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import AuthGuard from "@/components/auth/AuthGuard";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import StatusBadge from "@/components/ui/StatusBadge";
import Table, { type TableColumn } from "@/components/ui/Table";
import { apiErrorMessage, customersApi } from "@/lib/api";
import { formatCurrency, formatDate, toSentenceCase } from "@/lib/format";
import { useAuthStore } from "@/store/auth.store";
import type {
  Customer,
  CustomerFormValues,
  PaginationMeta,
  UserRole,
} from "@/lib/types";

const customerRoleOptions: UserRole[] = [
  "customer",
  "sales_staff",
  "manager",
  "admin",
];

const emptyCustomerForm: CustomerFormValues = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  role: "customer",
  isActive: true,
};

export default function CustomersPage() {
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);
  const canManageCustomers =
    user?.role === "admin" || permissions.includes("customers:manage");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formValues, setFormValues] = useState<CustomerFormValues>(emptyCustomerForm);
  const deferredSearch = useDeferredValue(searchTerm);

  const loadCustomers = async (targetPage = page, targetSearch = deferredSearch) => {
    try {
      setLoading(true);
      setError(null);
      const response = await customersApi.listPaginated({
        page: targetPage,
        limit: 10,
        search: targetSearch,
      });
      setCustomers(response.items);
      setPagination(response.pagination);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialCustomers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await customersApi.listPaginated({
          page,
          limit: 10,
          search: deferredSearch,
        });

        if (!isMounted) {
          return;
        }

        setCustomers(response.items);
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

    void loadInitialCustomers();

    return () => {
      isMounted = false;
    };
  }, [deferredSearch, page]);

  const resetModal = () => {
    setModalOpen(false);
    setEditingCustomer(null);
    setFormValues(emptyCustomerForm);
  };

  const openCreateModal = () => {
    setEditingCustomer(null);
    setFormValues(emptyCustomerForm);
    setModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormValues({
      name: customer.name,
      email: customer.email,
      password: "",
      phone: customer.phone ?? "",
      address: customer.address ?? "",
      role: customer.role,
      isActive: customer.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingCustomer) {
        await customersApi.update(editingCustomer.id, formValues, {
          keepPassword: true,
        });
      } else {
        await customersApi.create(formValues);
      }

      resetModal();
      await loadCustomers();
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (customer: Customer) => {
    const confirmed = window.confirm(
      `Delete "${customer.name}" from the customer list?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await customersApi.delete(customer.id);
      await loadCustomers();
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    }
  };

  const baseColumns: TableColumn<Customer>[] = [
    {
      key: "customer",
      header: "Customer",
      render: (customer) => (
        <div>
          <p className="font-semibold text-slate-950">{customer.name}</p>
          <p className="mt-1 text-xs text-slate-500">{customer.email}</p>
          {customer.phone ? (
            <p className="mt-1 text-xs text-slate-400">{customer.phone}</p>
          ) : null}
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (customer) => (
        <span className="font-medium text-slate-700">
          {toSentenceCase(customer.role)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (customer) => (
        <StatusBadge status={customer.isActive ? "active" : "inactive"} />
      ),
    },
    {
      key: "orders",
      header: "Orders",
      render: (customer) => customer.totalOrders,
    },
    {
      key: "spent",
      header: "Spent",
      render: (customer) => formatCurrency(customer.totalSpent),
    },
    {
      key: "joined",
      header: "Joined",
      render: (customer) => formatDate(customer.createdAt),
    },
  ];

  const columns: TableColumn<Customer>[] = canManageCustomers
    ? [
        ...baseColumns,
        {
          key: "actions",
          header: "Actions",
          render: (customer) => (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => openEditModal(customer)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950"
              >
                <FiEdit2 />
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(customer)}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                <FiTrash2 />
                Delete
              </button>
            </div>
          ),
        },
      ]
    : baseColumns;

  return (
    <AuthGuard requiredPermissions={["customers:read"]}>
      <div className="space-y-6">
        <Card
          title="Customers"
          description="Manage customer records, activate accounts, and adjust roles when a shopper becomes part of the team."
          action={
            canManageCustomers ? (
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <FiPlus />
                Add customer
              </button>
            ) : null
          }
        >
          <div className="mb-5">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, phone, or role"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
            />
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Table
            data={customers}
            columns={columns}
            keyExtractor={(customer) => customer.id}
            isLoading={loading}
            pagination={pagination}
            paginationLabel="customers"
            onPageChange={setPage}
            emptyMessage={
              searchTerm.trim()
                ? "No customers match your search."
                : "No customers have been added yet."
            }
          />
        </Card>

        <Modal
          open={modalOpen}
          onClose={resetModal}
          title={editingCustomer ? "Edit customer" : "Create customer"}
          description="Maintain customer accounts directly from the admin dashboard."
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Full name</span>
                <input
                  value={formValues.name}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-slate-950"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Email</span>
                <input
                  type="email"
                  value={formValues.email}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-slate-950"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Phone</span>
                <input
                  value={formValues.phone}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-slate-950"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Role</span>
                <select
                  value={formValues.role}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      role: event.target.value as UserRole,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-slate-950"
                >
                  {customerRoleOptions.map((role) => (
                    <option key={role} value={role}>
                      {toSentenceCase(role)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>Address</span>
              <textarea
                value={formValues.address ?? ""}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
                rows={3}
                className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none focus:border-slate-950"
              />
            </label>

            <label className="block space-y-2 text-sm font-medium text-slate-700">
              <span>{editingCustomer ? "New password" : "Password"}</span>
              <input
                type="password"
                value={formValues.password}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                className="h-12 w-full rounded-2xl border border-slate-200 px-4 outline-none focus:border-slate-950"
              />
              {editingCustomer ? (
                <p className="text-xs text-slate-500">
                  Leave this empty to keep the current password unchanged.
                </p>
              ) : null}
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
                Account is active
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
                  : editingCustomer
                    ? "Save changes"
                    : "Create customer"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AuthGuard>
  );
}
