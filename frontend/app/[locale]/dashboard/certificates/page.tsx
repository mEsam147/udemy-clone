"use client";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api-client";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AccessDenied } from "@/components/ui/access-denied";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Award, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  issueDate: string;
  thumbnailUrl: string;
}

export default function CertificatesPage() {
  const [user, setUser] = useState<any>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getCurrentUser();
        if (!userData) {
          redirect("/auth/signin");
        }
        setUser(userData);
        // TODO: Implement getCertificates API call
        setCertificates([]);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        redirect("/auth/signin");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner message="Loading certificates..." />;
  }

  if (!user) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Certificates</h1>
          <p className="text-muted-foreground">
            View and download your earned certificates
          </p>
        </div>

        {certificates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Award className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                No Certificates Yet
              </h2>
              <p className="text-muted-foreground text-center mb-6">
                Complete courses to earn certificates and showcase your
                achievements
              </p>
              <Button asChild>
                <a href="/courses">Browse Courses</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert) => (
              <Card key={cert.id} className="overflow-hidden group">
                <div className="relative aspect-[1.4/1]">
                  <Image
                    src={cert.thumbnailUrl}
                    alt={`Certificate for ${cert.courseName}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">
                    {cert.courseName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Issued on {new Date(cert.issueDate).toLocaleDateString()}
                  </p>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
