"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
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
import {
  Award,
  Download,
  Share2,
  Calendar,
  BookOpen,
  User,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function CertificateView() {
  const params = useParams();
  const router = useRouter();
  const verificationCode = params.verificationCode as string;
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["certificate", verificationCode],
    queryFn: () => certificateService.verifyCertificate(verificationCode),
    enabled: !!verificationCode,
  });

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Simulate download process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, you would download the PDF file
      const link = document.createElement('a');
      link.href = data?.data?.certificateUrl || '#';
      link.download = `certificate-${verificationCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success message
      // toast({
      //   title: "Download complete",
      //   description: "Your certificate has been downloaded",
      // });
    } catch (error) {
      console.error('Download failed:', error);
      // toast({
      //   title: "Download failed",
      //   description: "Please try again",
      //   variant: "destructive",
      // });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const shareUrl = `${window.location.origin}/certificates/verify/${verificationCode}`;
      const shareText = `Check out my certificate for completing ${data?.data?.course?.title} on Learnify!`;

      if (navigator.share) {
        await navigator.share({
          title: `${data?.data?.course?.title} - Certificate`,
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
    } finally {
      setIsSharing(false);
    }
  };

  if (isLoading) return <CertificateSkeleton />;
  if (error) return <CertificateError error={error} />;
  if (!data?.data) return <CertificateNotFound />;

  const certificate = data.data;
  const issueDate = new Date(certificate.issuedAt || certificate.createdAt);
  const formattedDate = issueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Certificates
        </Button>
      </motion.div>

      {/* Certificate Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-4xl mx-auto"
      >
        {/* Certificate Card */}
        <Card className="overflow-hidden">
          {/* Certificate Header */}
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary-foreground/20 rounded-full backdrop-blur-sm">
                  <Award className="h-8 w-8" />
                </div>
              </div>
              <CardTitle className="text-3xl mb-2">Certificate of Completion</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                This certifies that
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {/* Student Name */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-2">
                {certificate.student?.name || "Student Name"}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/60 mx-auto rounded-full"></div>
            </div>

            {/* Course Details */}
            <div className="text-center mb-8">
              <p className="text-lg text-muted-foreground mb-4">
                has successfully completed the course
              </p>
              <h3 className="text-2xl font-semibold mb-2">
                {certificate.course?.title || "Course Title"}
              </h3>
              {certificate.course?.instructor && (
                <p className="text-muted-foreground">
                  instructed by {certificate.course.instructor.name}
                </p>
              )}
            </div>

            {/* Certificate Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-muted rounded-lg">
              <div className="text-center">
                <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Issued On</p>
                <p className="font-semibold">{formattedDate}</p>
              </div>

              <div className="text-center">
                <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Verification Code</p>
                <p className="font-mono font-bold">{certificate.verificationCode}</p>
              </div>

              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Verified
                </Badge>
              </div>
            </div>

            {/* Verification Note */}
            <div className="text-center mb-8">
              <p className="text-sm text-muted-foreground">
                This certificate can be verified at:{" "}
                <Link
                  href={`/certificates/verify/${certificate.verificationCode}`}
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  {typeof window !== 'undefined' ? `${window.location.origin}/certificates/verify/${certificate.verificationCode}` : ''}
                </Link>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleDownload}
                disabled={isDownloading}
                className="min-w-[160px]"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handleShare}
                disabled={isSharing}
                className="min-w-[160px]"
              >
                {isSharing ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Share2 className="h-5 w-5 mr-2" />
                )}
                Share Certificate
              </Button>

              <Button
                size="lg"
                variant="outline"
                asChild
              >
                <Link href={`/certificates/verify/${certificate.verificationCode}`} target="_blank">
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Verify Link
                </Link>
              </Button>
            </div>
          </CardContent>

          {/* Certificate Footer */}
          <CardFooter className="bg-muted p-6 border-t">
            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground w-full">
              <div className="flex items-center gap-2 mb-2 sm:mb-0">
                <Award className="h-4 w-4 text-primary" />
                <span>Learnify Academy</span>
              </div>
              <div>
                Certificate ID: <span className="font-mono">{certificate.verificationCode}</span>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About This Certificate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                This certificate verifies the successful completion of the course and
                demonstrates the achievement of learning objectives. It can be shared
                on professional networks and included in portfolios.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                To verify this certificate, visit the verification link provided above.
                Employers and institutions can confirm the authenticity of this
                certificate using the unique verification code.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Skeleton for Certificate View
function CertificateSkeleton() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Skeleton className="h-10 w-32" />

      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="overflow-hidden">
          <Skeleton className="h-40 w-full" />
          <CardContent className="p-8 space-y-6">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
            <Skeleton className="h-8 w-2/3 mx-auto" />
            <div className="grid grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
            <div className="flex gap-4 justify-center">
              <Skeleton className="h-12 w-40" />
              <Skeleton className="h-12 w-40" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Error Component for Certificate View
function CertificateError({ error }: { error: Error }) {
  const router = useRouter();

  return (
    <div className="container mx-auto py-12 flex items-center justify-center">
      <div className="text-center max-w-md space-y-4">
        <Award className="h-16 w-16 text-destructive mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Certificate Not Found</h2>
          <p className="text-muted-foreground">
            We couldn't find the certificate you're looking for.
          </p>
        </div>
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
          {error.message}
        </div>
        <Button onClick={() => router.push('/dashboard/student/certificates')}>
          Back to Certificates
        </Button>
      </div>
    </div>
  );
}

// Not Found Component
function CertificateNotFound() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-12 flex items-center justify-center">
      <div className="text-center max-w-md space-y-4">
        <Award className="h-16 w-16 text-muted-foreground mx-auto" />
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Certificate Not Available</h2>
          <p className="text-muted-foreground">
            The requested certificate is not available.
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/student/certificates')}>
          View My Certificates
        </Button>
      </div>
    </div>
  );
}
