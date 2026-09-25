import Link from "next/link";
import {
  ArrowRight,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { Booking } from "@/lib/api";

interface RecentBookingsProps {
  bookings: Booking[];
}

function getStatusVariant(status: string) {
  switch (status) {
    case "COMPLETED":
      return "default";

    case "CANCELLED":
      return "destructive";

    default:
      return "secondary";
  }
}

export function RecentBookings({
  bookings,
}: RecentBookingsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>
            Recent Bookings
          </CardTitle>

          <p className="mt-1 text-sm text-muted-foreground">
            Latest vehicle service requests
          </p>
        </div>

        <Link
          href="/bookings"
          className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
        >
          View all

          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 font-medium">
                  Booking
                </th>

                <th className="pb-3 font-medium">
                  Customer
                </th>

                <th className="pb-3 font-medium">
                  Vehicle
                </th>

                <th className="pb-3 font-medium">
                  Service
                </th>

                <th className="pb-3 font-medium">
                  Status
                </th>

                <th className="pb-3 text-right font-medium">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b transition-colors last:border-0 hover:bg-muted/40"
                >
                  <td className="py-4 font-medium">
                    {booking.booking_number}
                  </td>

                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4" />
                      </div>

                      <span>
                        {booking.customer.name}
                      </span>
                    </div>
                  </td>

                  <td className="py-4">
                    <div>
                      <p>
                        {booking.vehicle.brand}{" "}
                        {booking.vehicle.model}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {booking.vehicle.registration_number}
                      </p>
                    </div>
                  </td>

                  <td className="py-4">
                    {booking.service.name}
                  </td>

                  <td className="py-4">
                    <Badge
                      variant={
                        getStatusVariant(
                          booking.status
                        ) as
                          | "default"
                          | "secondary"
                          | "destructive"
                      }
                    >
                      {booking.status.replaceAll(
                        "_",
                        " "
                      )}
                    </Badge>
                  </td>

                  <td className="py-4 text-right font-medium">
                    ₹
                    {booking.amount.toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}