"use client";

import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { certificateService } from "@/services/certificate.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Award,
  Download,
  Eye,
  Share2,
  Calendar,
  BookOpen,
  User,
  Filter,
  Search,
  GraduationCap,
  Loader2,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function Certificates() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["certificates"],
    queryFn: certificateService.getUserCertificates,
    select: (res) => res?.data || [],
  });

  // Handle certificate download
  const handleDownload = async (certificate: any) => {
    setDownloadingId(certificate._id);
    try {
      // Simulate download process
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In real implementation, download the PDF
      console.log('Downloading certificate:', certificate._id);

      // Show success message
      // toast({
      //   title: "Download started",
      //   description: "Your certificate is being downloaded",
      // });
    } catch (error) {
      console.error('Download failed:', error);
      // toast({
      //   title: "Download failed",
      //   description: "Please try again",
      //   variant: "destructive",
      // });
    } finally {
      setDownloadingId(null);
    }
  };

  // Handle certificate share
  const handleShare = async (certificate: any) => {
    const shareUrl = `${window.location.origin}/certificates/verify/${certificate.verificationCode}`;
    const shareText = `Check out my certificate for completing ${certificate.course?.title} on Learnify!`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${certificate.course?.title} - Certificate`,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        // toast({
        //   title: "Link copied!",
        //   description: "Certificate link copied to clipboard",
        // });
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  // Filter and sort certificates
  const filteredCertificates = useMemo(() => {
    if (!data) return [];

    let filtered = data;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(cert =>
        cert.course?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cert.verificationCode?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.issuedAt || b.createdAt).getTime() - new Date(a.issuedAt || a.createdAt).getTime();
        case "oldest":
          return new Date(a.issuedAt || a.createdAt).getTime() - new Date(b.issuedAt || b.createdAt).getTime();
        case "course":
          return (a.course?.title || '').localeCompare(b.course?.title || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [data, searchQuery, sortBy]);

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState error={error} />;

  const certificates = filteredCertificates;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">My Certificates</h1>
        </div>
        <p className="text-muted-foreground">
          {certificates.length === 0
            ? "Complete courses to earn certificates"
            : `You've earned ${certificates.length} certificate${certificates.length === 1 ? '' : 's'}`
          }
        </p>
      </div>

      {/* Filters and Search */}
      {certificates.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 w-full sm:max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search certificates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="course">Course Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Info */}
      {certificates.length > 0 && searchQuery && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{certificates.length} results for</span>
          <Badge variant="secondary">"{searchQuery}"</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="h-auto p-0 text-primary hover:bg-transparent"
          >
            Clear
          </Button>
        </div>
      )}

      {/* Certificates Grid */}
      <AnimatePresence mode="wait">
        {certificates.length > 0 ? (
          <motion.div
            key="certificates-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {certificates.map((certificate, index) => (
              <CertificateCard
                key={certificate._id}
                certificate={certificate}
                index={index}
                onDownload={handleDownload}
                onShare={handleShare}
                isDownloading={downloadingId === certificate._id}
                onView={() => router.push(`/dashboard/student/certificates/${certificate.verificationCode}`)}
              />
            ))}
          </motion.div>
        ) : (
          <EmptyCertificatesState />
        )}
      </AnimatePresence>
    </div>
  );
}

// Certificate Card Component
function CertificateCard({
  certificate,
  index,
  onDownload,
  onShare,
  isDownloading,
  onView
}: {
  certificate: any;
  index: number;
  onDownload: (cert: any) => void;
  onShare: (cert: any) => void;
  isDownloading: boolean;
  onView: () => void;
}) {
  const issueDate = new Date(certificate.issuedAt || certificate.createdAt);
  const formattedDate = issueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow group">
        {/* Certificate Header */}
        <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/10 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1)_0px,transparent_50%)]"></div>

          {/* Certificate Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Award className="h-12 w-12 text-primary/30" />
          </div>

          {/* Course Title */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/80 to-transparent">
            <h3 className="font-semibold text-sm line-clamp-2">
              {certificate.course?.title || "Course Certificate"}
            </h3>
          </div>

          {/* Verification Badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-background/95 backdrop-blur-sm">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Certificate Details */}
          <div className="space-y-3 mb-4 flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Issued {formattedDate}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span>Course Completion</span>
            </div>

            {certificate.course?.instructor && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>By {certificate.course.instructor.name}</span>
              </div>
            )}
          </div>

          {/* Verification Code */}
          {certificate.verificationCode && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Verification Code</p>
              <p className="font-mono text-sm font-bold">
                {certificate.verificationCode}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button
            size="sm"
            onClick={onView}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onDownload(certificate)}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onShare(certificate)}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

// Empty Certificates State
function EmptyCertificatesState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <div className="max-w-md mx-auto space-y-6">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
          <Award className="h-10 w-10 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold">No Certificates Yet</h3>
          <p className="text-muted-foreground">
            Complete courses to earn certificates and showcase your achievements!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/dashboard/student/my_learning">
              <BookOpen className="h-4 w-4 mr-2" />
              Continue Learning
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/courses">
              <GraduationCap className="h-4 w-4 mr-2" />
              Browse Courses
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-sm">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            <div>Complete Courses</div>
          </div>

          <div className="text-center space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Award className="h-4 w-4 text-primary" />
            </div>
            <div>Earn Certificates</div>
          </div>

          <div className="text-center space-y-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Share2 className="h-4 w-4 text-primary" />
            </div>
            <div>Share Achievements</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Error State Component
function ErrorState({ error }: { error: Error }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <div className="max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <Award className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Unable to load certificates</h3>
          <p className="text-muted-foreground">
            We encountered an error while loading your certificates
          </p>
        </div>
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
          {error.message}
        </div>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    </motion.div>
  );
}

// Skeleton Loading
function PageSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Filters Skeleton */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Certificates Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-24 w-full" />
            <CardContent className="p-4 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-16 w-full mt-2" />
            </CardContent>
            <CardFooter className="p-4 pt-0 flex gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-9" />
              <Skeleton className="h-9 w-9" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
