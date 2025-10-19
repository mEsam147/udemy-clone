// // pages/success.tsx - FIXED VERSION
// "use client";

// import { useEffect, useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { CheckCircle, Loader2, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
// import { paymentService } from '@/services/payment.service';

// export default function SuccessPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const sessionId = searchParams.get('session_id');
//   const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
//   const [message, setMessage] = useState('Verifying your payment...');
//   const [enrollmentData, setEnrollmentData] = useState<any>(null);

//   useEffect(() => {
//     const verifyPaymentAndEnroll = async () => {
//       if (!sessionId) {
//         setStatus('error');
//         setMessage('No payment session found. Please contact support.');
//         return;
//       }

//       try {
//         setMessage('Verifying payment with Stripe...');

//         // Step 1: Retrieve the session to get courseId
//         const session = await paymentService.retrieveCheckoutSession(sessionId);

//         if (!session.success) {
//           throw new Error('Failed to retrieve payment session');
//         }

//         const courseId = session.data.metadata?.courseId;

//         if (!courseId) {
//           throw new Error('Course information not found in payment session');
//         }

//         setMessage('Creating your enrollment...');

//         // Step 2: Verify and create enrollment using the payment service
//         const result = await paymentService.verifyAndCreateEnrollment(sessionId);

//         console.log('Enrollment result:', result);

//         if (result.success) {
//           setStatus('success');
//           setEnrollmentData(result.data);
//           setMessage('Payment successful! You are now enrolled in the course.');

//           // Redirect to course page after short delay
//           setTimeout(() => {
//             if (result.data?.course) {
//               router.push(`/courses/${result.data.course}`);
//             } else {
//               router.push('/courses');
//             }
//           }, 3000);
//         } else {
//           setStatus('error');
//           setMessage(result.message || 'Failed to create enrollment. Please try again.');
//         }
//       } catch (error: any) {
//         console.error('Payment verification error:', error);
//         setStatus('error');
//         setMessage(error.message || 'An unexpected error occurred during enrollment.');
//       }
//     };

//     verifyPaymentAndEnroll();
//   }, [sessionId, router]);

//   const handleRetry = async () => {
//     if (!sessionId) return;

//     setStatus('processing');
//     setMessage('Retrying enrollment...');

//     try {
//       const result = await paymentService.verifyAndCreateEnrollment(sessionId);

//       if (result.success) {
//         setStatus('success');
//         setMessage('Success! Enrollment created.');
//         setTimeout(() => router.push('/courses'), 2000);
//       } else {
//         setStatus('error');
//         setMessage(result.message || 'Still failing. Please contact support.');
//       }
//     } catch (error: any) {
//       setStatus('error');
//       setMessage(error.message || 'Retry failed');
//     }
//   };

//   const handleGoToCourses = () => {
//     router.push('/courses');
//   };

//   const handleViewCourse = () => {
//     if (enrollmentData?.course) {
//       router.push(`/courses/${enrollmentData.course}`);
//     } else {
//       router.push('/courses');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background p-4">
//       <Card className="w-full max-w-md">
//         <CardContent className="pt-6">
//           <div className="text-center">
//             {status === 'processing' && (
//               <>
//                 <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
//                 <h2 className="text-2xl font-bold mb-2">Completing Enrollment</h2>
//                 <p className="text-muted-foreground">{message}</p>
//               </>
//             )}

//             {status === 'success' && (
//               <>
//                 <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
//                 <h2 className="text-2xl font-bold mb-2">Welcome Aboard!</h2>
//                 <p className="text-muted-foreground mb-6">{message}</p>
//                 <div className="space-y-2">
//                   <Button onClick={handleViewCourse} className="w-full">
//                     <ExternalLink className="w-4 h-4 mr-2" />
//                     Start Learning
//                   </Button>
//                   <Button onClick={handleGoToCourses} variant="outline" className="w-full">
//                     Browse All Courses
//                   </Button>
//                   <p className="text-xs text-muted-foreground">
//                     Redirecting to course in 3 seconds...
//                   </p>
//                 </div>
//               </>
//             )}

//             {status === 'error' && (
//               <>
//                 <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
//                 <h2 className="text-2xl font-bold mb-2">Almost There!</h2>
//                 <p className="text-muted-foreground mb-4">{message}</p>
//                 <p className="text-sm text-muted-foreground mb-6">
//                   Your payment was successful but we encountered an issue with enrollment.
//                 </p>
//                 <div className="space-y-2">
//                   <Button onClick={handleRetry} className="w-full">
//                     <RefreshCw className="w-4 h-4 mr-2" />
//                     Retry Enrollment
//                   </Button>
//                   <Button onClick={handleGoToCourses} variant="outline" className="w-full">
//                     Check My Courses
//                   </Button>
//                   <p className="text-xs text-muted-foreground">
//                     If this persists, please contact support with your payment receipt.
//                   </p>
//                 </div>
//               </>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// pages/success.tsx - UPDATED VERSION FOR BOTH COURSES AND SUBSCRIPTIONS
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Loader2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Crown,
  Users,
} from "lucide-react";
import { paymentService } from "@/services/payment.service";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const planId = searchParams.get("plan");
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [message, setMessage] = useState("Verifying your payment...");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus("error");
        setMessage("No payment session found. Please contact support.");
        return;
      }

      try {
        // If it's a subscription plan (has planId)
        if (planId) {
          setMessage("Verifying your subscription...");

          // Verify subscription plan
          const result = await paymentService.verifySubscription(sessionId);

          if (result.success) {
            setStatus("success");
            setData(result.subscription);
            setMessage(`Success! You're now on the ${planId} plan.`);
          } else {
            setStatus("error");
            setMessage(result.message || "Failed to verify subscription.");
          }
        }
        // If it's a course enrollment (no planId)
        else {
          setMessage("Verifying payment with Stripe...");

          // Step 1: Retrieve the session to get courseId
          const session = await paymentService.retrieveCheckoutSession(
            sessionId
          );

          if (!session.success) {
            throw new Error("Failed to retrieve payment session");
          }

          const courseId = session.data.metadata?.courseId;

          if (!courseId) {
            throw new Error("Course information not found in payment session");
          }

          setMessage("Creating your enrollment...");

          // Step 2: Verify and create enrollment
          const result = await paymentService.verifyAndCreateEnrollment(
            sessionId
          );

          console.log("Enrollment result:", result);

          if (result.success) {
            setStatus("success");
            setData(result.data);
            setMessage(
              "Payment successful! You are now enrolled in the course."
            );
          } else {
            setStatus("error");
            setMessage(
              result.message || "Failed to create enrollment. Please try again."
            );
          }
        }
      } catch (error: any) {
        console.error("Payment verification error:", error);
        setStatus("error");
        setMessage(error.message || "An unexpected error occurred.");
      }
    };

    verifyPayment();
  }, [sessionId, planId, router]);

  const handleRetry = async () => {
    if (!sessionId) return;

    setStatus("processing");
    setMessage("Retrying...");

    try {
      let result;

      if (planId) {
        result = await paymentService.verifySubscription(sessionId);
      } else {
        result = await paymentService.verifyAndCreateEnrollment(sessionId);
      }

      if (result.success) {
        setStatus("success");
        setMessage(planId ? "Subscription activated!" : "Enrollment created!");
      } else {
        setStatus("error");
        setMessage(result.message || "Retry failed.");
      }
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message || "Retry failed");
    }
  };

  const getSuccessActions = () => {
    if (planId) {
      // Subscription success actions
      return (
        <div className="space-y-3">
          <Button
            onClick={() => router.push("/courses")}
            className="w-full"
            size="lg"
          >
            <Crown className="w-4 h-4 mr-2" />
            Browse Premium Courses
          </Button>
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            className="w-full"
          >
            Go to Dashboard
          </Button>
          <div className="bg-primary/10 rounded-lg p-4 text-sm">
            <h4 className="font-semibold mb-2">What you get:</h4>
            <ul className="space-y-1 text-muted-foreground">
              {planId === "pro" && (
                <>
                  <li>• Access to all premium courses</li>
                  <li>• Downloadable resources</li>
                  <li>• Certificate of completion</li>
                  <li>• Priority support</li>
                </>
              )}
              {planId === "team" && (
                <>
                  <li>• All Pro features</li>
                  <li>• Team management dashboard</li>
                  <li>• Progress tracking for team</li>
                  <li>• Dedicated account manager</li>
                </>
              )}
            </ul>
          </div>
        </div>
      );
    } else {
      // Course enrollment success actions
      return (
        <div className="space-y-3">
          <Button
            onClick={() =>
              router.push(data?.course ? `/courses/${data.course}` : "/courses")
            }
            className="w-full"
            size="lg"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Start Learning Now
          </Button>
          <Button
            onClick={() => router.push("/courses")}
            variant="outline"
            className="w-full"
          >
            Browse All Courses
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            {data?.course
              ? "Redirecting to course..."
              : "Explore more learning opportunities!"}
          </p>
        </div>
      );
    }
  };

  const getErrorActions = () => {
    return (
      <div className="space-y-3">
        <Button onClick={handleRetry} className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Button
          onClick={() => router.push("/support")}
          variant="outline"
          className="w-full"
        >
          Contact Support
        </Button>
        <Button
          onClick={() => router.push(planId ? "/pricing" : "/courses")}
          variant="outline"
          className="w-full"
        >
          Back to {planId ? "Pricing" : "Courses"}
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            {status === "processing" && (
              <>
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold mb-2">
                  {planId ? "Activating Subscription" : "Completing Enrollment"}
                </h2>
                <p className="text-muted-foreground">{message}</p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {planId ? "Welcome to Premium! 🎉" : "Welcome Aboard!"}
                </h2>
                <p className="text-muted-foreground mb-6">{message}</p>
                {getSuccessActions()}
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {planId ? "Subscription Issue" : "Enrollment Issue"}
                </h2>
                <p className="text-muted-foreground mb-4">{message}</p>
                <p className="text-sm text-muted-foreground mb-6">
                  {planId
                    ? "Your payment was successful but we encountered an issue activating your subscription."
                    : "Your payment was successful but we encountered an issue with enrollment."}
                </p>
                {getErrorActions()}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
