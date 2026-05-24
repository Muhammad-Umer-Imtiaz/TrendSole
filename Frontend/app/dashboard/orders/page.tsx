"use client";

import { useDeferredValue, useEffect, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Table, { type TableColumn } from "@/components/ui/Table";
import { apiErrorMessage, ordersApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { hasPermission } from "@/lib/permissions";
import { useAuthStore } from "@/store/auth.store";
import type { Order, OrderStatus, PaginationMeta } from "@/lib/types";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrdersPage() {
  const permissions = useAuthStore((state) => state.permissions);
  const canUpdate = hasPermission(permissions, "orders:update");
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const deferredSearch = useDeferredValue(searchTerm);

  const loadOrders = async (targetPage = page, targetSearch = deferredSearch) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersApi.listPaginated({
        page: targetPage,
        limit: 10,
        search: targetSearch,
      });
      setOrders(response.items);
      setPagination(response.pagination);
      setStatusMap(
        Object.fromEntries(response.items.map((order) => [order.id, order.status]))
      );
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ordersApi.listPaginated({
          page,
          limit: 10,
          search: deferredSearch,
        });

        if (!isMounted) {
          return;
        }

        setOrders(response.items);
        setPagination(response.pagination);
        setStatusMap(
          Object.fromEntries(response.items.map((order) => [order.id, order.status]))
        );
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

    void loadInitialOrders();

    return () => {
      isMounted = false;
    };
  }, [deferredSearch, page]);

  const handleStatusSave = async (orderId: string) => {
    try {
      await ordersApi.updateStatus(orderId, statusMap[orderId]);
      await loadOrders();
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    }
  };

  const baseColumns: TableColumn<Order>[] = [
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

  const columns: TableColumn<Order>[] = !canUpdate
    ? baseColumns
    : [
        ...baseColumns,
        {
          key: "update",
          header: "Update status",
          render: (order) => (
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                value={statusMap[order.id] ?? order.status}
                onChange={(event) =>
                  setStatusMap((current) => ({
                    ...current,
                    [order.id]: event.target.value,
                  }))
                }
                className="min-w-[150px] rounded-full border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-950"
              >
                {ORDER_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleStatusSave(order.id)}
                className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                Save
              </button>
            </div>
          ),
        },
      ];

  return (
    <AuthGuard requiredPermissions={["orders:read"]}>
      <Card
        title="Orders"
        description="Track the order lifecycle and update fulfillment status when needed."
      >
        <div className="mb-5">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setPage(1);
            }}
            placeholder="Search by order number, customer, email, or status"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
          />
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Table
          data={orders}
          columns={columns}
          keyExtractor={(order) => order.id}
          isLoading={loading}
          pagination={pagination}
          paginationLabel="orders"
          onPageChange={setPage}
          emptyMessage={
            searchTerm.trim()
              ? "No orders match your search."
              : "No orders were returned by the backend."
          }
        />
      </Card>
    </AuthGuard>
  );
}
