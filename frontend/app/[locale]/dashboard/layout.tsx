"use client";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { DashboardHeader } from "@/components/dashboard/header";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function DashboardLayout({
  children,
  allowedRoles,
}: DashboardLayoutProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication and role permissions
  useEffect(() => {
    const checkAuth = async () => {
      if (!loading) {
        if (!isAuthenticated) {
          router.push("/auth/signin");
          return;
        }

        // Check if user has required role for the current route
        if (user) {
          const isStudentRoute = pathname.startsWith("/dashboard/student");
          const isInstructorRoute = pathname.startsWith("/dashboard/instructor");
          const isAdminRoute = pathname.startsWith("/dashboard/admin");
          const isGeneralDashboard = pathname === "/dashboard";

          // Admin can only access admin routes and general dashboard
          if (user.role === "admin") {
            if (isStudentRoute || isInstructorRoute) {
              router.push("/dashboard/admin");
              return;
            }
          }
          // Instructor can access instructor routes and general dashboard
          else if (user.role === "instructor") {
            if (isStudentRoute || isAdminRoute) {
              router.push("/dashboard/instructor");
              return;
            }
          }
          // Student can only access student routes and general dashboard
          else {
            if (isInstructorRoute || isAdminRoute) {
              router.push("/dashboard/student");
              return;
            }
          }
        }

        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [loading, isAuthenticated, user, pathname, router]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Show loading screen while checking authentication
  if (loading || isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium text-foreground">Loading dashboard...</p>
          <p className="text-sm text-muted-foreground mt-2">Please wait while we verify your access</p>
        </motion.div>
      </div>
    );
  }

  // Show unauthorized screen if user doesn't have required role
  if (user && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page. Please contact your administrator if you think this is a mistake.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <MobileSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            user={user}
          />
        )}
      </AnimatePresence>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <DashboardSidebar user={user} />
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} user={user} />

        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="py-8"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </motion.main>
      </div>
    </div>
  );
}