"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { FiFileText, FiPrinter } from "react-icons/fi";
import AuthGuard from "@/components/auth/AuthGuard";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
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

  const handlePrintInvoice = () => {
    if (!selectedOrder || typeof window === "undefined") {
      return;
    }

    const invoiceWindow = window.open("", "_blank", "width=900,height=700");

    if (!invoiceWindow) {
      return;
    }

    const itemsMarkup =
      selectedOrder.items
        ?.map(
          (item) => `
            <tr>
              <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${item.productName}${item.selectedColor ? ` (${item.selectedColor})` : ""}</td>
              <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${item.quantity}</td>
              <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${item.unitPrice.toFixed(0)}</td>
              <td style="padding:10px;border-bottom:1px solid #e2e8f0;">${item.lineTotal.toFixed(0)}</td>
            </tr>
          `
        )
        .join("") ?? "";

    invoiceWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${selectedOrder.orderNumber}</title>
        </head>
        <body style="font-family:Arial,sans-serif;padding:32px;color:#0f172a;">
          <h1>Trend Sole Invoice</h1>
          <p><strong>Invoice:</strong> ${selectedOrder.orderNumber}</p>
          <p><strong>Customer:</strong> ${selectedOrder.customerName}</p>
          <p><strong>Email:</strong> ${selectedOrder.customerEmail ?? "-"}</p>
          <p><strong>Shipping:</strong> ${selectedOrder.shippingAddress ?? "-"}</p>
          <table style="width:100%;border-collapse:collapse;margin-top:24px;">
            <thead>
              <tr>
                <th style="text-align:left;padding:10px;border-bottom:2px solid #cbd5e1;">Item</th>
                <th style="text-align:left;padding:10px;border-bottom:2px solid #cbd5e1;">Qty</th>
                <th style="text-align:left;padding:10px;border-bottom:2px solid #cbd5e1;">Unit</th>
                <th style="text-align:left;padding:10px;border-bottom:2px solid #cbd5e1;">Total</th>
              </tr>
            </thead>
            <tbody>${itemsMarkup}</tbody>
          </table>
          <h2 style="margin-top:24px;">Grand Total: ${selectedOrder.total.toFixed(0)}</h2>
        </body>
      </html>
    `);
    invoiceWindow.document.close();
    invoiceWindow.focus();
    invoiceWindow.print();
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
    {
      key: "invoice",
      header: "Invoice",
      render: (order) => (
        <button
          type="button"
          onClick={() => setSelectedOrder(order)}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950"
        >
          <FiFileText />
          View invoice
        </button>
      ),
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
      <>
        <Card
          title="Orders"
          description="Track the order lifecycle, review invoice details, and update fulfillment status when needed."
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

        <Modal
          open={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={selectedOrder ? `Invoice ${selectedOrder.orderNumber}` : "Invoice"}
          description="Review billing details and print a customer-facing invoice."
        >
          {selectedOrder ? (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Customer
                  </p>
                  <p className="mt-2 font-semibold text-slate-950">
                    {selectedOrder.customerName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedOrder.customerEmail ?? "No email provided"}
                  </p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Shipping
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {selectedOrder.shippingAddress ?? "No shipping address available"}
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200">
                <div className="divide-y divide-slate-200">
                  {selectedOrder.items?.map((item) => (
                    <div
                      key={`${selectedOrder.id}-${item.productId}-${item.selectedColor ?? "base"}`}
                      className="flex items-center justify-between gap-4 px-4 py-4"
                    >
                      <div>
                        <p className="font-semibold text-slate-950">
                          {item.productName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.selectedColor ? `${item.selectedColor} • ` : ""}
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                        </p>
                      </div>
                      <p className="font-semibold text-slate-950">
                        {formatCurrency(item.lineTotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Total amount
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {formatCurrency(selectedOrder.total)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <FiPrinter />
                  Print invoice
                </button>
              </div>
            </div>
          ) : null}
        </Modal>
      </>
    </AuthGuard>
  );
}
