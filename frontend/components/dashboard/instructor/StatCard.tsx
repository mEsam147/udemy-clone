import { motion } from "framer-motion";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle?: string;
  description?: string;
  trend?: number;
  color?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  icon,
  subtitle,
  description,
  trend,
  color = "from-blue-500 to-blue-600",
  delay,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group"
    >
      <Card
        className={cn(
          "border-0 shadow-lg hover:shadow-xl transition-all h-[30vh] duration-300 cursor-pointer",
          `bg-gradient-to-br ${color} text-white`
        )}
      >
        <CardTitle>
          <p className="text-white/90 text-xl font-bold text-center">
            {title}
          </p>
        </CardTitle>
        <CardContent className="px-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-baseline gap-2 ">
                <p className="text-2xl font-bold text-white">{value}</p>
                {trend !== undefined && trend > 0 && (
                  <div className="block w-full">
                    <span className="text-white/80  text-xs font-medium  flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />+{trend}%
                    </span>
                  </div>
                )}
              </div>
              {subtitle && (
                <p className="text-white/70 text-sm mb-1">{subtitle}</p>
              )}
              {description && (
                <p className="text-white/60 text-xs">{description}</p>
              )}
            </div>
            <div className="p-3 rounded-xl bg-white/20 group-hover:bg-white/30 transition-colors">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
