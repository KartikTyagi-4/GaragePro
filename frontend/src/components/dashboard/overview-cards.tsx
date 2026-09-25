import {
  CalendarDays,
  CheckCircle2,
  Clock,
  XCircle,
  IndianRupee,
  Wrench,
  Users,
  TrendingUp,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { DashboardData } from "@/lib/api";

interface OverviewCardsProps {
  overview: DashboardData["overview"];
}

export function OverviewCards({
  overview,
}: OverviewCardsProps) {
  const cards = [
    {
      title: "Total Bookings",
      value: overview.total_bookings.toLocaleString(),
      icon: CalendarDays,
      description: "All time bookings",
    },
    {
      title: "Today's Bookings",
      value: overview.today_bookings.toLocaleString(),
      icon: TrendingUp,
      description: "Scheduled today",
    },
    {
      title: "Completed",
      value: overview.completed_bookings.toLocaleString(),
      icon: CheckCircle2,
      description: "Successfully completed",
    },
    {
      title: "Pending",
      value: overview.pending_bookings.toLocaleString(),
      icon: Clock,
      description: "Awaiting assignment",
    },
    {
      title: "Cancelled",
      value: overview.cancelled_bookings.toLocaleString(),
      icon: XCircle,
      description: "Cancelled bookings",
    },
    {
      title: "Revenue",
      value: `₹${Math.round(
        overview.total_revenue
      ).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      description: "Completed bookings revenue",
    },
    {
      title: "Active Mechanics",
      value: overview.active_mechanics.toLocaleString(),
      icon: Wrench,
      description: "Available or on job",
    },
    {
      title: "New Customers",
      value: overview.new_customers.toLocaleString(),
      icon: Users,
      description: "Joined today",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            className="transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm text-muted-foreground">
                  {card.title}
                </p>

                <p className="mt-1 text-2xl font-bold tracking-tight">
                  {card.value}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {card.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}