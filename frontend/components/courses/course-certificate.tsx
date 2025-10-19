"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Course, User } from "@/lib/types";

interface CourseCertificateProps {
  course: Course;
  user: User;
  completionDate: string;
  certificateId: string;
  baseUrl: string;
}

export function CourseCertificate({
  course,
  user,
  completionDate,
  certificateId,
  baseUrl,
}: CourseCertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const verificationUrl = `${baseUrl}/verify-certificate/${certificateId}`;

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(certificateRef.current, {
        quality: 1.0,
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `certificate-${certificateId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating certificate:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="flex justify-end mb-4">
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download Certificate
            </Button>
          </div>

          <motion.div
            ref={certificateRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative bg-[url('/certificate-bg.jpg')] bg-cover bg-center p-16 rounded-lg shadow-lg"
          >
            {/* Certificate Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-serif font-bold text-brand-primary mb-2">
                Certificate of Completion
              </h1>
              <p className="text-lg text-muted-foreground">
                This certificate is proudly presented to
              </p>
            </div>

            {/* Certificate Body */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold mb-8">
                {user.full_name}
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                for successfully completing the course
              </p>
              <h3 className="text-2xl font-serif font-bold text-brand-primary mb-8">
                {course.title}
              </h3>
              <p className="text-md text-muted-foreground">
                Completed on {new Date(completionDate).toLocaleDateString()}
              </p>
            </div>

            {/* Certificate Footer */}
            <div className="flex items-center justify-between mt-12">
              <div>
                <img
                  src="/signature.png"
                  alt="Instructor Signature"
                  className="h-16 mb-2"
                />
                <p className="text-sm font-medium">
                  {course.instructor.full_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Course Instructor
                </p>
              </div>

              <div className="text-center">
                <div className="mb-2">
                  <QRCode
                    value={verificationUrl}
                    size={80}
                    level="M"
                    className="mx-auto"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Certificate ID: {certificateId}
                </p>
                <p className="text-xs text-muted-foreground">
                  Verify at: {verificationUrl}
                </p>
              </div>

              <div>
                <img
                  src="/platform-logo.png"
                  alt="Platform Logo"
                  className="h-16 mb-2"
                />
                <p className="text-sm font-medium">Mini Udemy</p>
                <p className="text-sm text-muted-foreground">
                  Online Learning Platform
                </p>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>

      {/* Certificate Details */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">About this Certificate</h3>
          <div className="grid gap-4 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Student Name:</span>
              <span className="font-medium">{user.full_name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Course:</span>
              <span className="font-medium">{course.title}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Instructor:</span>
              <span className="font-medium">{course.instructor.full_name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Completion Date:</span>
              <span className="font-medium">
                {new Date(completionDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Certificate ID:</span>
              <span className="font-medium">{certificateId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Verification URL:</span>
              <a
                href={verificationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-primary hover:underline"
              >
                Verify Certificate
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
