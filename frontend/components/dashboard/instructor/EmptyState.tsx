import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  compact?: boolean;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={`text-center ${compact ? "py-6" : "py-12"}`}>
      <div className="text-gray-300 mb-3 flex justify-center">{icon}</div>
      <h3 className="font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 max-w-sm mx-auto">
        {description}
      </p>
      {action}
    </div>
  );
}