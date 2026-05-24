"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import Card from "@/components/ui/Card";
import { apiErrorMessage, ordersApi, productApi } from "@/lib/api";
import { formatCompactNumber, formatCurrency } from "@/lib/format";
import type { Order, Product } from "@/lib/types";

const LOW_STOCK_THRESHOLD = 5;

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadReports = async () => {
      try {
        setLoading(true);
        setError(null);

        const [ordersResponse, productsResponse] = await Promise.all([
          ordersApi.listPaginated({ page: 1, limit: 100 }),
          productApi.list({ includeInactive: true, limit: 100 }),
        ]);

        if (!isMounted) {
          return;
        }

        setOrders(ordersResponse.items);
        setProducts(productsResponse);
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

    void loadReports();

    return () => {
      isMounted = false;
    };
  }, []);

  const salesSummary = useMemo(() => {
    const deliveredOrders = orders.filter((order) => order.status === "delivered");
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const deliveredRevenue = deliveredOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );
    const totalUnits = orders.reduce((sum, order) => sum + (order.itemsCount ?? 0), 0);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const estimatedCost = orders.reduce(
      (sum, order) =>
        sum +
        (order.items?.reduce(
          (itemSum, item) => itemSum + (item.unitCost ?? 0) * item.quantity,
          0
        ) ?? 0),
      0
    );
    const grossProfit = totalRevenue - estimatedCost;

    return {
      deliveredRevenue,
      totalRevenue,
      totalUnits,
      averageOrderValue,
      grossProfit,
      profitMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
    };
  }, [orders]);

  const inventorySummary = useMemo(() => {
    const activeProducts = products.filter((product) => product.isActive);
    const lowStockProducts = activeProducts.filter(
      (product) => product.stock <= LOW_STOCK_THRESHOLD
    );
    const inventoryUnits = activeProducts.reduce(
      (sum, product) => sum + product.stock,
      0
    );
    const retailValue = activeProducts.reduce(
      (sum, product) => sum + product.productPrice * product.stock,
      0
    );
    const costValue = activeProducts.reduce(
      (sum, product) => sum + product.productCost * product.stock,
      0
    );

    return {
      activeProducts,
      lowStockProducts,
      inventoryUnits,
      retailValue,
      costValue,
    };
  }, [products]);

  const topSellingProducts = useMemo(() => {
    const map = new Map<string, { name: string; revenue: number; units: number }>();

    for (const order of orders) {
      for (const item of order.items ?? []) {
        const current = map.get(item.productName) ?? {
          name: item.productName,
          revenue: 0,
          units: 0,
        };
        current.revenue += item.lineTotal;
        current.units += item.quantity;
        map.set(item.productName, current);
      }
    }

    return Array.from(map.values())
      .sort((first, second) => second.revenue - first.revenue)
      .slice(0, 5);
  }, [orders]);

  return (
    <AuthGuard requiredPermissions={["analytics:view"]}>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Reports
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">
            Sales, inventory, and profit reporting
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Consolidated reporting across transactions, catalog exposure, and gross profit.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-3">
          <Card title="Sales reports" description="Revenue, order volume, and throughput.">
            {loading ? (
              <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Total revenue
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {formatCurrency(salesSummary.totalRevenue)}
                  </p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Delivered revenue
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {formatCurrency(salesSummary.deliveredRevenue)}
                  </p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Units sold
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {formatCompactNumber(salesSummary.totalUnits)}
                  </p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Average order value
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {formatCurrency(salesSummary.averageOrderValue)}
                  </p>
                </div>
              </div>
            )}
          </Card>

          <Card title="Inventory reports" description="Stock health and catalog exposure.">
            {loading ? (
              <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Active products
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">
                      {inventorySummary.activeProducts.length}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Low stock
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-red-600">
                      {inventorySummary.lowStockProducts.length}
                    </p>
                  </div>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Inventory units
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {formatCompactNumber(inventorySummary.inventoryUnits)}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Retail value {formatCurrency(inventorySummary.retailValue)}
                  </p>
                </div>
              </div>
            )}
          </Card>

          <Card title="Profit analysis" description="Gross profit from tracked order cost.">
            {loading ? (
              <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
            ) : (
              <div className="space-y-4">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Gross profit
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {formatCurrency(salesSummary.grossProfit)}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Margin {salesSummary.profitMargin.toFixed(1)}%
                  </p>
                </div>
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Inventory cost basis
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {formatCurrency(inventorySummary.costValue)}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Based on current stored product cost values.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>

        <Card
          title="Top selling products"
          description="Product-level revenue contribution from recorded orders."
        >
          {loading ? (
            <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
          ) : topSellingProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
              Product performance will appear here once orders are recorded.
            </div>
          ) : (
            <div className="space-y-4">
              {topSellingProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between rounded-[24px] border border-slate-200 px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-950">{product.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {product.units} units sold
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-slate-950">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AuthGuard>
  );
}
