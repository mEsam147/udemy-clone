import { motion } from "framer-motion";
import { DashboardCard } from "./DashboardCard";
import { EmptyState } from "./EmptyState";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { TrendingUp, DollarSign, BarChart3, PieChart as PieChartIcon, Download, Loader2 } from "lucide-react";
import { CATEGORY_COLORS } from "./constants";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnalyticsTabsSectionProps {
  enrollmentTrends: any[];
  categoryData: any[];
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  isLoading?: boolean;
}

const CustomLegend = (props: any) => {
  const { payload } = props;
  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={`item-${index}`} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600">{entry?.value}</span>
        </div>
      ))}
    </div>
  );
};

const ChartSkeleton = () => (
  <div className="h-80 flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
      <p className="text-sm text-gray-600">Loading chart data...</p>
    </div>
  </div>
);

export function AnalyticsTabsSection({
  enrollmentTrends,
  categoryData,
  timeRange,
  onTimeRangeChange,
  isLoading = false,
}: AnalyticsTabsSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Tabs defaultValue="enrollments" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger
              value="enrollments"
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Enrollment Trends
            </TabsTrigger>
            <TabsTrigger
              value="revenue"
              className="flex items-center gap-2"
            >
              <DollarSign className="h-4 w-4" />
              Revenue Analytics
            </TabsTrigger>
          </TabsList>
       <div className="flex items-center gap-2">
      <Select value={timeRange} onValueChange={onTimeRangeChange}>
        <SelectTrigger className="w-[180px] text-sm">
          <SelectValue placeholder="Select time range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7d">Last 7 Days</SelectItem>
          <SelectItem value="30d">Last 30 Days</SelectItem>
          <SelectItem value="90d">Last 90 Days</SelectItem>
          <SelectItem value="1y">Last Year</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4" />
      </Button>
    </div>
        </div>

        <TabsContent value="enrollments">
          <DashboardCard
            title="Enrollment & Revenue Trends"
            description="Student enrollment and revenue over time"
          >
            {isLoading ? (
              <ChartSkeleton />
            ) : enrollmentTrends.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={enrollmentTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                    <XAxis
                      dataKey="month"
                      stroke="#64748b"
                      fontSize={12}
                      tickFormatter={(value) => {
                        if (typeof value === "string" && value.includes("202")) {
                          return value.slice(5);
                        }
                        return value;
                      }}
                    />
                    <YAxis
                      yAxisId="left"
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#64748b"
                      fontSize={12}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "revenue")
                          return [`$${value}`, "Revenue"];
                        return [value, "Enrollments"];
                      }}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <CustomLegend />
                    <Bar
                      yAxisId="left"
                      dataKey="enrollments"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      name="Enrollments"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      name="Revenue"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                icon={<BarChart3 className="h-12 w-12" />}
                title="No enrollment data"
                description="Enrollment trends will appear once students start joining your courses"
                compact
              />
            )}
          </DashboardCard>
        </TabsContent>

        <TabsContent value="revenue">
          <DashboardCard
            title="Revenue Distribution"
            description="Revenue breakdown by category"
          >
            {isLoading ? (
              <ChartSkeleton />
            ) : categoryData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="totalRevenue"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={40}
                      label={({ _id, totalRevenue }) =>
                        `${_id}: $${totalRevenue?.toFixed(2) || '0.00'}`
                      }
                      labelLine={false}
                    >
                      {categoryData.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            CATEGORY_COLORS[
                              index % CATEGORY_COLORS.length
                            ]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [
                        `$${value?.toFixed(2) || '0.00'}`,
                        "Revenue",
                      ]}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <CustomLegend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                icon={<PieChartIcon className="h-12 w-12" />}
                title="No revenue data"
                description="Revenue distribution will appear once you start earning"
                compact
              />
            )}
          </DashboardCard>
        </TabsContent>
      </Tabs>
    </motion.section>
  );
}