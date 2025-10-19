"use client";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api-client";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { InstructorDashboard } from "@/components/dashboard/instructor-dashboard";
import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AccessDenied } from "@/components/ui/access-denied";

export default function InstructorDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getCurrentUser();
        if (!userData) {
          redirect("/auth/signin");
        }
        // if (userData.role !== "instructor") {
        //   redirect("/dashboard");
        // }
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        redirect("/auth/signin");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (isLoading) {
    return (
      <LoadingSpinner message="Loading dashboard..." />
    );
  }

  if (!user) {
    return (
      <AccessDenied />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="container mx-auto px-4 py-8">
        <InstructorDashboard user={user} />
      </main>
    </div>
  );
}
}
