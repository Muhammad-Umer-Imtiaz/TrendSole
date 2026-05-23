"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/ui/StatusBadge";
import Table, { type TableColumn } from "@/components/ui/Table";
import { apiErrorMessage, inventoryApi } from "@/lib/api";
import { formatDate } from "@/lib/format";
import type { InventoryItem } from "@/lib/types";

const columns: TableColumn<InventoryItem>[] = [
  {
    key: "product",
    header: "Product",
    render: (item) => (
      <div>
        <p className="font-semibold text-slate-950">{item.productName}</p>
        <p className="mt-1 text-xs text-slate-500">{item.productCategory}</p>
      </div>
    ),
  },
  {
    key: "stock",
    header: "Stock",
    render: (item) => (
      <span
        className={`font-semibold ${
          item.stock <= 5 ? "text-red-600" : item.stock <= 15 ? "text-amber-600" : "text-slate-950"
        }`}
      >
        {item.stock} units
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (item) => <StatusBadge status={item.isActive ? "active" : "inactive"} />,
  },
  {
    key: "updated",
    header: "Last updated",
    render: (item) => formatDate(item.updatedAt),
  },
];

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const response = await inventoryApi.list();
        setItems(response);
      } catch (requestError) {
        setError(apiErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    };

    void loadInventory();
  }, []);

  return (
    <AuthGuard requiredPermissions={["inventory:read"]}>
      <Card
        title="Inventory"
        description="Monitor low-stock products and active catalog availability."
      >
        {error && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <Table
          data={items}
          columns={columns}
          keyExtractor={(item) => item.id}
          isLoading={loading}
          pageSize={10}
          paginationLabel="inventory items"
          emptyMessage="Inventory data is not available right now."
        />
      </Card>
    </AuthGuard>
  );
}
