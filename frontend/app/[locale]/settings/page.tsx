import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AccountSettings } from "@/components/settings/account-settings";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Settings - Mini Udemy",
  description: "Manage your Mini Udemy account settings",
};

export default function SettingsPage() {
  // TODO: Replace with actual auth check
  const isAuthenticated = true;
  const userData = {
    id: "user-1",
    email: "john.doe@example.com",
    full_name: "John Doe",
    avatar_url: "/placeholder.svg",
    role: "student" as const,
    created_at: "2023-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
  };

  if (!isAuthenticated) {
    redirect("/auth/signin?callbackUrl=/settings");
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<div>Loading...</div>}>
          <AccountSettings user={userData} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
