import { motion } from "framer-motion";
import { DashboardCard } from "./DashboardCard";
import { EmptyState } from "./EmptyState";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Users, Loader2 } from "lucide-react";

interface StudentEngagementSectionProps {
  engagementData: any[];
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
      <p className="text-sm text-gray-600">Loading engagement data...</p>
    </div>
  </div>
);

export function StudentEngagementSection({
  engagementData,
  isLoading = false,
}: StudentEngagementSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <DashboardCard
        title="Student Engagement"
        description="Course completion vs student engagement"
      >
        {isLoading ? (
          <ChartSkeleton />
        ) : engagementData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, ""]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <CustomLegend />
                <Bar
                  dataKey="completion"
                  name="Completion Rate"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  type="monotone"
                  dataKey="engagement"
                  name="Engagement Score"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState
            icon={<Users className="h-12 w-12" />}
            title="No engagement data"
            description="Engagement metrics will appear once students start progressing"
            compact
          />
        )}
      </DashboardCard>
    </motion.section>
  );
}