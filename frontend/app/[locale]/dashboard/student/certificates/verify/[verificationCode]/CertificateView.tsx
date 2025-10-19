// // app/certificates/verify/[verificationCode]/CertificateView.tsx
// "use client";

// import { useQuery } from "@tanstack/react-query";
// import { motion } from "framer-motion";
// import { certificateService } from "@/services/certificate.service";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import { 
//   Award, 
//   Download, 
//   Share2, 
//   Calendar,
//   BookOpen,
//   CheckCircle,
//   ArrowLeft,
//   Home,
//   ExternalLink
// } from "lucide-react";
// import Link from "next/link";
// import { useParams, useRouter } from "next/navigation";
// import { useState, useEffect } from "react";
// import { useDownloadCertificate } from "@/hooks/useCertificates";

// export default function CertificateView() {
//   const params = useParams();
//   const router = useRouter();
//   const verificationCode = params.verificationCode as string;
//   const [isClient, setIsClient] = useState(false);
  
//   const downloadMutation = useDownloadCertificate();

//   useEffect(() => {
//     setIsClient(true);
//   }, []);

//   const { data, isLoading, error } = useQuery({
//     queryKey: ["certificate", verificationCode],
//     queryFn: () => certificateService.verifyCertificate(verificationCode),
//     enabled: !!verificationCode && isClient,
//     retry: 2,
//   });

//   const handleDownload = async () => {
//     if (!data?.data?._id) return;
    
//     try {
//       await downloadMutation.mutateAsync({
//         certificateId: data.data._id,
//         filename: `certificate-${verificationCode}.pdf`
//       });
//     } catch (error) {
//       console.error('Download failed:', error);
//       // Fallback: open certificate URL in new tab
//       if (data?.data?.certificateUrl) {
//         window.open(data.data.certificateUrl, '_blank');
//       }
//     }
//   };

//   const handleShare = async () => {
//     if (!isClient) return;

//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: `${data?.data?.course?.title} - Certificate`,
//           text: `Check out my certificate for completing ${data?.data?.course?.title}`,
//           url: window.location.href,
//         });
//       } catch (error) {
//         console.error('Error sharing:', error);
//       }
//     } else {
//       try {
//         await navigator.clipboard.writeText(window.location.href);
//         alert('Certificate link copied to clipboard!');
//       } catch (err) {
//         console.error('Failed to copy:', err);
//       }
//     }
//   };

//   if (isLoading) return <CertificateSkeleton />;
//   if (error) return <CertificateError error={error} router={router} />;
//   if (!data?.data) return <CertificateNotFound router={router} />;

//   const certificate = data.data;
//   const issueDate = new Date(certificate.issuedAt || certificate.createdAt);
//   const formattedDate = issueDate.toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric'
//   });

//   const baseUrl = isClient ? window.location.origin : '';

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6">
//       {/* Navigation */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
//       >
//         <Button
//           variant="ghost"
//           onClick={() => router.back()}
//           className="text-gray-600 hover:text-gray-900"
//         >
//           <ArrowLeft className="h-4 w-4 mr-2" />
//           Back
//         </Button>
        
//         <Button
//           variant="outline"
//           asChild
//         >
//           <Link href="/">
//             <Home className="h-4 w-4 mr-2" />
//             Home
//           </Link>
//         </Button>
//       </motion.div>

//       {/* Certificate Container */}
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="max-w-4xl mx-auto"
//       >
//         {/* Certificate Card */}
//         <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
//           {/* Certificate Header */}
//           <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 text-white text-center relative overflow-hidden">
//             <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0px,transparent_50%)]"></div>
            
//             <div className="relative z-10">
//               <div className="flex justify-center mb-4">
//                 <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
//                   <Award className="h-8 w-8" />
//                 </div>
//               </div>
//               <h1 className="text-2xl sm:text-3xl font-bold mb-2">Certificate of Completion</h1>
//               <p className="text-blue-100 text-sm sm:text-base">This certifies that</p>
//             </div>
//           </div>

//           {/* Certificate Body */}
//           <div className="p-6 sm:p-8">
//             {/* Student Name */}
//             <div className="text-center mb-6 sm:mb-8">
//               <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
//                 {certificate.student?.name || "Student Name"}
//               </h2>
//               <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full"></div>
//             </div>

//             {/* Course Details */}
//             <div className="text-center mb-6 sm:mb-8">
//               <p className="text-base sm:text-lg text-gray-600 mb-4">
//                 has successfully completed the course
//               </p>
//               <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
//                 {certificate.course?.title || "Course Title"}
//               </h3>
//               {certificate.course?.instructor && (
//                 <p className="text-gray-600 text-sm sm:text-base">
//                   instructed by {certificate.course.instructor.name}
//                 </p>
//               )}
//             </div>

//             {/* Certificate Details */}
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-50 rounded-xl">
//               <div className="text-center">
//                 <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
//                 <p className="text-xs sm:text-sm text-gray-600">Issued On</p>
//                 <p className="font-semibold text-gray-900 text-sm sm:text-base">{formattedDate}</p>
//               </div>
              
//               <div className="text-center">
//                 <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
//                 <p className="text-xs sm:text-sm text-gray-600">Verification Code</p>
//                 <p className="font-mono font-bold text-gray-900 text-sm sm:text-base break-all">
//                   {certificate.verificationCode}
//                 </p>
//               </div>
              
//               <div className="text-center">
//                 <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
//                 <p className="text-xs sm:text-sm text-gray-600">Status</p>
//                 <Badge className="bg-green-100 text-green-800 text-xs">Verified</Badge>
//               </div>
//             </div>

//             {/* Verification Note */}
//             <div className="text-center mb-6 sm:mb-8">
//               <p className="text-xs sm:text-sm text-gray-600 break-words">
//                 This certificate can be verified at:{" "}
//                 <a 
//                   href={`${baseUrl}/certificates/verify/${certificate.verificationCode}`}
//                   className="text-blue-600 hover:text-blue-700 underline break-all"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   {baseUrl}/certificates/verify/{certificate.verificationCode}
//                 </a>
//               </p>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex flex-col sm:flex-row gap-3 justify-center">
//               <Button
//                 size="lg"
//                 onClick={handleDownload}
//                 disabled={downloadMutation.isPending}
//                 className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
//               >
//                 {downloadMutation.isPending ? (
//                   <>
//                     <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
//                     Downloading...
//                   </>
//                 ) : (
//                   <>
//                     <Download className="h-4 w-4 mr-2" />
//                     Download PDF
//                   </>
//                 )}
//               </Button>
              
//               <Button
//                 size="lg"
//                 variant="outline"
//                 onClick={handleShare}
//                 className="border-blue-600 text-blue-600 hover:bg-blue-50"
//               >
//                 <Share2 className="h-4 w-4 mr-2" />
//                 Share
//               </Button>

//               <Button
//                 size="lg"
//                 variant="outline"
//                 asChild
//               >
//                 <Link 
//                   href={`/certificates/verify/${certificate.verificationCode}`} 
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   <ExternalLink className="h-4 w-4 mr-2" />
//                   Verify Link
//                 </Link>
//               </Button>
//             </div>
//           </div>

//           {/* Certificate Footer */}
//           <div className="bg-gray-50 p-4 sm:p-6 border-t border-gray-200">
//             <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-gray-600 gap-2">
//               <div className="flex items-center gap-2">
//                 <Award className="h-4 w-4 text-blue-600" />
//                 <span>Learnify Academy</span>
//               </div>
//               <div className="text-center sm:text-right">
//                 Certificate ID: <span className="font-mono break-all">{certificate.verificationCode}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Additional Information */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3 }}
//           className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
//         >
//           <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
//             <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">About This Certificate</h4>
//             <p className="text-gray-600 text-xs sm:text-sm">
//               This certificate verifies the successful completion of the course and 
//               demonstrates the achievement of learning objectives. It can be shared 
//               on professional networks and included in portfolios.
//             </p>
//           </div>
          
//           <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
//             <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Verification</h4>
//             <p className="text-gray-600 text-xs sm:text-sm">
//               To verify this certificate, visit the verification link provided above. 
//               Employers and institutions can confirm the authenticity of this 
//               certificate using the unique verification code.
//             </p>
//           </div>
//         </motion.div>
//       </motion.div>
//     </div>
//   );
// }

// // Skeleton for Certificate View
// function CertificateSkeleton() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
//       <div className="max-w-4xl mx-auto space-y-6">
//         <div className="flex justify-between">
//           <Skeleton className="h-10 w-32 bg-gray-300" />
//           <Skeleton className="h-10 w-32 bg-gray-300" />
//         </div>
        
//         <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
//           {/* Header Skeleton */}
//           <div className="bg-gray-300 p-8 h-40"></div>
          
//           <div className="p-8 space-y-6">
//             {/* Student Name Skeleton */}
//             <div className="text-center space-y-4">
//               <Skeleton className="h-12 w-3/4 mx-auto bg-gray-300" />
//               <Skeleton className="h-1 w-24 mx-auto bg-gray-300" />
//             </div>

//             {/* Course Details Skeleton */}
//             <div className="text-center space-y-4">
//               <Skeleton className="h-6 w-1/2 mx-auto bg-gray-300" />
//               <Skeleton className="h-8 w-2/3 mx-auto bg-gray-300" />
//               <Skeleton className="h-4 w-1/3 mx-auto bg-gray-300" />
//             </div>

//             {/* Details Grid Skeleton */}
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//               {[...Array(3)].map((_, i) => (
//                 <div key={i} className="text-center space-y-2">
//                   <Skeleton className="h-8 w-8 mx-auto bg-gray-300 rounded-full" />
//                   <Skeleton className="h-4 w-20 mx-auto bg-gray-300" />
//                   <Skeleton className="h-6 w-24 mx-auto bg-gray-300" />
//                 </div>
//               ))}
//             </div>

//             {/* Verification Note Skeleton */}
//             <Skeleton className="h-4 w-full bg-gray-300" />

//             {/* Action Buttons Skeleton */}
//             <div className="flex flex-col sm:flex-row gap-4 justify-center">
//               <Skeleton className="h-12 w-40 bg-gray-300" />
//               <Skeleton className="h-12 w-40 bg-gray-300" />
//               <Skeleton className="h-12 w-40 bg-gray-300" />
//             </div>
//           </div>

//           {/* Footer Skeleton */}
//           <div className="bg-gray-100 p-6">
//             <div className="flex justify-between">
//               <Skeleton className="h-4 w-32 bg-gray-300" />
//               <Skeleton className="h-4 w-40 bg-gray-300" />
//             </div>
//           </div>
//         </div>

//         {/* Additional Info Skeleton */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {[...Array(2)].map((_, i) => (
//             <div key={i} className="bg-white p-6 rounded-xl space-y-3">
//               <Skeleton className="h-6 w-32 bg-gray-300" />
//               <Skeleton className="h-4 w-full bg-gray-300" />
//               <Skeleton className="h-4 w-3/4 bg-gray-300" />
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// // Error Component for Certificate View
// function CertificateError({ error, router }: { error: Error; router: any }) {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center">
//       <div className="text-center max-w-md mx-4">
//         <Award className="h-16 w-16 text-red-600 mx-auto mb-4" />
//         <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Found</h2>
//         <p className="text-gray-600 mb-4">
//           We couldn't find the certificate you're looking for. It may have been moved or deleted.
//         </p>
//         <div className="flex flex-col sm:flex-row gap-3 justify-center">
//           <Button onClick={() => router.back()} variant="outline">
//             Go Back
//           </Button>
//           <Button asChild>
//             <Link href="/">
//               Go Home
//             </Link>
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Not Found Component
// function CertificateNotFound({ router }: { router: any }) {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center">
//       <div className="text-center max-w-md mx-4">
//         <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//         <h2 className="text-2xl font-bold text-gray-900 mb-2">Certificate Not Available</h2>
//         <p className="text-gray-600 mb-4">
//           The requested certificate is not available or you don't have permission to view it.
//         </p>
//         <div className="flex flex-col sm:flex-row gap-3 justify-center">
//           <Button onClick={() => router.back()} variant="outline">
//             Go Back
//           </Button>
//           <Button asChild>
//             <Link href="/">
//               Go Home
//             </Link>
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

