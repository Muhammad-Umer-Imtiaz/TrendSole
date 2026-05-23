"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import Card from "@/components/ui/Card";
import { analyticsApi, apiErrorMessage } from "@/lib/api";
import { formatCompactNumber, formatCurrency } from "@/lib/format";
import type { AnalyticsOverview } from "@/lib/types";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const response = await analyticsApi.getOverview();
        setData(response);
      } catch (requestError) {
        setError(apiErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    };

    void loadAnalytics();
  }, []);

  const maxRevenue = Math.max(
    ...(data?.revenueSeries.map((point) => point.value) ?? [1])
  );
  const maxChannel = Math.max(...(data?.channelBreakdown.map((point) => point.value) ?? [1]));

  return (
    <AuthGuard requiredPermissions={["analytics:view"]}>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-slate-500">Average order value</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {formatCurrency(data?.averageOrderValue ?? 0)}
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Conversion rate</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {(data?.conversionRate ?? 0).toFixed(1)}%
            </p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Returning customers</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {formatCompactNumber(data?.returningCustomers ?? 0)}
            </p>
          </Card>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-2">
          <Card
            title="Revenue trend"
            description="Snapshot of recent revenue points from the analytics service."
          >
            {loading ? (
              <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
            ) : (
              <div className="flex h-64 items-end gap-4">
                {(data?.revenueSeries ?? []).map((point) => (
                  <div key={point.label} className="flex flex-1 flex-col items-center gap-3">
                    <div className="flex h-full w-full items-end">
                      <div
                        className="w-full rounded-t-2xl bg-slate-950"
                        style={{
                          height: `${Math.max((point.value / maxRevenue) * 100, 12)}%`,
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-slate-700">{point.label}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatCurrency(point.value)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card
            title="Channel mix"
            description="Relative contribution by sales channel or acquisition source."
          >
            <div className="space-y-4">
              {(data?.channelBreakdown ?? []).map((point) => (
                <div key={point.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{point.label}</span>
                    <span className="text-slate-500">{formatCompactNumber(point.value)}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div
                      className="h-3 rounded-full bg-slate-950"
                      style={{
                        width: `${Math.max((point.value / maxChannel) * 100, 10)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card
          title="Top performing products"
          description="Products contributing the strongest results within the current analytics window."
        >
          <div className="space-y-4">
            {(data?.topProducts ?? []).map((point) => (
              <div
                key={point.label}
                className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4"
              >
                <div>
                  <p className="font-semibold text-slate-950">{point.label}</p>
                  <p className="mt-1 text-sm text-slate-500">Revenue contribution</p>
                </div>
                <p className="text-lg font-semibold text-slate-950">
                  {formatCurrency(point.value)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AuthGuard>
  );
}
