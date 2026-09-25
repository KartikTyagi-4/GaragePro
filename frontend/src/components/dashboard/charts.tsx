"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { DashboardData, StatusBreakdownItem } from "@/lib/api";

interface ChartsProps {
  data: DashboardData;
}

const COLORS = [
  "#2563eb",
  "#7c3aed",
  "#0891b2",
  "#16a34a",
  "#ea580c",
  "#dc2626",
];

function formatDate(date: string) {
  const [year, month, day] = date.split("-");

  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function Charts({ data }: ChartsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">

      {/* BOOKINGS OVER TIME */}

      <Card>
        <CardHeader>
          <CardTitle>
            Bookings Over Time
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-[300px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart
                data={data.bookings_over_time}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => formatDate(String(value))}
                />

                <YAxis
                  allowDecimals={false}
                />

                <Tooltip
                  labelFormatter={(label) => formatDate(String(label))}
                  formatter={(value) => [
                    value,
                    "Bookings",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6,
                  }}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>
        </CardContent>
      </Card>


      {/* REVENUE OVER TIME */}

      <Card>
        <CardHeader>
          <CardTitle>
            Revenue Over Time
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-[300px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={data.revenue_over_time}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => formatDate(String(value))}
                />

                <YAxis />

                <Tooltip
                  labelFormatter={(label) => formatDate(String(label))}
                  formatter={(value) => [
                    `₹${Number(value).toLocaleString(
                      "en-IN"
                    )}`,
                    "Revenue",
                  ]}
                />

                <Bar
                  dataKey="revenue"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>
        </CardContent>
      </Card>


      {/* BOOKING STATUS */}

      <Card>
        <CardHeader>
          <CardTitle>
            Booking Status
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-[300px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie 
  data={data.status_breakdown ?? []} 
  dataKey="count" 
  nameKey="status" 
  cx="50%" 
  cy="50%" 
  outerRadius={100} 
  label 
>
  {(data.status_breakdown ?? []).map(
    (_item: StatusBreakdownItem, index: number) => (
      <Cell
        key={`status-${index}`}
        fill={COLORS[index % COLORS.length]}
      />
    )
  )}
</Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          </div>
        </CardContent>
      </Card>


      {/* SERVICE CATEGORIES */}

      <Card>
        <CardHeader>
          <CardTitle>
            Service Categories
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-[300px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={data.service_breakdown}
                layout="vertical"
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  allowDecimals={false}
                />

                <YAxis
                  type="category"
                  dataKey="category"
                  width={110}
                />

                <Tooltip
                  formatter={(value) => [
                    value,
                    "Bookings",
                  ]}
                />

                <Bar
                  dataKey="count"
                  fill="#7c3aed"
                  radius={[0, 6, 6, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>
        </CardContent>
      </Card>

    </div>
  );
}