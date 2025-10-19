import { motion } from "framer-motion";
import { DashboardCard } from "./DashboardCard";
import { Button } from "@/components/ui/button";
import {
  Plus,
  TrendingUp,
  Users,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

interface QuickActionsSectionProps {
  totalStudents: number;
}

export function QuickActionsSection({ totalStudents }: QuickActionsSectionProps) {
  const actions = [
    {
      icon: Plus,
      label: "Create New Course",
      description: "Start teaching today",
      href: "/instructor/create-course",
    },
    {
      icon: TrendingUp,
      label: "View Analytics",
      description: "Detailed insights",
      href: "/instructor/analytics",
    },
    {
      icon: Users,
      label: "Manage Students",
      description: `${totalStudents} enrolled`,
      href: "/instructor/students",
    },
    {
      icon: MessageSquare,
      label: "Join Community",
      description: "Connect with instructors",
      href: "/instructor/community",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 }}
    >
      <DashboardCard title="Quick Actions">
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Button
              key={action.label}
              variant="outline"
              className="w-full justify-start h-12 text-left"
              asChild
            >
              <Link href={action.href}>
                <action.icon className="h-4 w-4 mr-3" />
                <div>
                  <div className="font-medium">{action.label}</div>
                  <div className="text-xs text-gray-500">{action.description}</div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </DashboardCard>
    </motion.div>
  );
}