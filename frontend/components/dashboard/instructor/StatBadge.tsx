import { Badge } from "@/components/ui/badge";

interface StatBadgeProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: number;
}

export function StatBadge({ icon, value, label, trend }: StatBadgeProps) {
  return (
    <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
      {icon}
      <div>
        <span className="font-semibold">{value}</span>
        <span className="text-blue-200 text-sm ml-1">{label}</span>
      </div>
      {trend !== undefined && (
        <Badge
          variant={trend >= 0 ? "default" : "destructive"}
          className="text-xs bg-white/20 text-white border-0"
        >
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </Badge>
      )}
    </div>
  );
}