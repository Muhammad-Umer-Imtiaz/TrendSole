"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import {
  FiArrowRight,
  FiClock,
  FiLock,
  FiLogOut,
  FiPackage,
  FiShield,
  FiUser,
} from "react-icons/fi";
import AuthGuard from "@/components/auth/AuthGuard";
import Footer from "@/components/landingPage/Footer";
import Navbar from "@/components/landingPage/Navbar";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Table, { type TableColumn } from "@/components/ui/Table";
import { apiErrorMessage, authApi, ordersApi } from "@/lib/api";
import { formatCurrency, formatDate, toSentenceCase } from "@/lib/format";
import { useAuthStore } from "@/store/auth.store";
import type { Order, PaginationMeta } from "@/lib/types";

const DEFAULT_PAGINATION: PaginationMeta = {
  page: 1,
  limit: 5,
  total: 0,
  totalPages: 1,
};

type AccountTab = "overview" | "profile" | "security" | "orders";

export default function AccountPage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setPermissions = useAuthStore((state) => state.setPermissions);
  const logout = useAuthStore((state) => state.logout);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<AccountTab>("overview");
  const deferredSearch = useDeferredValue(searchTerm);
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    let isMounted = true;

    const hydrateUser = async () => {
      try {
        const response = await authApi.getCurrentUser();

        if (!isMounted) {
          return;
        }

        setUser(response.user);
        setPermissions(response.permissions);
        setProfileForm({
          name: response.user.name,
          phone: response.user.phone ?? "",
          address: response.user.address ?? "",
        });
      } catch {
        // Proxy/AuthGuard already protects this route. Keep UI usable on soft failures.
      }
    };

    void hydrateUser();

    return () => {
      isMounted = false;
    };
  }, [setPermissions, setUser]);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        setOrdersLoading(true);
        setError(null);
        const response = await ordersApi.listMine({
          page,
          limit: 5,
          search: deferredSearch,
        });

        if (!isMounted) {
          return;
        }

        setOrders(response.items);
        setPagination(response.pagination);
      } catch (requestError) {
        if (!isMounted) {
          return;
        }

        setError(apiErrorMessage(requestError));
      } finally {
        if (isMounted) {
          setOrdersLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, [deferredSearch, page]);

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setProfileSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await authApi.updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        address: profileForm.address,
      });

      setUser(response.user);
      setPermissions(response.permissions);
      setProfileForm({
        name: response.user.name,
        phone: response.user.phone ?? "",
        address: response.user.address ?? "",
      });
      setSuccessMessage(response.message);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirm password must match.");
      setSuccessMessage(null);
      return;
    }

    try {
      setPasswordSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await authApi.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccessMessage(response.message);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setPasswordSaving(false);
    }
  };

  const orderColumns: TableColumn<Order>[] = [
    {
      key: "order",
      header: "Order",
      render: (order) => (
        <div>
          <p className="font-semibold text-slate-950">{order.orderNumber}</p>
          <p className="mt-1 text-xs text-slate-500">{formatDate(order.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      render: (order) => (
        <div>
          <p className="font-medium text-slate-900">{order.itemsCount ?? 0} items</p>
          {order.items?.slice(0, 2).map((item) => (
            <p key={`${order.id}-${item.productId}-${item.selectedColor ?? "base"}`} className="mt-1 text-xs text-slate-500">
              {item.productName}
              {item.selectedColor ? ` • ${item.selectedColor}` : ""}
            </p>
          ))}
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (order) => formatCurrency(order.total),
    },
    {
      key: "status",
      header: "Status",
      render: (order) => <StatusBadge status={order.status} />,
    },
  ];

  const tabs: Array<{
    key: AccountTab;
    label: string;
    icon: typeof FiUser;
    description: string;
  }> = [
    {
      key: "overview",
      label: "Overview",
      icon: FiUser,
      description: "Account summary and quick actions",
    },
    {
      key: "profile",
      label: "Profile",
      icon: FiUser,
      description: "Update personal and shipping details",
    },
    {
      key: "security",
      label: "Security",
      icon: FiShield,
      description: "Password and recovery settings",
    },
    {
      key: "orders",
      label: "Orders",
      icon: FiPackage,
      description: "Track and search your purchases",
    },
  ];

  return (
    <AuthGuard>
      <main className="min-h-screen bg-[#f5f3ee] text-slate-950">
        <Navbar />

        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
            <div className="space-y-6">
              <div className="rounded-[32px] border border-black/8 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-950 text-white">
                  <FiUser />
                </div>

                <h1 className="mt-5 text-3xl font-semibold text-slate-950">
                  {user?.name ?? "My account"}
                </h1>
                <p className="mt-2 text-sm text-slate-500">{user?.email ?? ""}</p>

                <div className="mt-5 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  {toSentenceCase(user?.role ?? "customer")}
                </div>

                {user?.role !== "customer" ? (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                    Operational users can still shop here, and you also have
                    access to the dashboard.
                    <div className="mt-3">
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 font-semibold text-white"
                      >
                        Open dashboard
                        <FiArrowRight />
                      </Link>
                    </div>
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => void logout({ redirect: true })}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950"
                >
                  <FiLogOut />
                  Logout
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {(error || successMessage) && (
                <div
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    error
                      ? "border border-red-200 bg-red-50 text-red-700"
                      : "border border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {error ?? successMessage}
                </div>
              )}

              <div className="rounded-[28px] border border-black/8 bg-white p-3 shadow-[0_24px_70px_rgba(15,23,42,0.06)]">
                <div className="grid gap-3 md:grid-cols-4">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;

                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key)}
                        className={`rounded-[24px] px-4 py-4 text-left transition-colors ${
                          isActive
                            ? "bg-slate-950 text-white"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-base">
                          <Icon />
                        </div>
                        <p className="mt-4 text-sm font-semibold">{tab.label}</p>
                        <p
                          className={`mt-1 text-xs leading-6 ${
                            isActive ? "text-white/70" : "text-slate-500"
                          }`}
                        >
                          {tab.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {activeTab === "overview" ? (
                <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <Card
                    title="Account overview"
                    description="Quick access to your identity, contact details, and purchase activity."
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                          Contact
                        </p>
                        <p className="mt-3 text-lg font-semibold text-slate-950">
                          {user?.email ?? "No email found"}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          {profileForm.phone || "Phone number not added yet"}
                        </p>
                      </div>
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                          Shipping
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          {profileForm.address || "Add your delivery address from the Profile tab."}
                        </p>
                      </div>
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                          Orders placed
                        </p>
                        <p className="mt-3 text-3xl font-semibold text-slate-950">
                          {pagination.total}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Recent order activity connected to your account.
                        </p>
                      </div>
                      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                          Last update
                        </p>
                        <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <FiClock />
                          {formatDate(user ? new Date().toISOString() : new Date().toISOString())}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Refresh your details anytime from the tabs above.
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card
                    title="Quick actions"
                    description="Jump straight into the tasks customers use most."
                  >
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => setActiveTab("profile")}
                        className="flex w-full items-center justify-between rounded-[22px] border border-slate-200 px-4 py-4 text-left"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-950">Update profile</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Keep your name, phone, and address current.
                          </p>
                        </div>
                        <FiArrowRight className="text-slate-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("security")}
                        className="flex w-full items-center justify-between rounded-[22px] border border-slate-200 px-4 py-4 text-left"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-950">Security settings</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Change your password or request a reset link.
                          </p>
                        </div>
                        <FiArrowRight className="text-slate-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("orders")}
                        className="flex w-full items-center justify-between rounded-[22px] border border-slate-200 px-4 py-4 text-left"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-950">Review orders</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Search, paginate, and track fulfillment status.
                          </p>
                        </div>
                        <FiArrowRight className="text-slate-400" />
                      </button>
                    </div>
                  </Card>
                </div>
              ) : null}

              {activeTab === "profile" ? (
                <Card
                  title="Profile details"
                  description="Keep your personal and shipping information up to date."
                >
                  <form onSubmit={handleProfileSubmit} className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Full name
                      </label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(event) =>
                          setProfileForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Muhammad Umer"
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Email address
                        </label>
                        <input
                          type="email"
                          value={user?.email ?? ""}
                          disabled
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(event) =>
                            setProfileForm((current) => ({
                              ...current,
                              phone: event.target.value,
                            }))
                          }
                          placeholder="+92 300 1234567"
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Address
                      </label>
                      <textarea
                        value={profileForm.address}
                        onChange={(event) =>
                          setProfileForm((current) => ({
                            ...current,
                            address: event.target.value,
                          }))
                        }
                        rows={4}
                        placeholder="House number, street, area, city"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                      {profileSaving ? "Saving..." : "Save profile"}
                      {!profileSaving && <FiArrowRight />}
                    </button>
                  </form>
                </Card>
              ) : null}

              {activeTab === "security" ? (
                <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
                  <Card
                    title="Update password"
                    description="Change your password and keep your account secure."
                  >
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Current password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(event) =>
                            setPasswordForm((current) => ({
                              ...current,
                              currentPassword: event.target.value,
                            }))
                          }
                          placeholder="Enter your current password"
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            New password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(event) =>
                              setPasswordForm((current) => ({
                                ...current,
                                newPassword: event.target.value,
                              }))
                            }
                            placeholder="Minimum 6 characters"
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Confirm new password
                          </label>
                          <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(event) =>
                              setPasswordForm((current) => ({
                                ...current,
                                confirmPassword: event.target.value,
                              }))
                            }
                            placeholder="Repeat the new password"
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={passwordSaving}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950 disabled:opacity-60"
                      >
                        <FiLock />
                        {passwordSaving ? "Updating..." : "Update password"}
                      </button>
                    </form>
                  </Card>

                  <Card
                    title="Recovery options"
                    description="If you forget your password later, you can start the reset flow from here."
                  >
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm leading-7 text-slate-600">
                        Use the forgot password flow to receive a secure reset link from the backend.
                      </p>
                      <div className="mt-4">
                        <Link
                          href="/forgot-password"
                          className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
                        >
                          Open forgot password
                          <FiArrowRight />
                        </Link>
                      </div>
                    </div>
                  </Card>
                </div>
              ) : null}

              {activeTab === "orders" ? (
                <Card
                  title="My orders"
                  description="Track your recent purchases and follow the fulfillment status."
                >
                  <div className="mb-5">
                    <input
                      type="search"
                      value={searchTerm}
                      onChange={(event) => {
                        setSearchTerm(event.target.value);
                        setPage(1);
                      }}
                      placeholder="Search by order number or status"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none"
                    />
                  </div>

                  <Table
                    data={orders}
                    columns={orderColumns}
                    keyExtractor={(order) => order.id}
                    isLoading={ordersLoading}
                    pagination={pagination}
                    paginationLabel="orders"
                    onPageChange={setPage}
                    emptyMessage={
                      searchTerm.trim()
                        ? "No orders match your search."
                        : "You have not placed any orders yet."
                    }
                  />
                </Card>
              ) : null}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </AuthGuard>
  );
}
