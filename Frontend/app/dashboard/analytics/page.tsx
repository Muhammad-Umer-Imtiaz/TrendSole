"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import Card from "@/components/ui/Card";
import { analyticsApi, apiErrorMessage } from "@/lib/api";
import { formatCompactNumber, formatCurrency } from "@/lib/format";
import type { AnalyticsOverview, AnalyticsPoint } from "@/lib/types";

const CHART_HEIGHT = 260;
const CHART_WIDTH = 640;
const CHART_PADDING_X = 28;
const CHART_PADDING_TOP = 24;
const CHART_PADDING_BOTTOM = 36;
const CHART_PADDING_RIGHT = 18;

const getMaxValue = (points: AnalyticsPoint[]) =>
  Math.max(...points.map((point) => point.value), 1);

const formatAxisValue = (value: number) => {
  if (value >= 1000) {
    return formatCompactNumber(value);
  }

  return value.toFixed(0);
};

const buildLineChart = (points: AnalyticsPoint[]) => {
  if (points.length === 0) {
    return null;
  }

  const chartInnerWidth = CHART_WIDTH - CHART_PADDING_X - CHART_PADDING_RIGHT;
  const chartInnerHeight =
    CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;
  const maxValue = getMaxValue(points);
  const stepX =
    points.length > 1 ? chartInnerWidth / (points.length - 1) : chartInnerWidth / 2;
  const coordinates = points.map((point, index) => {
    const x =
      points.length > 1
        ? CHART_PADDING_X + stepX * index
        : CHART_PADDING_X + chartInnerWidth / 2;
    const y =
      CHART_PADDING_TOP +
      chartInnerHeight -
      (point.value / maxValue) * chartInnerHeight;

    return { x, y, label: point.label, value: point.value };
  });
  const linePath = coordinates
    .map((coordinate, index) =>
      `${index === 0 ? "M" : "L"} ${coordinate.x} ${coordinate.y}`
    )
    .join(" ");
  const areaPath = `${linePath} L ${
    coordinates[coordinates.length - 1].x
  } ${CHART_HEIGHT - CHART_PADDING_BOTTOM} L ${coordinates[0].x} ${
    CHART_HEIGHT - CHART_PADDING_BOTTOM
  } Z`;
  const yTicks = Array.from({ length: 4 }, (_, index) => {
    const value = maxValue - (maxValue / 3) * index;
    const y =
      CHART_PADDING_TOP + (chartInnerHeight / 3) * index;

    return { value, y };
  });

  return { coordinates, linePath, areaPath, yTicks };
};

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

  const revenueSeries = data?.revenueSeries ?? [];
  const topProducts = data?.topProducts ?? [];
  const channelBreakdown = data?.channelBreakdown ?? [];
  const lineChart = buildLineChart(revenueSeries);
  const maxChannel = Math.max(...channelBreakdown.map((point) => point.value), 1);
  const maxTopProduct = Math.max(...topProducts.map((point) => point.value), 1);
  const totalTopProductRevenue = topProducts.reduce(
    (sum, point) => sum + point.value,
    0
  );

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

        <div className="grid gap-6 2xl:grid-cols-[1.4fr_0.9fr]">
          <Card
            title="Revenue trend"
            description="A clearer view of how revenue is moving across the current analytics window."
          >
            {loading ? (
              <div className="h-[340px] animate-pulse rounded-3xl bg-slate-100" />
            ) : revenueSeries.length === 0 || !lineChart ? (
              <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-14 text-center text-sm text-slate-500">
                Revenue data is not available yet.
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Peak point
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {
                        revenueSeries.reduce((highest, point) =>
                          point.value > highest.value ? point : highest
                        ).label
                      }
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatCurrency(getMaxValue(revenueSeries))}
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Total tracked
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {formatCurrency(
                        revenueSeries.reduce((sum, point) => sum + point.value, 0)
                      )}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Across {revenueSeries.length} periods
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Latest point
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {formatCurrency(revenueSeries[revenueSeries.length - 1]?.value ?? 0)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {revenueSeries[revenueSeries.length - 1]?.label ?? "Current period"}
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] p-4">
                  <svg
                    viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                    className="h-[320px] w-full"
                    role="img"
                    aria-label="Revenue trend line chart"
                  >
                    <defs>
                      <linearGradient id="revenueAreaGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#0f172a" stopOpacity="0.22" />
                        <stop offset="100%" stopColor="#0f172a" stopOpacity="0.03" />
                      </linearGradient>
                    </defs>

                    {lineChart.yTicks.map((tick) => (
                      <g key={tick.y}>
                        <line
                          x1={CHART_PADDING_X}
                          x2={CHART_WIDTH - CHART_PADDING_RIGHT}
                          y1={tick.y}
                          y2={tick.y}
                          stroke="#dbe4ee"
                          strokeDasharray="5 7"
                        />
                        <text
                          x={CHART_PADDING_X - 10}
                          y={tick.y + 4}
                          textAnchor="end"
                          className="fill-slate-400 text-[11px]"
                        >
                          {formatAxisValue(tick.value)}
                        </text>
                      </g>
                    ))}

                    <path d={lineChart.areaPath} fill="url(#revenueAreaGradient)" />
                    <path
                      d={lineChart.linePath}
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {lineChart.coordinates.map((point) => (
                      <g key={point.label}>
                        <circle cx={point.x} cy={point.y} r="6" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
                        <text
                          x={point.x}
                          y={CHART_HEIGHT - 10}
                          textAnchor="middle"
                          className="fill-slate-500 text-[11px]"
                        >
                          {point.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            )}
          </Card>

          <Card
            title="Top performing products"
            description="A ranked chart of the products generating the strongest revenue contribution."
          >
            {loading ? (
              <div className="h-[340px] animate-pulse rounded-3xl bg-slate-100" />
            ) : topProducts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-14 text-center text-sm text-slate-500">
                Product performance data is not available yet.
              </div>
            ) : (
              <div className="space-y-5">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Total contribution
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <p className="text-2xl font-semibold text-slate-950">
                      {formatCurrency(totalTopProductRevenue)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {topProducts.length} products tracked
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {topProducts.map((point, index) => {
                    const width = Math.max((point.value / maxTopProduct) * 100, 12);
                    const share =
                      totalTopProductRevenue > 0
                        ? ((point.value / totalTopProductRevenue) * 100).toFixed(1)
                        : "0.0";

                    return (
                      <div
                        key={point.label}
                        className="rounded-[24px] border border-slate-200 bg-white p-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-950">{point.label}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                                {share}% of tracked top-product revenue
                              </p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-slate-950">
                            {formatCurrency(point.value)}
                          </p>
                        </div>

                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,#0f172a_0%,#334155_100%)]"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </div>

        <Card
          title="Channel mix"
          description="Relative contribution by sales channel or acquisition source."
        >
          <div className="space-y-4">
            {channelBreakdown.map((point) => (
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
            {!loading && channelBreakdown.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
                Channel mix data is not available yet.
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    </AuthGuard>
  );
}
