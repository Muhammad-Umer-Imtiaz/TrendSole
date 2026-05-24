"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiActivity, FiBarChart2, FiPackage, FiUsers } from "react-icons/fi";
import AuthGuard from "@/components/auth/AuthGuard";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Table, { type TableColumn } from "@/components/ui/Table";
import { dashboardApi, apiErrorMessage } from "@/lib/api";
import { formatCompactNumber, formatCurrency, formatDate } from "@/lib/format";
import { hasAllPermissions } from "@/lib/permissions";
import { useAuthStore } from "@/store/auth.store";
import type { DashboardOverview, Order } from "@/lib/types";

const statsConfig = [
  { key: "totalSales", label: "Total Sales", type: "currency" as const },
  { key: "orders", label: "Orders", type: "number" as const },
  { key: "products", label: "Products", type: "number" as const },
  { key: "users", label: "Users", type: "number" as const },
];

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
    key: "customer",
    header: "Customer",
    render: (order) => (
      <div>
        <p className="font-medium text-slate-900">{order.customerName}</p>
        {order.customerEmail && (
          <p className="mt-1 text-xs text-slate-500">{order.customerEmail}</p>
        )}
      </div>
    ),
  },
  {
    key: "total",
    header: "Total",
    render: (order) => (
      <span className="font-semibold text-slate-950">
        {formatCurrency(order.total)}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (order) => <StatusBadge status={order.status} />,
  },
];

export default function DashboardPage() {
  const permissions = useAuthStore((state) => state.permissions);
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const overview = await dashboardApi.getOverview();
        setData(overview);
      } catch (requestError) {
        setError(apiErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const quickLinks = [
    {
      href: "/dashboard/orders",
      label: "Review orders",
      description: "Update fulfillment and invoice activity.",
      icon: FiActivity,
      requiredPermissions: ["orders:read"] as const,
    },
    {
      href: "/dashboard/products",
      label: "Manage catalog",
      description: "Add products, pricing, and offers.",
      icon: FiPackage,
      requiredPermissions: ["products:read"] as const,
    },
    {
      href: "/dashboard/customers",
      label: "Customer desk",
      description: "Track customer records, history, and feedback.",
      icon: FiUsers,
      requiredPermissions: ["customers:read"] as const,
    },
    {
      href: "/dashboard/reports",
      label: "Open reports",
      description: "Review sales, inventory, and profit analysis.",
      icon: FiBarChart2,
      requiredPermissions: ["analytics:view"] as const,
    },
  ].filter((link) => hasAllPermissions(permissions, [...link.requiredPermissions]));

  return (
    <AuthGuard requiredPermissions={["dashboard:view"]}>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Dashboard
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">
            Business overview
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Monitor sales performance, catalog health, and the latest order flow.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statsConfig.map((item) => {
            const value = data?.stats[item.key as keyof typeof data.stats] ?? 0;

            return (
              <Card key={item.key}>
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {item.type === "currency"
                    ? formatCurrency(Number(value))
                    : formatCompactNumber(Number(value))}
                </p>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card
            title="Daily sales summary"
            description="A same-day snapshot for order activity and revenue throughput."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Orders today
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {formatCompactNumber(data?.dailySummary?.orderCount ?? 0)}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Orders created on the current calendar day.
                </p>
              </div>
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Revenue today
                </p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {formatCurrency(data?.dailySummary?.revenue ?? 0)}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Gross order value recorded for today.
                </p>
              </div>
            </div>
          </Card>

          <Card
            title="Quick navigation"
            description="Jump directly into the operational modules your team uses most."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {quickLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition-colors hover:border-slate-950 hover:bg-white"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <Icon />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-slate-950">
                      {link.label}
                    </p>
                    <p className="mt-2 text-xs leading-6 text-slate-500">
                      {link.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </Card>
        </div>

        <Card
          title="Recent orders"
          description="Most recent customer purchases requiring visibility from the operations team."
        >
          <Table
            data={data?.recentOrders ?? []}
            columns={orderColumns}
            keyExtractor={(order) => order.id}
            isLoading={loading}
            pageSize={6}
            paginationLabel="orders"
            emptyMessage="No recent orders are available yet."
          />
        </Card>
      </div>
    </AuthGuard>
  );
}
