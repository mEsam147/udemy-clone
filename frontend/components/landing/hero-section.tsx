

// "use client";

// import { useState, useEffect, useCallback } from "react";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Play,
//   Search,
//   Users,
//   BookOpen,
//   Award,
//   TrendingUp,
//   Star,
//   Zap,
// } from "lucide-react";
// import { VideoModal } from "@/components/ui/video-modal";
// import { motion, AnimatePresence } from "framer-motion";
// import Image from "next/image";

// interface HeroSectionProps {
//   stats: {
//     totalStudents: number;
//     totalCourses: number;
//     totalInstructors: number;
//     successRate: number;
//     totalEnrollments: number;
//     dailyEnrollments: number;
//   };
//   trendingSkills: Array<{
//     skill: string;
//     courseCount: number;
//     totalStudents: number;
//   }>;
//   headlines: string[];
//   language: string;
// }

// export function HeroSection({
//   stats,
//   trendingSkills,
//   headlines,
//   language,
// }: HeroSectionProps) {
//   const [currentHeadline, setCurrentHeadline] = useState(0);
//   const [showDemoVideo, setShowDemoVideo] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [isVisible, setIsVisible] = useState(false);
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

//   // Animation on mount
//   useEffect(() => {
//     setIsVisible(true);
//   }, []);

//   // Headline rotation
//   useEffect(() => {
//     if (headlines.length > 1) {
//       const interval = setInterval(() => {
//         setCurrentHeadline((prev) => (prev + 1) % headlines.length);
//       }, 4000);
//       return () => clearInterval(interval);
//     }
//   }, [headlines.length]);

//   // Mouse move handler for background effect
//   const handleMouseMove = useCallback((e: MouseEvent) => {
//     const { clientX, clientY } = e;
//     const x = (clientX / window.innerWidth) * 100;
//     const y = (clientY / window.innerHeight) * 100;
//     setMousePosition({ x, y });
//   }, []);

//   useEffect(() => {
//     window.addEventListener("mousemove", handleMouseMove);
//     return () => window.removeEventListener("mousemove", handleMouseMove);
//   }, [handleMouseMove]);

//   // Language translations
//   const translations = {
//     en: {
//       subtitle: `Join ${stats.totalStudents.toLocaleString()}+ learners and master new skills with world-class courses.`,
//       searchPlaceholder: "What do you want to learn?",
//       searchButton: "Search",
//       exploreCourses: "📚 Explore Courses",
//       watchDemo: "Watch Demo",
//       students: "Students",
//       courses: "Courses",
//       instructors: "Instructors",
//       successRate: "Success Rate",
//       trending: "Trending Skills",
//       studentRating: "Student Rating",
//       liveClasses: "Live Classes",
//       joinStudents: "Join students worldwide",
//     },
//     ar: {
//       subtitle: `انضم إلى ${stats.totalStudents.toLocaleString()}+ متعلم وأتقن مهارات جديدة مع دورات عالمية المستوى.`,
//       searchPlaceholder: "ماذا تريد أن تتعلم؟",
//       searchButton: "بحث",
//       exploreCourses: "📚 استكشف الدورات",
//       watchDemo: "شاهد التجربة",
//       students: "طالب",
//       courses: "دورة",
//       instructors: "مدرب",
//       successRate: "معدل النجاح",
//       trending: "المهارات الرائجة",
//       studentRating: "تقييم الطلاب",
//       liveClasses: "فصول مباشرة",
//       joinStudents: "انضم للطلاب حول العالم",
//     },
//   };

//   const t =
//     translations[language as keyof typeof translations] || translations.en;

//   // Filter out long/short trending skills for better display
//   const displaySkills = trendingSkills
//     .filter((skill) => skill.skill.length > 10 && skill.skill.length < 60)
//     .slice(0, 5);

//   return (
//     <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background py-10">
//       {/* Enhanced Animated Background with Cursor Effect */}
//       <div className="absolute inset-0">
//         {/* Gradient overlay with cursor movement */}
//         <div
//           className="absolute inset-0 transition-transform duration-100 ease-out"
//           style={{
//             background: `
//               radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
//               radial-gradient(circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
//               radial-gradient(circle at ${mousePosition.x}% ${100 - mousePosition.y}%, rgba(239, 68, 68, 0.1) 0%, transparent 50%),
//               linear-gradient(to bottom right, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))
//             `,
//           }}
//         />

//         {/* Animated floating elements with cursor influence */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 0.3 }}
//           transition={{ duration: 2 }}
//           className="absolute inset-0"
//         >
//           <motion.div
//             animate={{
//               y: [0, -20, 0],
//               x: [0, 10, 0],
//             }}
//             transition={{
//               duration: 8,
//               repeat: Infinity,
//               ease: "easeInOut",
//             }}
//             className="absolute top-20 left-10 w-24 h-24 bg-primary/20 rounded-full blur-xl"
//             style={{
//               transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
//             }}
//           />
//           <motion.div
//             animate={{
//               y: [0, 30, 0],
//               x: [0, -15, 0],
//             }}
//             transition={{
//               duration: 10,
//               repeat: Infinity,
//               ease: "easeInOut",
//               delay: 1,
//             }}
//             className="absolute top-40 right-32 w-20 h-20 bg-blue-500/20 rounded-full blur-xl"
//             style={{
//               transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * 0.015}px)`
//             }}
//           />
//           <motion.div
//             animate={{
//               y: [0, -25, 0],
//               x: [0, 20, 0],
//             }}
//             transition={{
//               duration: 12,
//               repeat: Infinity,
//               ease: "easeInOut",
//               delay: 2,
//             }}
//             className="absolute bottom-40 left-32 w-28 h-28 bg-pink-500/20 rounded-full blur-xl"
//             style={{
//               transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * -0.01}px)`
//             }}
//           />
//           <motion.div
//             animate={{
//               y: [0, 15, 0],
//               x: [0, -25, 0],
//             }}
//             transition={{
//               duration: 9,
//               repeat: Infinity,
//               ease: "easeInOut",
//               delay: 3,
//             }}
//             className="absolute bottom-20 right-20 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl"
//             style={{
//               transform: `translate(${mousePosition.x * -0.025}px, ${mousePosition.y * -0.025}px)`
//             }}
//           />
//         </motion.div>

//         {/* Grid pattern */}
//         <div
//           className="absolute inset-0 opacity-10 dark:opacity-20"
//           style={{
//             backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
//                              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
//             backgroundSize: "50px 50px",
//           }}
//         />
//       </div>

//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center"
//         >
//           {/* Left Content */}
//           <div className="text-center lg:text-left space-y-6 lg:space-y-8 py-8 lg:py-10 order-2 lg:order-1">
//             {/* Dynamic Headline with Smooth Transition */}
//             <div className="h-24 lg:h-28 flex items-center justify-center lg:justify-start">
//               <AnimatePresence mode="wait">
//                 <motion.h3
//                   key={currentHeadline}
//                   initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
//                   animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
//                   exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
//                   transition={{ duration: 0.5 }}
//                   className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase font-bold leading-tight text-balance bg-gradient-to-r from-foreground via-primary/80 to-blue-600 bg-clip-text text-transparent px-4 lg:px-0"
//                 >
//                   {headlines[currentHeadline]}
//                 </motion.h3>
//               </AnimatePresence>
//             </div>

//             {/* Subtitle */}
//             <motion.p
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8, delay: 0.2 }}
//               className="text-lg sm:text-xl md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-2xl mx-auto lg:mx-0 px-4 lg:px-0"
//             >
//               {t.subtitle}
//             </motion.p>

//             {/* Search Bar */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8, delay: 0.4 }}
//               className="max-w-2xl mx-auto lg:mx-0 mb-4 px-4 lg:px-0"
//             >
//               <div className="relative group">
//                 <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 transition-colors group-focus-within:text-primary" />
//                 <Input
//                   type="text"
//                   placeholder={t.searchPlaceholder}
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="pl-12 pr-28 lg:pr-32 py-5 lg:py-6 text-base lg:text-lg bg-card/50 backdrop-blur-sm border-border text-foreground placeholder-muted-foreground focus:bg-card/80 focus:border-primary/50 transition-all duration-300 rounded-2xl border-2 w-full"
//                 />
//                 <Button
//                   size="lg"
//                   className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 border-0 shadow-lg hover:shadow-primary/25 transition-all duration-300 text-sm lg:text-base px-3 lg:px-4 py-2 lg:py-2"
//                   asChild
//                 >
//                   <Link
//                     href={`/courses?search=${encodeURIComponent(searchQuery)}`}
//                   >
//                     {t.searchButton}
//                   </Link>
//                 </Button>
//               </div>
//             </motion.div>

//             {/* CTA Buttons */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8, delay: 0.6 }}
//               className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center lg:justify-start mb-4 px-4 lg:px-0"
//             >
//               <Button
//                 size="lg"
//                 className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0 font-semibold rounded-2xl px-6 lg:px-8 py-5 lg:py-6 text-sm lg:text-base w-full sm:w-auto"
//                 asChild
//               >
//                 <Link href="/courses">{t.exploreCourses}</Link>
//               </Button>
//               <Button
//                 size="lg"
//                 variant="outline"
//                 className="border-2 border-border text-foreground hover:bg-accent hover:border-primary/50 hover:scale-105 transition-all duration-300 backdrop-blur-sm rounded-2xl px-6 lg:px-8 py-5 lg:py-6 font-semibold text-sm lg:text-base w-full sm:w-auto"
//                 onClick={() => setShowDemoVideo(true)}
//               >
//                 <Play className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
//                 {t.watchDemo}
//               </Button>
//             </motion.div>

//             {/* Stats */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.8, delay: 0.8 }}
//               className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6 max-w-2xl px-4 lg:px-0"
//             >
//               <StatCard
//                 icon={<Users className="w-4 h-4 lg:w-5 lg:h-5" />}
//                 value={stats.totalStudents.toLocaleString()}
//                 label={t.students}
//                 color="text-blue-500"
//               />
//               <StatCard
//                 icon={<BookOpen className="w-4 h-4 lg:w-5 lg:h-5" />}
//                 value={stats.totalCourses.toLocaleString()}
//                 label={t.courses}
//                 color="text-green-500"
//               />
//               <StatCard
//                 icon={<Award className="w-4 h-4 lg:w-5 lg:h-5" />}
//                 value={stats.totalInstructors.toLocaleString()}
//                 label={t.instructors}
//                 color="text-orange-500"
//               />
//               <StatCard
//                 icon={<TrendingUp className="w-4 h-4 lg:w-5 lg:h-5" />}
//                 value={`${stats.successRate}%`}
//                 label={t.successRate}
//                 color="text-purple-500"
//               />
//             </motion.div>

//             {/* Trending Skills */}
//             {displaySkills.length > 0 && (
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.8, delay: 1 }}
//                 className="pt-6 border-t border-border mx-4 lg:mx-0"
//               >
//                 <div className="flex items-center gap-2 mb-3 justify-center lg:justify-start">
//                   <Zap className="w-4 h-4 text-yellow-500" />
//                   <span className="text-sm text-muted-foreground font-medium">
//                     {t.trending}:
//                   </span>
//                 </div>
//                 <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
//                   {displaySkills.map((skill, index) => (
//                     <motion.span
//                       key={skill.skill}
//                       initial={{ opacity: 0, scale: 0.8 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
//                       className="px-3 py-1 bg-accent backdrop-blur-sm rounded-full text-xs text-muted-foreground border border-border hover:bg-accent/80 transition-colors cursor-pointer max-w-[200px] truncate"
//                     >
//                       {skill.skill.length > 25
//                         ? `${skill.skill.substring(0, 25)}...`
//                         : skill.skill}
//                     </motion.span>
//                   ))}
//                 </div>
//               </motion.div>
//             )}
//           </div>

//           {/* Right Content - Enhanced Hero Visual */}
//           <motion.div
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 1, delay: 0.5 }}
//             className="relative order-1 lg:order-2 mb-8 lg:mb-0"
//           >
//             <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl group mx-4 lg:mx-0">
//               {/* Main Image with Gradient Overlay */}
//               <div className="relative">
//                 <Image
//                   src="/modern-online-learning-platform-dashboard-with-cou.jpg"
//                   width={600}
//                   height={400}
//                   alt="Learning Platform Dashboard"
//                   className="w-full h-auto aspect-video object-cover group-hover:scale-105 transition-transform duration-700"
//                   priority
//                 />
//                 <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
//               </div>

//               {/* Enhanced Floating Elements */}
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.8, delay: 1 }}
//                 className="absolute top-4 right-4 lg:top-6 lg:right-6 bg-card/80 backdrop-blur-md rounded-xl lg:rounded-2xl p-3 lg:p-4 shadow-2xl border border-border max-w-[120px] lg:max-w-none"
//               >
//                 <div className="flex items-center gap-2">
//                   <Star className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-500 fill-current" />
//                   <span className="text-foreground font-semibold text-sm lg:text-base">4.9/5</span>
//                 </div>
//                 <p className="text-muted-foreground text-xs mt-1">
//                   {t.studentRating}
//                 </p>
//               </motion.div>

//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.8, delay: 1.2 }}
//                 className="absolute bottom-4 left-4 lg:bottom-6 lg:left-6 bg-card/80 backdrop-blur-md rounded-xl lg:rounded-2xl p-3 lg:p-4 shadow-2xl border border-border max-w-[120px] lg:max-w-none"
//               >
//                 <div className="flex items-center gap-2">
//                   <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full animate-pulse" />
//                   <span className="text-foreground font-semibold text-sm lg:text-base">
//                     {t.liveClasses}
//                   </span>
//                 </div>
//                 <p className="text-muted-foreground text-xs mt-1">
//                   {t.joinStudents}
//                 </p>
//               </motion.div>

//               {/* Animated Progress Indicator */}
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.8, delay: 1.4 }}
//                 className="absolute bottom-4 right-4 lg:bottom-6 lg:right-6 bg-card/80 backdrop-blur-md rounded-xl lg:rounded-2xl p-3 lg:p-4 shadow-2xl border border-border max-w-[120px] lg:max-w-none"
//               >
//                 <div className="flex items-center gap-2 lg:gap-3">
//                   <div className="relative">
//                     <svg className="w-8 h-8 lg:w-12 lg:h-12 transform -rotate-90">
//                       <circle
//                         cx="25"
//                         cy="25"
//                         r="14"
//                         stroke="currentColor"
//                         strokeWidth="3"
//                         fill="transparent"
//                         className="text-muted-foreground/30"
//                       />
//                       <motion.circle
//                         cx="25"
//                         cy="25"
//                         r="14"
//                         stroke="currentColor"
//                         strokeWidth="3"
//                         fill="transparent"
//                         className="text-green-500"
//                         initial={{
//                           strokeDasharray: "88",
//                           strokeDashoffset: "88",
//                         }}
//                         animate={{ strokeDashoffset: "44" }}
//                         transition={{ duration: 2, delay: 1.5 }}
//                         strokeLinecap="round"
//                       />
//                     </svg>
//                     <span className="absolute -left- top-0 inset-0 flex items-center justify-center text-foreground text-xs font-bold">
//                       50%
//                     </span>
//                   </div>
//                   <div className="hidden lg:block">
//                     <p className="text-foreground text-sm font-semibold">
//                       Active Now
//                     </p>
//                     <p className="text-muted-foreground text-xs">
//                       Learning Progress
//                     </p>
//                   </div>
//                 </div>
//               </motion.div>
//             </div>

//             {/* Background Glow Effect */}
//             <div className="absolute -inset-2 lg:-inset-4 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl lg:rounded-3xl blur-2xl lg:blur-3xl -z-10 group-hover:from-primary/30 group-hover:to-blue-500/30 transition-all duration-1000" />
//           </motion.div>
//         </motion.div>
//       </div>

//       {/* Video Modal */}
//       <VideoModal
//         isOpen={showDemoVideo}
//         onClose={() => setShowDemoVideo(false)}
//       />
//     </section>
//   );
// }

// // Stat Card Component
// function StatCard({
//   icon,
//   value,
//   label,
//   color,
// }: {
//   icon: React.ReactNode;
//   value: string;
//   label: string;
//   color: string;
// }) {
//   return (
//     <motion.div
//       whileHover={{ scale: 1.05, y: -2 }}
//       className="text-center lg:text-left p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:bg-card/80 transition-all duration-300"
//     >
//       <div
//         className={`flex items-center justify-center lg:justify-start gap-2 mb-2 ${color}`}
//       >
//         {icon}
//         <span className="text-lg lg:text-2xl font-bold text-foreground">{value}</span>
//       </div>
//       <p className="text-xs lg:text-sm text-muted-foreground">{label}</p>
//     </motion.div>
//   );
// }


"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Play,
  Search,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Star,
  Zap,
} from "lucide-react";
import { VideoModal } from "@/components/ui/video-modal";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface HeroSectionProps {
  stats: {
    totalStudents: number;
    totalCourses: number;
    totalInstructors: number;
    successRate: number;
    totalEnrollments: number;
    dailyEnrollments: number;
  };
  trendingSkills: Array<{
    skill: string;
    courseCount: number;
    totalStudents: number;
  }>;
  headlines: string[];
  language: string;
}

export function HeroSection({
  stats,
  trendingSkills,
  headlines,
  language,
}: HeroSectionProps) {
  const [currentHeadline, setCurrentHeadline] = useState(0);
  const [showDemoVideo, setShowDemoVideo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Headline rotation
  useEffect(() => {
    if (headlines.length > 1) {
      const interval = setInterval(() => {
        setCurrentHeadline((prev) => (prev + 1) % headlines.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [headlines.length]);

  // Mouse move handler for background effect
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth) * 100;
    const y = (clientY / window.innerHeight) * 100;
    setMousePosition({ x, y });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // Language translations
  const translations = {
    en: {
      subtitle: `Join ${stats.totalStudents.toLocaleString()}+ learners and master new skills with world-class courses.`,
      searchPlaceholder: "What do you want to learn?",
      searchButton: "Search",
      exploreCourses: "📚 Explore Courses",
      watchDemo: "Watch Demo",
      students: "Students",
      courses: "Courses",
      instructors: "Instructors",
      successRate: "Success Rate",
      trending: "Trending Skills",
      studentRating: "Student Rating",
      liveClasses: "Live Classes",
      joinStudents: "Join students worldwide",
    },
    ar: {
      subtitle: `انضم إلى ${stats.totalStudents.toLocaleString()}+ متعلم وأتقن مهارات جديدة مع دورات عالمية المستوى.`,
      searchPlaceholder: "ماذا تريد أن تتعلم؟",
      searchButton: "بحث",
      exploreCourses: "📚 استكشف الدورات",
      watchDemo: "شاهد التجربة",
      students: "طالب",
      courses: "دورة",
      instructors: "مدرب",
      successRate: "معدل النجاح",
      trending: "المهارات الرائجة",
      studentRating: "تقييم الطلاب",
      liveClasses: "فصول مباشرة",
      joinStudents: "انضم للطلاب حول العالم",
    },
  };

  const t =
    translations[language as keyof typeof translations] || translations.en;

  // Filter out long/short trending skills for better display
  const displaySkills = trendingSkills
    .filter((skill) => skill.skill.length > 10 && skill.skill.length < 60)
    .slice(0, 5);

  return (
    <section className=" py-10 md:py-2 relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Enhanced Animated Background with Cursor Effect */}
      <div className="absolute inset-0">
        {/* Gradient overlay with cursor movement */}
        <div
          className="absolute inset-0 transition-transform duration-200 ease-out"
          style={{
            background: `
              radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.2) 0%, transparent 40%),
              radial-gradient(circle at ${100 - mousePosition.x}% ${100 - mousePosition.y}%, rgba(147, 51, 234, 0.15) 0%, transparent 45%),
              radial-gradient(circle at ${mousePosition.x}% ${100 - mousePosition.y}%, rgba(239, 68, 68, 0.1) 0%, transparent 35%),
              linear-gradient(to bottom right, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))
            `,
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
          }}
        />

        {/* Animated floating elements with enhanced cursor influence */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          <motion.div
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-20 left-10 w-24 h-24 bg-primary/25 rounded-full blur-xl"
            style={{
              transform: `translate(${mousePosition.x * 0.03}px, ${mousePosition.y * 0.03}px)`
            }}
          />
          <motion.div
            animate={{
              y: [0, 40, 0],
              x: [0, -20, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute top-40 right-32 w-20 h-20 bg-blue-500/25 rounded-full blur-xl"
            style={{
              transform: `translate(${mousePosition.x * -0.025}px, ${mousePosition.y * 0.02}px)`
            }}
          />
          <motion.div
            animate={{
              y: [0, -35, 0],
              x: [0, 25, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
            className="absolute bottom-40 left-32 w-28 h-28 bg-pink-500/25 rounded-full blur-xl"
            style={{
              transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * -0.015}px)`
            }}
          />
          <motion.div
            animate={{
              y: [0, 25, 0],
              x: [0, -30, 0],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3,
            }}
            className="absolute bottom-20 right-20 w-16 h-16 bg-cyan-500/25 rounded-full blur-xl"
            style={{
              transform: `translate(${mousePosition.x * -0.035}px, ${mousePosition.y * -0.03}px)`
            }}
          />
        </motion.div>

        {/* Small pixel grid pattern */}
        <div
          className="absolute inset-0 opacity-15 dark:opacity-25"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
            backgroundPosition: "center center",
          }}
        />

        {/* Animated grid lines */}
        <motion.div
          className="absolute inset-0 opacity-5 dark:opacity-15"
          style={{
            backgroundImage: `linear-gradient(90deg, transparent 95%, rgba(59, 130, 246, 0.3) 100%),
                             linear-gradient(0deg, transparent 95%, rgba(147, 51, 234, 0.3) 100%)`,
            backgroundSize: "30px 30px",
          }}
          animate={{
            backgroundPosition: [`0px 0px`, `30px 30px`],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center"
        >
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-6 lg:space-y-8 py-8 lg:py-10 order-2 lg:order-1">
            {/* Dynamic Headline with Smooth Transition */}
            <div className="h-24 lg:h-28 flex items-center justify-center lg:justify-start">
              <AnimatePresence mode="wait">
                <motion.h3
                  key={currentHeadline}
                  initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase font-bold leading-tight text-balance bg-gradient-to-r from-foreground via-primary/80 to-blue-600 bg-clip-text text-transparent px-4 lg:px-0"
                >
                  {headlines[currentHeadline]}
                </motion.h3>
              </AnimatePresence>
            </div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg sm:text-xl md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-2xl mx-auto lg:mx-0 px-4 lg:px-0"
            >
              {t.subtitle}
            </motion.p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="max-w-2xl mx-auto lg:mx-0 mb-4 px-4 lg:px-0"
            >
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 transition-colors group-focus-within:text-primary" />
                <Input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-28 lg:pr-32 py-5 lg:py-6 text-base lg:text-lg bg-card/50 backdrop-blur-sm border-border text-foreground placeholder-muted-foreground focus:bg-card/80 focus:border-primary/50 transition-all duration-300 rounded-2xl border-2 w-full"
                />
                <Button
                  size="lg"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary hover:bg-primary/90 border-0 shadow-lg hover:shadow-primary/25 transition-all duration-300 text-sm lg:text-base px-3 lg:px-4 py-2 lg:py-2"
                  asChild
                >
                  <Link
                    href={`/courses?search=${encodeURIComponent(searchQuery)}`}
                  >
                    {t.searchButton}
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center lg:justify-start mb-4 px-4 lg:px-0"
            >
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0 font-semibold rounded-2xl px-6 lg:px-8 py-5 lg:py-6 text-sm lg:text-base w-full sm:w-auto"
                asChild
              >
                <Link href="/courses">{t.exploreCourses}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-border text-foreground hover:bg-accent hover:border-primary/50 hover:scale-105 transition-all duration-300 backdrop-blur-sm rounded-2xl px-6 lg:px-8 py-5 lg:py-6 font-semibold text-sm lg:text-base w-full sm:w-auto"
                onClick={() => setShowDemoVideo(true)}
              >
                <Play className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                {t.watchDemo}
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6 max-w-2xl px-4 lg:px-0"
            >
              <StatCard
                icon={<Users className="w-4 h-4 lg:w-5 lg:h-5" />}
                value={stats.totalStudents.toLocaleString()}
                label={t.students}
                color="text-blue-500"
              />
              <StatCard
                icon={<BookOpen className="w-4 h-4 lg:w-5 lg:h-5" />}
                value={stats.totalCourses.toLocaleString()}
                label={t.courses}
                color="text-green-500"
              />
              <StatCard
                icon={<Award className="w-4 h-4 lg:w-5 lg:h-5" />}
                value={stats.totalInstructors.toLocaleString()}
                label={t.instructors}
                color="text-orange-500"
              />
              <StatCard
                icon={<TrendingUp className="w-4 h-4 lg:w-5 lg:h-5" />}
                value={`${stats.successRate}%`}
                label={t.successRate}
                color="text-purple-500"
              />
            </motion.div>

            {/* Trending Skills */}
            {displaySkills.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="pt-6 border-t border-border mx-4 lg:mx-0"
              >
                <div className="flex items-center gap-2 mb-3 justify-center lg:justify-start">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground font-medium">
                    {t.trending}:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  {displaySkills.map((skill, index) => (
                    <motion.span
                      key={skill.skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                      className="px-3 py-1 bg-accent backdrop-blur-sm rounded-full text-xs text-muted-foreground border border-border hover:bg-accent/80 transition-colors cursor-pointer max-w-[200px] truncate"
                    >
                      {skill.skill.length > 25
                        ? `${skill.skill.substring(0, 25)}...`
                        : skill.skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Content - Enhanced Hero Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative order-1 lg:order-2 mb-8 lg:mb-0"
          >
            <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl group mx-4 lg:mx-0">
              {/* Main Image with Gradient Overlay */}
              <div className="relative">
                <Image
                  src="/modern-online-learning-platform-dashboard-with-cou.jpg"
                  width={600}
                  height={400}
                  alt="Learning Platform Dashboard"
                  className="w-full h-auto aspect-video object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
              </div>

              {/* Enhanced Floating Elements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="absolute top-4 right-4 lg:top-6 lg:right-6 bg-card/80 backdrop-blur-md rounded-xl lg:rounded-2xl p-3 lg:p-4 shadow-2xl border border-border max-w-[120px] lg:max-w-none"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-500 fill-current" />
                  <span className="text-foreground font-semibold text-sm lg:text-base">4.9/5</span>
                </div>
                <p className="text-muted-foreground text-xs mt-1">
                  {t.studentRating}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="absolute bottom-4 left-4 lg:bottom-6 lg:left-6 bg-card/80 backdrop-blur-md rounded-xl lg:rounded-2xl p-3 lg:p-4 shadow-2xl border border-border max-w-[120px] lg:max-w-none"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 lg:w-3 lg:h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-foreground font-semibold text-sm lg:text-base">
                    {t.liveClasses}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs mt-1">
                  {t.joinStudents}
                </p>
              </motion.div>

              {/* Enhanced Responsive Progress Indicator */}
            <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.8, delay: 1.4 }}
  className="absolute bottom-4 right-4 lg:bottom-6 lg:right-6 bg-card/80 backdrop-blur-md rounded-xl lg:rounded-2xl p-3 lg:p-4 shadow-2xl border border-border w-[130px] lg:w-auto"
>
  <div className="flex items-center gap-2 lg:gap-3">
    <div className="relative flex-shrink-0">
      <svg className="w-8 h-8 lg:w-12 lg:h-12 transform -rotate-90">
        <circle
          cx="50%"
          cy="50%"
          r="14"
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          className="text-muted-foreground/30"
        />
        <motion.circle
          cx="50%"
          cy="50%"
          r="14"
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          className="text-green-500"
          initial={{
            strokeDasharray: "88",
            strokeDashoffset: "88",
          }}
          animate={{ strokeDashoffset: "44" }}
          transition={{ duration: 2, delay: 1.5 }}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-foreground text-xs font-bold">
        50%
      </span>
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-foreground text-sm font-semibold truncate">
        Active Now
      </p>
      <p className="text-muted-foreground text-xs truncate">
        Learning Progress
      </p>
    </div>
  </div>
</motion.div>
            </div>

            {/* Background Glow Effect */}
            <div className="absolute -inset-2 lg:-inset-4 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl lg:rounded-3xl blur-2xl lg:blur-3xl -z-10 group-hover:from-primary/30 group-hover:to-blue-500/30 transition-all duration-1000" />
          </motion.div>
        </motion.div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={showDemoVideo}
        onClose={() => setShowDemoVideo(false)}
      />
    </section>
  );
}

// Stat Card Component
function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      className="text-center lg:text-left p-3 lg:p-4 rounded-xl lg:rounded-2xl bg-card/50 backdrop-blur-sm border border-border hover:bg-card/80 transition-all duration-300"
    >
      <div
        className={`flex items-center justify-center lg:justify-start gap-2 mb-2 ${color}`}
      >
        {icon}
        <span className="text-lg lg:text-2xl font-bold text-foreground">{value}</span>
      </div>
      <p className="text-xs lg:text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
}
