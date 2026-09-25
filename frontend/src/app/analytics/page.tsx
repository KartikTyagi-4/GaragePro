"use client";

import { useEffect, useState } from "react";

import {
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  Users,
  Wrench,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

import {
  api,
  DashboardResponse,
} from "@/lib/api";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function formatStatus(status: string) {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  ASSIGNED: "#3b82f6",
  ON_THE_WAY: "#8b5cf6",
  IN_PROGRESS: "#06b6d4",
  COMPLETED: "#22c55e",
  CANCELLED: "#ef4444",
};

const CATEGORY_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#16a34a",
  "#0891b2",
  "#ca8a04",
];

export default function AnalyticsPage() {
  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [refreshing, setRefreshing] =
    useState(false);

  const loadAnalytics = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const response =
        await api.getDashboard();

      setDashboard(response);
    } catch (err) {
      console.error(
        "Failed to load analytics:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load analytics data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();

    /*
     * Automatic refresh every 30 seconds.
     * This supports the assignment's
     * live operations dashboard requirement.
     */

    const interval = setInterval(() => {
      loadAnalytics(true);
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const overview = dashboard?.overview;

  const bookingsData =
    dashboard?.bookings_over_time ?? [];

  const revenueData =
    dashboard?.revenue_over_time ?? [];

  const statusData =
    dashboard?.booking_status ?? [];

  const serviceData =
    dashboard?.service_breakdown ?? [];

  const stats = [
    {
      title: "Total Bookings",
      value: overview?.total_bookings ?? 0,
      icon: CalendarDays,
      description: "All service bookings",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(
        overview?.total_revenue ?? 0
      ),
      icon: CircleDollarSign,
      description: "Completed booking revenue",
    },
    {
      title: "Completed",
      value: overview?.completed_bookings ?? 0,
      icon: CheckCircle2,
      description: "Successfully completed",
    },
    {
      title: "Active Mechanics",
      value: overview?.active_mechanics ?? 0,
      icon: Wrench,
      description: "Available or currently working",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-muted/30">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <Header />

          <main className="mx-auto max-w-[1800px] p-4 md:p-8">
            <div className="flex min-h-[70vh] flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />

              <h2 className="mt-5 text-xl font-semibold">
                Loading analytics
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Fetching live operational insights...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Header />

        <main className="mx-auto max-w-[1800px] p-4 md:p-8">

          {/* PAGE HEADER */}

          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-3">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Analytics
                </h1>

                <p className="mt-1 text-muted-foreground">
                  Live insights into bookings, revenue and operations.
                </p>
              </div>
            </div>

            <button
              onClick={() => loadAnalytics(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-lg border bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh Data
            </button>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
              <div className="flex items-start gap-3">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />

                <div>
                  <h3 className="font-semibold text-destructive">
                    Unable to load analytics
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {error}
                  </p>

                  <button
                    onClick={() => loadAnalytics()}
                    className="mt-3 text-sm font-medium text-primary hover:underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {!error && (
            <>
              {/* OVERVIEW CARDS */}

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.title}
                      className="rounded-xl border bg-background p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {stat.title}
                          </p>

                          <p className="mt-2 text-2xl font-bold">
                            {stat.value}
                          </p>
                        </div>

                        <div className="rounded-lg bg-primary/10 p-2.5">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* CHARTS ROW 1 */}

              <div className="mt-6 grid gap-6 xl:grid-cols-2">

                {/* BOOKINGS OVER TIME */}

                <div className="rounded-xl border bg-background p-5 shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold">
                      Bookings Over Time
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Booking volume during the last 14 days
                    </p>
                  </div>

                  <div className="h-[320px]">
                    {bookingsData.length > 0 ? (
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <LineChart
                          data={bookingsData}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            tickLine={false}
                            axisLine={false}
                            fontSize={12}
                          />

                          <YAxis
                            allowDecimals={false}
                            tickLine={false}
                            axisLine={false}
                            fontSize={12}
                          />

                          <Tooltip
                            labelFormatter={(value) =>
                              formatDate(
                                String(value)
                              )
                            }
                          />

                          <Line
                            type="monotone"
                            dataKey="bookings"
                            name="Bookings"
                            stroke="#2563eb"
                            strokeWidth={3}
                            dot={{
                              r: 4,
                            }}
                            activeDot={{
                              r: 6,
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyChart />
                    )}
                  </div>
                </div>

                {/* REVENUE OVER TIME */}

                <div className="rounded-xl border bg-background p-5 shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold">
                      Revenue Over Time
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Revenue from completed services
                    </p>
                  </div>

                  <div className="h-[320px]">
                    {revenueData.length > 0 ? (
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <AreaChart
                          data={revenueData}
                        >
                          <defs>
                            <linearGradient
                              id="revenueGradient"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#16a34a"
                                stopOpacity={0.35}
                              />

                              <stop
                                offset="95%"
                                stopColor="#16a34a"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>

                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            tickLine={false}
                            axisLine={false}
                            fontSize={12}
                          />

                          <YAxis
                            tickFormatter={(value) =>
                              `₹${value}`
                            }
                            tickLine={false}
                            axisLine={false}
                            fontSize={12}
                          />

                          <Tooltip
                            labelFormatter={(value) =>
                              formatDate(
                                String(value)
                              )
                            }
                            formatter={(value) => [
                              formatCurrency(
                                Number(value)
                              ),
                              "Revenue",
                            ]}
                          />

                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#16a34a"
                            strokeWidth={3}
                            fill="url(#revenueGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyChart />
                    )}
                  </div>
                </div>
              </div>

              {/* CHARTS ROW 2 */}

              <div className="mt-6 grid gap-6 xl:grid-cols-2">

                {/* BOOKING STATUS */}

                <div className="rounded-xl border bg-background p-5 shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold">
                      Booking Status
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Current distribution of booking statuses
                    </p>
                  </div>

                  <div className="h-[320px]">
                    {statusData.length > 0 ? (
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <PieChart>
                          <Pie
                            data={statusData}
                            dataKey="count"
                            nameKey="status"
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={105}
                            paddingAngle={3}
                          >
                            {statusData.map(
                              (entry, index) => (
                                <Cell
                                  key={`${entry.status}-${index}`}
                                  fill={
                                    STATUS_COLORS[
                                      entry.status
                                    ] ??
                                    CATEGORY_COLORS[
                                      index %
                                        CATEGORY_COLORS.length
                                    ]
                                  }
                                />
                              )
                            )}
                          </Pie>

                          <Tooltip
                            formatter={(value) => [
                              value,
                              "Bookings",
                            ]}
                            labelFormatter={(value) =>
                              formatStatus(
                                String(value)
                              )
                            }
                          />

                          <Legend
                            formatter={(value) =>
                              formatStatus(
                                String(value)
                              )
                            }
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyChart />
                    )}
                  </div>
                </div>

                {/* SERVICE BREAKDOWN */}

                <div className="rounded-xl border bg-background p-5 shadow-sm">
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold">
                      Service Breakdown
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Most frequently booked service categories
                    </p>
                  </div>

                  <div className="h-[320px]">
                    {serviceData.length > 0 ? (
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                      >
                        <BarChart
                          data={serviceData}
                          layout="vertical"
                          margin={{
                            left: 20,
                          }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={false}
                          />

                          <XAxis
                            type="number"
                            allowDecimals={false}
                            tickLine={false}
                            axisLine={false}
                            fontSize={12}
                          />

                          <YAxis
                            type="category"
                            dataKey="category"
                            width={110}
                            tickLine={false}
                            axisLine={false}
                            fontSize={12}
                          />

                          <Tooltip
                            formatter={(value) => [
                              value,
                              "Bookings",
                            ]}
                          />

                          <Bar
                            dataKey="count"
                            name="Bookings"
                            radius={[0, 6, 6, 0]}
                          >
                            {serviceData.map(
                              (_, index) => (
                                <Cell
                                  key={index}
                                  fill={
                                    CATEGORY_COLORS[
                                      index %
                                        CATEGORY_COLORS.length
                                    ]
                                  }
                                />
                              )
                            )}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <EmptyChart />
                    )}
                  </div>
                </div>
              </div>

              {/* ADDITIONAL OPERATIONAL INSIGHTS */}

              <div className="mt-6 grid gap-4 md:grid-cols-3">

                <div className="rounded-xl border bg-background p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-amber-500/10 p-2.5">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Pending Bookings
                      </p>

                      <p className="mt-1 text-xl font-bold">
                        {overview?.pending_bookings ?? 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border bg-background p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-red-500/10 p-2.5">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Cancelled Bookings
                      </p>

                      <p className="mt-1 text-xl font-bold">
                        {overview?.cancelled_bookings ?? 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border bg-background p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-500/10 p-2.5">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        New Customers Today
                      </p>

                      <p className="mt-1 text-xl font-bold">
                        {overview?.new_customers ?? 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <BarChart3 className="h-9 w-9 text-muted-foreground" />

      <p className="mt-3 text-sm font-medium">
        No analytics data available
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        Data will appear as bookings are created.
      </p>
    </div>
  );
}