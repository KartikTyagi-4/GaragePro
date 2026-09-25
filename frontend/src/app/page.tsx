"use client";

import { useQuery } from "@tanstack/react-query";
import {
  RefreshCw,
  Wifi,
  WifiOff,
} from "lucide-react";

import { api } from "@/lib/api";

import {
  Sidebar,
} from "@/components/layout/sidebar";

import {
  Header,
} from "@/components/layout/header";

import {
  OverviewCards,
} from "@/components/dashboard/overview-cards";

import {
  Charts,
} from "@/components/dashboard/charts";

import {
  RecentBookings,
} from "@/components/dashboard/recent-bookings";

import {
  Button,
} from "@/components/ui/button";

function getErrorMessage(
  error: unknown
): string {
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "An unexpected error occurred while loading the dashboard.";
}

export default function Home() {
  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],

    queryFn: () =>
      api.getDashboard(),

    refetchInterval: 30000,

    refetchOnWindowFocus: true,
  });

  const bookingsQuery = useQuery({
    queryKey: ["recent-bookings"],

    queryFn: () =>
      api.getRecentBookings(),

    refetchInterval: 30000,

    refetchOnWindowFocus: true,
  });

  const isLoading =
    dashboardQuery.isLoading ||
    bookingsQuery.isLoading;

  const isError =
    dashboardQuery.isError ||
    bookingsQuery.isError;

  const isRefreshing =
    dashboardQuery.isFetching ||
    bookingsQuery.isFetching;

  const refreshData = async () => {
    await Promise.allSettled([
      dashboardQuery.refetch(),
      bookingsQuery.refetch(),
    ]);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 animate-spin text-primary" />

          <p className="mt-4 text-sm text-muted-foreground">
            Loading live operations...
          </p>
        </div>
      </div>
    );
  }

  if (
    isError ||
    !dashboardQuery.data ||
    !bookingsQuery.data
  ) {
    const error =
      dashboardQuery.error ||
      bookingsQuery.error;

    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <WifiOff className="h-6 w-6 text-destructive" />
          </div>

          <h2 className="mt-5 text-2xl font-bold">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            {getErrorMessage(error)}
          </p>

          <p className="mt-3 text-sm text-muted-foreground">
            Make sure the backend is running and
            <code className="mx-1 rounded bg-muted px-1 py-0.5">
              NEXT_PUBLIC_API_URL
            </code>
            is configured correctly.
          </p>

          <Button
            className="mt-6"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                isRefreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            {isRefreshing
              ? "Retrying..."
              : "Try Again"}
          </Button>
        </div>
      </div>
    );
  }

  const dashboard =
    dashboardQuery.data;

  const bookings =
    bookingsQuery.data.data || [];

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />

      <div className="min-w-0 flex-1">
        <Header />

        <main className="mx-auto max-w-[1800px] space-y-8 p-4 md:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  GaragePro Command Center
                </h1>

                <div className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-600">
                  <Wifi className="h-3 w-3" />

                  Live
                </div>
              </div>

              <p className="mt-2 text-muted-foreground">
                A focused view of workshop demand, field teams and service performance.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={refreshData}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  isRefreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              {isRefreshing
                ? "Refreshing..."
                : "Refresh"}
            </Button>
          </div>

          <OverviewCards
            overview={
              dashboard.overview
            }
          />

          <Charts
            data={dashboard}
          />

          <RecentBookings
            bookings={bookings}
          />
        </main>
      </div>
    </div>
  );
}