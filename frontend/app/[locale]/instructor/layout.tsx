"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role !== "instructor") {
      router.push(
        user?.role === "student"
          ? "/dashboard"
          : user?.role === "admin"
          ? "/admin"
          : "/auth/signin"
      );
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <DashboardHeader />
      <main className="container mx-auto p-4">{children}</main>
    </>
  );
}
