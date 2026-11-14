"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ChartType = "area" | "bar" | "line" | "pie" | "donut";

export interface AnalyticsChartProps {
  type: ChartType;
  data: any[];
  title: string;
  subtitle?: string;
  dataKey?: string;
  categoryKey?: string;
  height?: number;
  colors?: string[];
  className?: string;
  series?: Array<{ key: string; name: string; color: string }>;
}

const DEFAULT_COLORS = [
  "#1D4ED8", // Primary blue
  "#059669", // Secondary emerald
  "#D97706", // Tertiary amber
  "#6366F1", // Indigo
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#0EA5E9", // Sky
];

export function AnalyticsChart({
  type,
  data = [],
  title,
  subtitle,
  dataKey = "value",
  categoryKey = "name",
  height = 300,
  colors = DEFAULT_COLORS,
  className,
  series,
}: AnalyticsChartProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const renderChart = () => {
    if (!isMounted) {
      return (
        <div
          style={{ height }}
          className="flex items-center justify-center bg-neutral-50/50 dark:bg-neutral-900/50 rounded-xl"
        >
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div
          style={{ height }}
          className="flex items-center justify-center text-xs text-neutral-400 bg-neutral-50/50 dark:bg-neutral-900/50 rounded-xl"
        >
          No analytics data available for this range.
        </div>
      );
    }

    switch (type) {
      case "area":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {(series || [{ key: dataKey, color: colors[0], name: title }]).map((s, idx) => (
                  <linearGradient
                    key={s.key}
                    id={`gradient-${s.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={s.color || colors[idx % colors.length]} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={s.color || colors[idx % colors.length]} stopOpacity={0.0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey={categoryKey} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                  border: "none",
                }}
              />
              {series ? (
                <>
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  {series.map((s, idx) => (
                    <Area
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.name}
                      stroke={s.color || colors[idx % colors.length]}
                      fill={`url(#gradient-${s.key})`}
                      strokeWidth={2}
                    />
                  ))}
                </>
              ) : (
                <Area
                  type="monotone"
                  dataKey={dataKey}
                  stroke={colors[0]}
                  fill={`url(#gradient-${dataKey})`}
                  strokeWidth={2}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey={categoryKey} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                  border: "none",
                }}
              />
              {series ? (
                <>
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  {series.map((s, idx) => (
                    <Line
                      key={s.key}
                      type="monotone"
                      dataKey={s.key}
                      name={s.name}
                      stroke={s.color || colors[idx % colors.length]}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  ))}
                </>
              ) : (
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke={colors[0]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey={categoryKey} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                  border: "none",
                }}
              />
              {series ? (
                <>
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  {series.map((s, idx) => (
                    <Bar
                      key={s.key}
                      dataKey={s.key}
                      name={s.name}
                      fill={s.color || colors[idx % colors.length]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </>
              ) : (
                <Bar dataKey={dataKey} fill={colors[0]} radius={[4, 4, 0, 0]}>
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
      case "donut":
        const innerRadius = type === "donut" ? "55%" : 0;
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                dataKey={dataKey}
                nameKey={categoryKey}
                cx="50%"
                cy="50%"
                outerRadius="80%"
                innerRadius={innerRadius}
                paddingAngle={type === "donut" ? 3 : 0}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "12px",
                  border: "none",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={cn("overflow-hidden border border-neutral-200/90 dark:border-neutral-800", className)}>
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </CardTitle>
        {subtitle && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {subtitle}
          </p>
        )}
      </CardHeader>
      <CardContent className="p-5 pt-3">
        {renderChart()}
      </CardContent>
    </Card>
  );
}

export default AnalyticsChart;
