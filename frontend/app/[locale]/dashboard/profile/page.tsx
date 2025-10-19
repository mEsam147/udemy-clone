// "use client";

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { motion, AnimatePresence } from "framer-motion";
// import * as authService from "@/services/auth.service";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import {
//   User,
//   Mail,
//   Clock,
//   Briefcase,
//   Calendar,
//   Award,
//   Bookmark,
//   Search,
//   Edit3,
//   Save,
//   X,
//   Plus,
//   Trash2,
//   Camera,
//   Upload,
//   Loader2,
//   Shield,
//   FileText,
//   Send,
//   LogOut,
//   Sparkles,
//   Zap,
//   Target,
//   Star,
//   CheckCircle,
// } from "lucide-react";
// import { useAuth } from "@/context/AuthContext";
// import { useState, useRef, useEffect } from "react";
// import { toast } from "@/hooks/use-toast";
// import { cn } from "@/lib/utils";
// import { useRouter } from "next/navigation";

// // Animation variants
// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1,
//     },
//   },
// };

// const itemVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.5,
//       ease: "easeOut",
//     },
//   },
// };

// const slideInVariants = {
//   hidden: { opacity: 0, x: -20 },
//   visible: {
//     opacity: 1,
//     x: 0,
//     transition: {
//       duration: 0.4,
//       ease: "easeOut",
//     },
//   },
// };

// const scaleVariants = {
//   hidden: { opacity: 0, scale: 0.9 },
//   visible: {
//     opacity: 1,
//     scale: 1,
//     transition: {
//       duration: 0.3,
//       ease: "easeOut",
//     },
//   },
// };

// // Utility function to generate Gmail-like avatar color based on name hash
// function getAvatarColor(name: string | undefined): string {
//   if (!name) return "from-blue-500 to-purple-600";

//   const colorPairs = [
//     "from-red-500 to-pink-600",
//     "from-orange-500 to-red-600",
//     "from-amber-500 to-orange-600",
//     "from-yellow-500 to-amber-600",
//     "from-lime-500 to-green-600",
//     "from-green-500 to-emerald-600",
//     "from-emerald-500 to-teal-600",
//     "from-teal-500 to-cyan-600",
//     "from-cyan-500 to-sky-600",
//     "from-sky-500 to-blue-600",
//     "from-blue-500 to-indigo-600",
//     "from-indigo-500 to-violet-600",
//     "from-violet-500 to-purple-600",
//     "from-purple-500 to-fuchsia-600",
//     "from-fuchsia-500 to-pink-600",
//     "from-pink-500 to-rose-600",
//   ];

//   let hash = 0;
//   for (let i = 0; i < name.length; i++) {
//     hash = name.charCodeAt(i) + ((hash << 5) - hash);
//   }
//   const index = Math.abs(hash) % colorPairs.length;
//   return colorPairs[index];
// }

// export default function Profile() {
//   const { user, updateUser, logout: authLogout } = useAuth();
//   const queryClient = useQueryClient();
//   const router = useRouter();
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // State management
//   const [isEditing, setIsEditing] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const [activeTab, setActiveTab] = useState("profile");
//   const [imagePreview, setImagePreview] = useState<string | null>(null);
//   const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     bio: "",
//     expertise: [] as string[],
//     instructorProfile: {
//       availability: "within-24-hours",
//       officeHours: "",
//       contactEmail: "",
//     },
//   });
//   const [newExpertise, setNewExpertise] = useState("");
//   const [instructorMessage, setInstructorMessage] = useState("");

//   // Initialize form data when profile data loads

//   // Queries
//   const {
//     data: profileData,
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ["userProfile"],
//     queryFn: authService.getMe,
//   });

//   useEffect(() => {
//     if (profileData?.data && !isEditing) {
//       const userData = profileData.data;
//       setFormData({
//         name: userData.name || "",
//         email: userData.email || "",
//         bio: userData.bio || "",
//         expertise: userData.expertise || [],
//         instructorProfile: userData.instructorProfile || {
//           availability: "within-24-hours",
//           officeHours: "",
//           contactEmail: "",
//         },
//       });
//     }
//   }, [profileData?.data, isEditing]);

//   const { data: instructorApplications } = useQuery({
//     queryKey: ["instructorApplications"],
//     queryFn: authService.getInstructorApplications,
//     enabled: user?.role === "admin",
//   });

//   // Mutations
//   const updateProfileMutation = useMutation({
//     mutationFn: (data: any) => {
//       return authService.updateProfile(data);
//     },
//     onSuccess: (response) => {
//       queryClient.invalidateQueries({ queryKey: ["userProfile"] });
//       if (updateUser) {
//         updateUser(response.data.data);
//       }
//       setIsEditing(false);
//       toast({
//         title: "🎉 Profile Updated!",
//         description: "Your changes have been saved successfully.",
//         className: "border-green-200 bg-green-50",
//       });
//     },
//     onError: (error: any) => {
//       toast({
//         title: "😕 Update Failed",
//         description:
//           error.response?.data?.message || "Failed to update profile",
//         variant: "destructive",
//       });
//     },
//   });

//   const uploadAvatarMutation = useMutation({
//     mutationFn: authService.uploadAvatar,
//     onSuccess: (response) => {
//       if (updateUser) {
//         updateUser(response.data.user);
//       }
//       queryClient.invalidateQueries({ queryKey: ["userProfile"] });
//       setIsUploading(false);
//       toast({
//         title: "📸 Avatar Updated!",
//         description: "Your profile picture looks great!",
//         className: "border-blue-200 bg-blue-50",
//       });
//     },
//     onError: (error: any) => {
//       setIsUploading(false);
//       setImagePreview(null);
//       toast({
//         title: "😕 Upload Failed",
//         description: error.response?.data?.message || "Failed to upload image",
//         variant: "destructive",
//       });
//     },
//   });

//   const deleteAvatarMutation = useMutation({
//     mutationFn: authService.deleteAvatar,
//     onMutate: async () => {
//       await queryClient.cancelQueries({ queryKey: ["userProfile"] });
//       const previousProfile = queryClient.getQueryData(["userProfile"]);
//       queryClient.setQueryData(["userProfile"], (old: any) => ({
//         ...old,
//         data: { ...old.data, avatar: null },
//       }));
//       setImagePreview(null);
//       return { previousProfile };
//     },
//     onSuccess: (response) => {
//       if (updateUser) {
//         updateUser({ ...response.data.user, avatar: null });
//       }
//       queryClient.invalidateQueries({ queryKey: ["userProfile"] });
//       toast({
//         title: "🔄 Avatar Removed",
//         description: "Your profile picture has been removed.",
//         className: "border-amber-200 bg-amber-50",
//       });
//     },
//     onError: (error, _variables, context: any) => {
//       queryClient.setQueryData(["userProfile"], context.previousProfile);
//       toast({
//         title: "😕 Delete Failed",
//         description: error.response?.data?.message || "Failed to remove avatar",
//         variant: "destructive",
//       });
//     },
//     onSettled: () => {
//       queryClient.invalidateQueries({ queryKey: ["userProfile"] });
//     },
//   });

//   const becomeInstructorMutation = useMutation({
//     mutationFn: () =>
//       authService.becomeInstructor({ message: instructorMessage }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["userProfile"] });
//       setInstructorMessage("");
//       toast({
//         title: "🚀 Application Submitted!",
//         description: "Your instructor application is under review.",
//         className: "border-purple-200 bg-purple-50",
//       });
//     },
//     onError: (error: any) => {
//       toast({
//         title: "😕 Application Failed",
//         description:
//           error.response?.data?.message || "Failed to submit application",
//         variant: "destructive",
//       });
//     },
//   });

//   const processApplicationMutation = useMutation({
//     mutationFn: ({
//       userId,
//       status,
//     }: {
//       userId: string;
//       status: "approved" | "rejected";
//     }) => authService.processInstructorApplication(userId, { status }),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["instructorApplications"] });
//       queryClient.invalidateQueries({ queryKey: ["userProfile"] });
//       toast({
//         title: "✅ Application Processed",
//         description: "Instructor application has been updated.",
//       });
//     },
//   });

//   const logoutMutation = useMutation({
//     mutationFn: authService.logout,
//     onSuccess: () => {
//       if (authLogout) {
//         authLogout();
//       }
//       router.push("/");
//       toast({
//         title: "👋 See you soon!",
//         description: "You have been logged out successfully.",
//       });
//     },
//     onError: (error: any) => {
//       toast({
//         title: "😕 Logout Failed",
//         description: error.response?.data?.message || "Failed to logout",
//         variant: "destructive",
//       });
//     },
//   });

//   // Handlers
//   const handleImageUpload = async (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     const validTypes = [
//       "image/jpeg",
//       "image/jpg",
//       "image/png",
//       "image/gif",
//       "image/webp",
//     ];
//     if (!validTypes.includes(file.type)) {
//       toast({
//         title: "Invalid file type",
//         description: "Please select a JPEG, PNG, GIF, or WebP image.",
//         variant: "destructive",
//       });
//       return;
//     }

//     const maxSize = 5 * 1024 * 1024;
//     if (file.size > maxSize) {
//       toast({
//         title: "File too large",
//         description: "Please select an image smaller than 5MB.",
//         variant: "destructive",
//       });
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       setImagePreview(e.target?.result as string);
//     };
//     reader.readAsDataURL(file);

//     setIsUploading(true);
//     try {
//       const formData = new FormData();
//       formData.append("avatar", file);
//       const token = localStorage.getItem("token");
//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/auth/upload-avatar`,
//         {
//           credentials: "include",
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           body: formData,
//         }
//       );

//       const result = await response.json();
//       if (result.success) {
//         if (updateUser) {
//           updateUser(result.user);
//         }
//         queryClient.invalidateQueries({ queryKey: ["userProfile"] });
//         toast({
//           title: "📸 Avatar Updated!",
//           description: "Your profile picture looks great!",
//           className: "border-blue-200 bg-blue-50",
//         });
//       } else {
//         throw new Error(result.message);
//       }
//     } catch (error: any) {
//       toast({
//         title: "😕 Upload Failed",
//         description: error.message || "Failed to upload image",
//         variant: "destructive",
//       });
//     } finally {
//       setIsUploading(false);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }
//     }
//   };

//   const triggerFileInput = () => {
//     fileInputRef.current?.click();
//   };

//   const handleSave = () => {
//     updateProfileMutation.mutate(formData);
//   };

//   const handleCancel = () => {
//     if (profileData?.data) {
//       const userData = profileData.data;
//       setFormData({
//         name: userData.name || "",
//         email: userData.email || "",
//         bio: userData.bio || "",
//         expertise: userData.expertise || [],
//         instructorProfile: userData.instructorProfile || {
//           availability: "within-24-hours",
//           officeHours: "",
//           contactEmail: "",
//         },
//       });
//     }
//     setIsEditing(false);
//   };

//   const addExpertise = () => {
//     if (
//       newExpertise.trim() &&
//       !formData.expertise.includes(newExpertise.trim())
//     ) {
//       setFormData((prev) => ({
//         ...prev,
//         expertise: [...prev.expertise, newExpertise.trim()],
//       }));
//       setNewExpertise("");
//     }
//   };

//   const removeExpertise = (index: number) => {
//     setFormData((prev) => ({
//       ...prev,
//       expertise: prev.expertise.filter((_, i) => i !== index),
//     }));
//   };

//   const handleBecomeInstructor = () => {
//     if (!instructorMessage.trim()) {
//       toast({
//         title: "Message required",
//         description:
//           "Please provide a message for your instructor application.",
//         variant: "destructive",
//       });
//       return;
//     }
//     becomeInstructorMutation.mutate();
//   };

//   const handleProcessApplication = (
//     userId: string,
//     status: "approved" | "rejected"
//   ) => {
//     processApplicationMutation.mutate({ userId, status });
//   };

//   const handleLogout = () => {
//     logoutMutation.mutate();
//   };

//   const handleRemoveAvatar = () => {
//     if (
//       window.confirm("Are you sure you want to remove your profile picture?")
//     ) {
//       deleteAvatarMutation.mutate();
//     }
//   };

//   if (isLoading) return <ProfileSkeleton />;
//   if (error) return <ErrorState error={error} />;

//   const profile = profileData?.data || {};

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/10 py-8">
//       <div className="max-w-7xl mx-auto px-4 space-y-8">
//         {/* Header Section */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, ease: "easeOut" }}
//           className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl"
//         >
//           {/* Animated background elements */}
//           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />
//           <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
//           <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl" />

//           <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between">
//             <div className="flex items-center space-x-6">
//               {/* Enhanced Avatar with Upload */}
//               <motion.div
//                 className="relative group"
//                 whileHover={{ scale: 1.05 }}
//                 onHoverStart={() => setIsHoveringAvatar(true)}
//                 onHoverEnd={() => setIsHoveringAvatar(false)}
//               >
//                 <Avatar className="h-28 w-28 border-4 border-white/30 shadow-2xl ring-4 ring-white/20">
//                   <AvatarImage
//                     src={imagePreview || user?.avatar || ""}
//                     className="object-cover"
//                   />
//                   <AvatarFallback
//                     className={cn(
//                       "text-3xl font-bold text-white bg-gradient-to-br",
//                       getAvatarColor(user?.name)
//                     )}
//                   >
//                     {isUploading ? (
//                       <Loader2 className="h-8 w-8 animate-spin" />
//                     ) : (
//                       user?.name?.[0]?.toUpperCase() || "U"
//                     )}
//                   </AvatarFallback>
//                 </Avatar>

//                 <AnimatePresence>
//                   {isHoveringAvatar && (
//                     <motion.div
//                       initial={{ opacity: 0, scale: 0.8 }}
//                       animate={{ opacity: 1, scale: 1 }}
//                       exit={{ opacity: 0, scale: 0.8 }}
//                       className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer backdrop-blur-sm"
//                     >
//                       <motion.button
//                         whileHover={{ scale: 1.1 }}
//                         whileTap={{ scale: 0.9 }}
//                         onClick={triggerFileInput}
//                         disabled={isUploading}
//                         className="text-white p-3 bg-white/20 rounded-full transition-all hover:bg-white/30"
//                       >
//                         {isUploading ? (
//                           <Loader2 className="h-6 w-6 animate-spin" />
//                         ) : (
//                           <Camera className="h-6 w-6" />
//                         )}
//                       </motion.button>
//                     </motion.div>
//                   )}
//                 </AnimatePresence>

//                 {(user?.avatar || imagePreview) && (
//                   <motion.button
//                     whileHover={{ scale: 1.1 }}
//                     whileTap={{ scale: 0.9 }}
//                     onClick={handleRemoveAvatar}
//                     disabled={deleteAvatarMutation.isPending || isUploading}
//                     className="absolute -bottom-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all shadow-lg ring-2 ring-white"
//                   >
//                     {deleteAvatarMutation.isPending ? (
//                       <Loader2 className="h-3 w-3 animate-spin" />
//                     ) : (
//                       <Trash2 className="h-3 w-3" />
//                     )}
//                   </motion.button>
//                 )}

//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept="image/*"
//                   onChange={handleImageUpload}
//                   className="hidden"
//                 />
//               </motion.div>

//               <motion.div
//                 variants={slideInVariants}
//                 initial="hidden"
//                 animate="visible"
//               >
//                 <motion.h1
//                   className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent"
//                   whileHover={{ scale: 1.02 }}
//                 >
//                   {user?.name}
//                 </motion.h1>
//                 <div className="flex flex-wrap items-center gap-3 text-blue-100">
//                   <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
//                     <Mail className="h-4 w-4" />
//                     <span className="text-sm">{user?.email}</span>
//                   </div>
//                   <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
//                     <Sparkles className="h-3 w-3 mr-1" />
//                     {user?.role?.toUpperCase()}
//                   </Badge>
//                   {user?.isVerified && (
//                     <Badge className="bg-green-500/20 text-green-100 border-0 backdrop-blur-sm">
//                       <CheckCircle className="h-3 w-3 mr-1" />
//                       Verified
//                     </Badge>
//                   )}
//                 </div>
//               </motion.div>
//             </div>

//             <motion.div
//               className="mt-6 md:mt-0 flex flex-col space-y-3"
//               variants={slideInVariants}
//               initial="hidden"
//               animate="visible"
//             >
//               {!isEditing ? (
//                 <motion.div
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   <Button
//                     onClick={() => setIsEditing(true)}
//                     className="bg-white text-blue-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
//                     size="lg"
//                   >
//                     <Edit3 className="h-5 w-5 mr-2" />
//                     Edit Profile
//                   </Button>
//                 </motion.div>
//               ) : (
//                 <motion.div
//                   className="flex space-x-3"
//                   initial={{ opacity: 0, y: 10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                 >
//                   <Button
//                     onClick={handleCancel}
//                     variant="outline"
//                     className="bg-transparent border-white text-white hover:bg-white/10 backdrop-blur-sm"
//                   >
//                     <X className="h-4 w-4 mr-2" />
//                     Cancel
//                   </Button>
//                   <Button
//                     onClick={handleSave}
//                     disabled={updateProfileMutation.isPending}
//                     className="bg-white text-blue-600 hover:bg-white/90 shadow-lg"
//                   >
//                     {updateProfileMutation.isPending ? (
//                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                     ) : (
//                       <Save className="h-4 w-4 mr-2" />
//                     )}
//                     {updateProfileMutation.isPending
//                       ? "Saving..."
//                       : "Save Changes"}
//                   </Button>
//                 </motion.div>
//               )}
//             </motion.div>
//           </div>
//         </motion.div>

//         {/* Enhanced Navigation Tabs */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-1"
//         >
//           <div className="flex space-x-1">
//             {[
//               {
//                 id: "profile",
//                 label: "Profile",
//                 icon: <User className="h-4 w-4" />,
//                 color: "blue",
//               },
//               ...(user?.role === "admin"
//                 ? [
//                     {
//                       id: "admin",
//                       label: "Admin",
//                       icon: <Shield className="h-4 w-4" />,
//                       color: "purple",
//                     },
//                   ]
//                 : []),
//             ].map((tab) => (
//               <motion.button
//                 key={tab.id}
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={cn(
//                   "flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 flex-1 justify-center relative overflow-hidden",
//                   activeTab === tab.id
//                     ? `bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-600 text-white shadow-lg`
//                     : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
//                 )}
//               >
//                 {tab.icon}
//                 <span className="font-medium">{tab.label}</span>
//                 {activeTab === tab.id && (
//                   <motion.div
//                     layoutId="activeTab"
//                     className="absolute inset-0 bg-white/20 rounded-xl"
//                     transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
//                   />
//                 )}
//               </motion.button>
//             ))}
//           </div>
//         </motion.div>

//         {/* Tab Content */}
//         <AnimatePresence mode="wait">
//           {activeTab === "profile" && (
//             <motion.div
//               key="profile"
//               variants={containerVariants}
//               initial="hidden"
//               animate="visible"
//               exit="hidden"
//               className="grid grid-cols-1 lg:grid-cols-3 gap-8"
//             >
//               {/* Left Column - Basic Info */}
//               <div className="lg:col-span-2 space-y-8">
//                 {/* Personal Information */}
//                 <ProfileCard
//                   title="Personal Information"
//                   icon={<User className="h-5 w-5" />}
//                   delay={0.1}
//                 >
//                   <div className="space-y-6">
//                     <motion.div variants={itemVariants}>
//                       <label className="text-sm font-medium text-slate-700 mb-2 block">
//                         Full Name
//                       </label>
//                       {isEditing ? (
//                         <Input
//                           value={formData.name}
//                           onChange={(e) =>
//                             setFormData((prev) => ({
//                               ...prev,
//                               name: e.target.value,
//                             }))
//                           }
//                           className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
//                           placeholder="Enter your full name"
//                         />
//                       ) : (
//                         <p className="text-slate-900 text-lg font-medium">
//                           {profile.name}
//                         </p>
//                       )}
//                     </motion.div>
//                     <motion.div variants={itemVariants}>
//                       <label className="text-sm font-medium text-slate-700 mb-2 block">
//                         Email Address
//                       </label>
//                       {isEditing ? (
//                         <Input
//                           value={formData.email}
//                           onChange={(e) =>
//                             setFormData((prev) => ({
//                               ...prev,
//                               email: e.target.value,
//                             }))
//                           }
//                           disabled={true}
//                           type="email"
//                           className="bg-slate-50 transition-all duration-200"
//                         />
//                       ) : (
//                         <div className="flex items-center space-x-2">
//                           <Mail className="h-4 w-4 text-slate-400" />
//                           <p className="text-slate-900">{profile.email}</p>
//                         </div>
//                       )}
//                     </motion.div>
//                   </div>
//                 </ProfileCard>

//                 {/* Bio Section */}
//                 <ProfileCard
//                   title="About Me"
//                   icon={<Star className="h-5 w-5" />}
//                   delay={0.2}
//                 >
//                   {isEditing ? (
//                     <motion.div variants={itemVariants}>
//                       <Textarea
//                         value={formData.bio}
//                         onChange={(e) =>
//                           setFormData((prev) => ({
//                             ...prev,
//                             bio: e.target.value,
//                           }))
//                         }
//                         placeholder="Tell us about yourself, your experience, and what you're passionate about..."
//                         className="min-h-[120px] resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500"
//                       />
//                     </motion.div>
//                   ) : (
//                     <motion.p
//                       variants={itemVariants}
//                       className="text-slate-600 leading-relaxed text-lg"
//                     >
//                       {profile.bio || (
//                         <span className="text-slate-400 italic">
//                           No bio provided yet. Share something about yourself!
//                         </span>
//                       )}
//                     </motion.p>
//                   )}
//                 </ProfileCard>

//                 {/* Expertise Section */}
//                 <ProfileCard
//                   title="Areas of Expertise"
//                   icon={<Award className="h-5 w-5" />}
//                   delay={0.3}
//                 >
//                   {isEditing ? (
//                     <motion.div variants={itemVariants} className="space-y-4">
//                       <div className="flex space-x-2">
//                         <Input
//                           value={newExpertise}
//                           onChange={(e) => setNewExpertise(e.target.value)}
//                           onKeyPress={(e) =>
//                             e.key === "Enter" &&
//                             (e.preventDefault(), addExpertise())
//                           }
//                           placeholder="Add your expertise..."
//                           className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
//                         />
//                         <motion.div
//                           whileHover={{ scale: 1.05 }}
//                           whileTap={{ scale: 0.95 }}
//                         >
//                           <Button
//                             onClick={addExpertise}
//                             size="sm"
//                             className="bg-blue-600 hover:bg-blue-700"
//                           >
//                             <Plus className="h-4 w-4" />
//                           </Button>
//                         </motion.div>
//                       </div>
//                       <motion.div layout className="flex flex-wrap gap-2">
//                         {formData.expertise.map((skill, index) => (
//                           <motion.div
//                             key={skill}
//                             layout
//                             initial={{ opacity: 0, scale: 0.8 }}
//                             animate={{ opacity: 1, scale: 1 }}
//                             exit={{ opacity: 0, scale: 0.8 }}
//                             transition={{ duration: 0.2 }}
//                           >
//                             <Badge
//                               variant="secondary"
//                               className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
//                             >
//                               {skill}
//                               <button
//                                 onClick={() => removeExpertise(index)}
//                                 className="ml-2 hover:text-red-500 transition-colors"
//                               >
//                                 <X className="h-3 w-3" />
//                               </button>
//                             </Badge>
//                           </motion.div>
//                         ))}
//                       </motion.div>
//                     </motion.div>
//                   ) : (
//                     <motion.div layout className="flex flex-wrap gap-2">
//                       {profile.expertise?.length > 0 ? (
//                         profile.expertise.map(
//                           (skill: string, index: number) => (
//                             <motion.div
//                               key={index}
//                               initial={{ opacity: 0, scale: 0.8 }}
//                               animate={{ opacity: 1, scale: 1 }}
//                               transition={{ delay: index * 0.1 }}
//                             >
//                               <Badge
//                                 variant="secondary"
//                                 className="px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-slate-700 border border-slate-200"
//                               >
//                                 <Target className="h-3 w-3 mr-1" />
//                                 {skill}
//                               </Badge>
//                             </motion.div>
//                           )
//                         )
//                       ) : (
//                         <motion.p
//                           variants={itemVariants}
//                           className="text-slate-500 italic"
//                         >
//                           No expertise added yet
//                         </motion.p>
//                       )}
//                     </motion.div>
//                   )}
//                 </ProfileCard>

//                 {/* Instructor Application Section */}
//                 {user?.role === "student" && (
//                   <ProfileCard
//                     title="Become an Instructor"
//                     icon={<Zap className="h-5 w-5" />}
//                     delay={0.4}
//                   >
//                     {profile.instructorApplication?.status === "pending" ? (
//                       <motion.div
//                         variants={containerVariants}
//                         className="text-center space-y-4"
//                       >
//                         <motion.div variants={itemVariants}>
//                           <Badge className="bg-yellow-100 text-yellow-800 px-4 py-2 text-sm">
//                             <Clock className="h-4 w-4 mr-1" />
//                             Application Pending Review
//                           </Badge>
//                         </motion.div>
//                         <motion.p
//                           variants={itemVariants}
//                           className="text-slate-600"
//                         >
//                           Your instructor application is under review. We'll
//                           notify you once a decision is made.
//                         </motion.p>
//                         {profile.instructorApplication.message && (
//                           <motion.div
//                             variants={itemVariants}
//                             className="bg-slate-50 p-4 rounded-lg border"
//                           >
//                             <p className="text-sm text-slate-600">
//                               <strong>Your message:</strong>{" "}
//                               {profile.instructorApplication.message}
//                             </p>
//                           </motion.div>
//                         )}
//                       </motion.div>
//                     ) : profile.instructorApplication?.status === "rejected" ? (
//                       <motion.div
//                         variants={containerVariants}
//                         className="text-center space-y-4"
//                       >
//                         <motion.div variants={itemVariants}>
//                           <Badge className="bg-red-100 text-red-800 px-4 py-2 text-sm">
//                             Application Rejected
//                           </Badge>
//                         </motion.div>
//                         <motion.p
//                           variants={itemVariants}
//                           className="text-slate-600"
//                         >
//                           Your instructor application was not approved at this
//                           time.
//                         </motion.p>
//                         <motion.div
//                           variants={itemVariants}
//                           whileHover={{ scale: 1.05 }}
//                           whileTap={{ scale: 0.95 }}
//                         >
//                           <Button onClick={() => setInstructorMessage("")}>
//                             Reapply as Instructor
//                           </Button>
//                         </motion.div>
//                       </motion.div>
//                     ) : (
//                       <motion.div
//                         variants={containerVariants}
//                         className="space-y-4"
//                       >
//                         <motion.p
//                           variants={itemVariants}
//                           className="text-slate-600"
//                         >
//                           Share why you'd like to become an instructor and what
//                           you can teach.
//                         </motion.p>
//                         <motion.div variants={itemVariants}>
//                           <Textarea
//                             value={instructorMessage}
//                             onChange={(e) =>
//                               setInstructorMessage(e.target.value)
//                             }
//                             placeholder="Tell us about your teaching experience, expertise, and what courses you'd like to create..."
//                             className="min-h-[100px] resize-none transition-all duration-200 focus:ring-2 focus:ring-purple-500"
//                           />
//                         </motion.div>
//                         <motion.div
//                           variants={itemVariants}
//                           whileHover={{ scale: 1.02 }}
//                           whileTap={{ scale: 0.98 }}
//                         >
//                           <Button
//                             onClick={handleBecomeInstructor}
//                             disabled={
//                               becomeInstructorMutation.isPending ||
//                               !instructorMessage.trim()
//                             }
//                             className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
//                           >
//                             {becomeInstructorMutation.isPending ? (
//                               <Loader2 className="h-4 w-4 animate-spin mr-2" />
//                             ) : (
//                               <Send className="h-4 w-4 mr-2" />
//                             )}
//                             Submit Application
//                           </Button>
//                         </motion.div>
//                       </motion.div>
//                     )}
//                   </ProfileCard>
//                 )}

//                 {/* Instructor Profile Section */}
//                 {(user?.role === "instructor" ||
//                   user?.instructorApplication?.status === "approved") && (
//                   <ProfileCard
//                     title="Instructor Profile"
//                     icon={<Briefcase className="h-5 w-5" />}
//                     delay={0.5}
//                   >
//                     <motion.div
//                       variants={containerVariants}
//                       className="grid grid-cols-1 md:grid-cols-2 gap-6"
//                     >
//                       {[
//                         {
//                           label: "Response Time",
//                           value: formData.instructorProfile.availability,
//                           editing: isEditing ? (
//                             <select
//                               value={formData.instructorProfile.availability}
//                               onChange={(e) =>
//                                 setFormData((prev) => ({
//                                   ...prev,
//                                   instructorProfile: {
//                                     ...prev.instructorProfile,
//                                     availability: e.target.value,
//                                   },
//                                 }))
//                               }
//                               className="w-full p-3 border rounded-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500"
//                             >
//                               <option value="within-1-hour">
//                                 Within 1 hour
//                               </option>
//                               <option value="within-24-hours">
//                                 Within 24 hours
//                               </option>
//                               <option value="within-48-hours">
//                                 Within 48 hours
//                               </option>
//                               <option value="within-1-week">
//                                 Within 1 week
//                               </option>
//                             </select>
//                           ) : (
//                             <div className="flex items-center space-x-2 text-slate-600">
//                               <Clock className="h-4 w-4" />
//                               <span>
//                                 {profile.instructorProfile?.availability?.replace(
//                                   /-/g,
//                                   " "
//                                 ) || "Within 24 hours"}
//                               </span>
//                             </div>
//                           ),
//                         },
//                         {
//                           label: "Office Hours",
//                           value: formData.instructorProfile.officeHours,
//                           editing: (
//                             <Input
//                               value={formData.instructorProfile.officeHours}
//                               onChange={(e) =>
//                                 setFormData((prev) => ({
//                                   ...prev,
//                                   instructorProfile: {
//                                     ...prev.instructorProfile,
//                                     officeHours: e.target.value,
//                                   },
//                                 }))
//                               }
//                               placeholder="Mon-Fri, 9AM-5PM EST"
//                               className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
//                             />
//                           ),
//                           display: (
//                             <div className="flex items-center space-x-2 text-slate-600">
//                               <Calendar className="h-4 w-4" />
//                               <span>
//                                 {profile.instructorProfile?.officeHours ||
//                                   "Not specified"}
//                               </span>
//                             </div>
//                           ),
//                         },
//                         {
//                           label: "Contact Email",
//                           value: formData.instructorProfile.contactEmail,
//                           editing: (
//                             <Input
//                               value={formData.instructorProfile.contactEmail}
//                               onChange={(e) =>
//                                 setFormData((prev) => ({
//                                   ...prev,
//                                   instructorProfile: {
//                                     ...prev.instructorProfile,
//                                     contactEmail: e.target.value,
//                                   },
//                                 }))
//                               }
//                               placeholder="instructor@email.com"
//                               type="email"
//                               className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
//                             />
//                           ),
//                           display: (
//                             <div className="flex items-center space-x-2 text-slate-600">
//                               <Mail className="h-4 w-4" />
//                               <span>
//                                 {profile.instructorProfile?.contactEmail ||
//                                   user?.email}
//                               </span>
//                             </div>
//                           ),
//                         },
//                       ].map((field, index) => (
//                         <motion.div
//                           key={field.label}
//                           variants={itemVariants}
//                           className="space-y-2"
//                         >
//                           <label className="text-sm font-medium text-slate-700">
//                             {field.label}
//                           </label>
//                           {isEditing ? field.editing : field.display}
//                         </motion.div>
//                       ))}
//                     </motion.div>
//                   </ProfileCard>
//                 )}
//               </div>

//               {/* Right Column - Additional Info */}
//               <div className="space-y-8">
//                 {/* Recent Searches */}
//                 <ProfileCard
//                   title="Recent Searches"
//                   icon={<Search className="h-5 w-5" />}
//                   delay={0.6}
//                 >
//                   <motion.div
//                     variants={containerVariants}
//                     className="space-y-2"
//                   >
//                     {user?.recentSearches?.map(
//                       (search: string, index: number) => (
//                         <motion.div
//                           key={index}
//                           variants={itemVariants}
//                           className="flex items-center justify-between group p-2 rounded-lg hover:bg-slate-50 transition-colors"
//                         >
//                           <span className="text-slate-600 text-sm">
//                             {search}
//                           </span>
//                           <button className="opacity-0 group-hover:opacity-100 transition-all text-slate-400 hover:text-red-500">
//                             <Trash2 className="h-3 w-3" />
//                           </button>
//                         </motion.div>
//                       )
//                     )}
//                     {(!user?.recentSearches ||
//                       user.recentSearches.length === 0) && (
//                       <motion.p
//                         variants={itemVariants}
//                         className="text-slate-500 text-sm text-center py-4"
//                       >
//                         No recent searches
//                       </motion.p>
//                     )}
//                   </motion.div>
//                 </ProfileCard>

//                 {/* Application Status */}
//                 {user?.instructorApplication &&
//                   user.instructorApplication.status !== "none" && (
//                     <ProfileCard
//                       title="Instructor Application"
//                       icon={<Bookmark className="h-5 w-5" />}
//                       delay={0.7}
//                     >
//                       <motion.div
//                         variants={containerVariants}
//                         className="space-y-3"
//                       >
//                         <motion.div variants={itemVariants}>
//                           <Badge
//                             className={cn(
//                               "w-full justify-center py-2 text-sm font-medium",
//                               user.instructorApplication.status ===
//                                 "approved" &&
//                                 "bg-green-100 text-green-800 border-green-200",
//                               user.instructorApplication.status === "pending" &&
//                                 "bg-yellow-100 text-yellow-800 border-yellow-200",
//                               user.instructorApplication.status ===
//                                 "rejected" &&
//                                 "bg-red-100 text-red-800 border-red-200"
//                             )}
//                           >
//                             {user.instructorApplication.status.toUpperCase()}
//                           </Badge>
//                         </motion.div>
//                         {user.instructorApplication.message && (
//                           <motion.p
//                             variants={itemVariants}
//                             className="text-sm text-slate-600"
//                           >
//                             {user.instructorApplication.message}
//                           </motion.p>
//                         )}
//                       </motion.div>
//                     </ProfileCard>
//                   )}

//                 {/* Account Info */}
//                 <ProfileCard
//                   title="Account Information"
//                   icon={<Shield className="h-5 w-5" />}
//                   delay={0.8}
//                 >
//                   <motion.div
//                     variants={containerVariants}
//                     className="space-y-4"
//                   >
//                     {[
//                       {
//                         label: "Email Verification",
//                         value: user?.isVerified ? "Verified" : "Pending",
//                         badge: (
//                           <Badge
//                             variant={user?.isVerified ? "default" : "secondary"}
//                           >
//                             {user?.isVerified ? "Verified" : "Pending"}
//                           </Badge>
//                         ),
//                       },
//                       {
//                         label: "Member Since",
//                         value: new Date(user?.createdAt).toLocaleDateString(),
//                       },
//                       {
//                         label: "Last Updated",
//                         value: new Date(user?.updatedAt).toLocaleDateString(),
//                       },
//                     ].map((item, index) => (
//                       <motion.div
//                         key={item.label}
//                         variants={itemVariants}
//                         className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
//                       >
//                         <span className="text-slate-600 text-sm">
//                           {item.label}
//                         </span>
//                         {item.badge || (
//                           <span className="text-sm text-slate-500">
//                             {item.value}
//                           </span>
//                         )}
//                       </motion.div>
//                     ))}
//                   </motion.div>
//                 </ProfileCard>

//                 {/* Logout Button */}
//                 <motion.div
//                   variants={itemVariants}
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   <Card className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden group">
//                     <CardContent className="p-6">
//                       <Button
//                         onClick={handleLogout}
//                         disabled={logoutMutation.isPending}
//                         variant="outline"
//                         className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all duration-200 group-hover:shadow-md"
//                       >
//                         {logoutMutation.isPending ? (
//                           <Loader2 className="h-4 w-4 animate-spin mr-2" />
//                         ) : (
//                           <LogOut className="h-4 w-4 mr-2" />
//                         )}
//                         Logout
//                       </Button>
//                     </CardContent>
//                   </Card>
//                 </motion.div>
//               </div>
//             </motion.div>
//           )}

//           {/* Admin Tab */}
//           {activeTab === "admin" && user?.role === "admin" && (
//             <motion.div
//               key="admin"
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.3 }}
//             >
//               <ProfileCard
//                 title="Instructor Applications"
//                 icon={<FileText className="h-5 w-5" />}
//               >
//                 <div className="space-y-4">
//                   {instructorApplications?.data?.length > 0 ? (
//                     instructorApplications.data.map(
//                       (application: any, index: number) => (
//                         <motion.div
//                           key={application._id}
//                           initial={{ opacity: 0, y: 20 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ delay: index * 0.1 }}
//                           className="border border-slate-200 rounded-xl p-6 space-y-4 hover:shadow-lg transition-all duration-200 bg-white"
//                         >
//                           <div className="flex justify-between items-start">
//                             <div>
//                               <h4 className="font-semibold text-lg text-slate-900">
//                                 {application.name}
//                               </h4>
//                               <p className="text-slate-600 text-sm mt-1">
//                                 {application.email}
//                               </p>
//                               {application.instructorApplication.message && (
//                                 <p className="text-slate-500 text-sm mt-2 bg-slate-50 p-3 rounded-lg">
//                                   {application.instructorApplication.message}
//                                 </p>
//                               )}
//                             </div>
//                             <div className="flex space-x-2">
//                               <Button
//                                 size="sm"
//                                 onClick={() =>
//                                   handleProcessApplication(
//                                     application._id,
//                                     "approved"
//                                   )
//                                 }
//                                 disabled={processApplicationMutation.isPending}
//                                 className="bg-green-600 hover:bg-green-700"
//                               >
//                                 Approve
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() =>
//                                   handleProcessApplication(
//                                     application._id,
//                                     "rejected"
//                                   )
//                                 }
//                                 disabled={processApplicationMutation.isPending}
//                               >
//                                 Reject
//                               </Button>
//                             </div>
//                           </div>
//                           <p className="text-xs text-slate-400">
//                             Applied:{" "}
//                             {new Date(
//                               application.instructorApplication.submittedAt
//                             ).toLocaleDateString()}
//                           </p>
//                         </motion.div>
//                       )
//                     )
//                   ) : (
//                     <motion.div
//                       initial={{ opacity: 0 }}
//                       animate={{ opacity: 1 }}
//                       className="text-center py-12"
//                     >
//                       <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
//                       <p className="text-slate-500 text-lg">
//                         No pending applications
//                       </p>
//                     </motion.div>
//                   )}
//                 </div>
//               </ProfileCard>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// }

// // Enhanced Profile Card Component
// function ProfileCard({
//   title,
//   icon,
//   children,
//   className,
//   delay = 0,
// }: {
//   title: string;
//   icon: React.ReactNode;
//   children: React.ReactNode;
//   className?: string;
//   delay?: number;
// }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, delay }}
//       whileHover={{ y: -2 }}
//       className="group"
//     >
//       <Card
//         className={cn(
//           "bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 overflow-hidden",
//           className
//         )}
//       >
//         <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//         <CardHeader className="pb-4 relative z-10">
//           <CardTitle className="flex items-center space-x-3 text-xl">
//             <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
//               {icon}
//             </div>
//             <span className="bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
//               {title}
//             </span>
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="relative z-10">{children}</CardContent>
//       </Card>
//     </motion.div>
//   );
// }

// // Enhanced Skeleton Loader
// function ProfileSkeleton() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8">
//       <div className="max-w-7xl mx-auto px-4 space-y-8">
//         {/* Header Skeleton */}
//         <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-8 animate-pulse">
//           <div className="flex items-center space-x-6">
//             <div className="h-28 w-28 bg-blue-500/50 rounded-full"></div>
//             <div className="space-y-3 flex-1">
//               <div className="h-8 bg-blue-500/50 rounded w-1/3"></div>
//               <div className="h-4 bg-blue-500/50 rounded w-1/2"></div>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-2 space-y-8">
//             {[1, 2, 3].map((i) => (
//               <Card
//                 key={i}
//                 className="bg-white rounded-2xl shadow-sm border-0 animate-pulse"
//               >
//                 <CardHeader>
//                   <div className="h-6 bg-gray-200 rounded w-1/4"></div>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-3">
//                     <div className="h-4 bg-gray-200 rounded w-full"></div>
//                     <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//                     <div className="h-4 bg-gray-200 rounded w-1/2"></div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>

//           <div className="space-y-8">
//             {[1, 2].map((i) => (
//               <Card
//                 key={i}
//                 className="bg-white rounded-2xl shadow-sm border-0 animate-pulse"
//               >
//                 <CardHeader>
//                   <div className="h-6 bg-gray-200 rounded w-1/3"></div>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-2">
//                     <div className="h-4 bg-gray-200 rounded w-full"></div>
//                     <div className="h-4 bg-gray-200 rounded w-2/3"></div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Enhanced Error State Component
// function ErrorState({ error }: { error: any }) {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-4">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9, y: 20 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         transition={{ duration: 0.5, ease: "easeOut" }}
//         className="bg-white rounded-3xl p-8 shadow-2xl border border-white/20 text-center max-w-md w-full"
//       >
//         <motion.div
//           initial={{ scale: 0 }}
//           animate={{ scale: 1 }}
//           transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
//           className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
//         >
//           <X className="h-10 w-10 text-red-600" />
//         </motion.div>
//         <h2 className="text-2xl font-bold text-slate-900 mb-3 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
//           Error Loading Profile
//         </h2>
//         <p className="text-slate-600 mb-6 leading-relaxed">{error.message}</p>
//         <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
//           <Button
//             onClick={() => window.location.reload()}
//             className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
//           >
//             <Sparkles className="h-4 w-4 mr-2" />
//             Try Again
//           </Button>
//         </motion.div>
//       </motion.div>
//     </div>
//   );
// }


"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import * as authService from "@/services/auth.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Clock,
  Briefcase,
  Calendar,
  Award,
  Bookmark,
  Search,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Camera,
  Upload,
  Loader2,
  Shield,
  FileText,
  Send,
  LogOut,
  Sparkles,
  Zap,
  Target,
  Star,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const slideInVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// Utility function to generate Gmail-like avatar color based on name hash
function getAvatarColor(name: string | undefined): string {
  if (!name) return "from-blue-500 to-purple-600";

  const colorPairs = [
    "from-red-500 to-pink-600",
    "from-orange-500 to-red-600",
    "from-amber-500 to-orange-600",
    "from-yellow-500 to-amber-600",
    "from-lime-500 to-green-600",
    "from-green-500 to-emerald-600",
    "from-emerald-500 to-teal-600",
    "from-teal-500 to-cyan-600",
    "from-cyan-500 to-sky-600",
    "from-sky-500 to-blue-600",
    "from-blue-500 to-indigo-600",
    "from-indigo-500 to-violet-600",
    "from-violet-500 to-purple-600",
    "from-purple-500 to-fuchsia-600",
    "from-fuchsia-500 to-pink-600",
    "from-pink-500 to-rose-600",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorPairs.length;
  return colorPairs[index];
}

export default function Profile() {
  const { user, updateUser, logout: authLogout } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    expertise: [] as string[],
    instructorProfile: {
      availability: "within-24-hours",
      officeHours: "",
      contactEmail: "",
    },
  });
  const [newExpertise, setNewExpertise] = useState("");
  const [instructorMessage, setInstructorMessage] = useState("");

  // Initialize form data when profile data loads
  const {
    data: profileData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: authService.getMe,
  });

  useEffect(() => {
    if (profileData?.data && !isEditing) {
      const userData = profileData.data;
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        bio: userData.bio || "",
        expertise: userData.expertise || [],
        instructorProfile: userData.instructorProfile || {
          availability: "within-24-hours",
          officeHours: "",
          contactEmail: "",
        },
      });
    }
  }, [profileData?.data, isEditing]);

  const { data: instructorApplications } = useQuery({
    queryKey: ["instructorApplications"],
    queryFn: authService.getInstructorApplications,
    enabled: user?.role === "admin",
  });

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => authService.updateProfile(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      if (updateUser) {
        updateUser(response.data.data);
      }
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: authService.uploadAvatar,
    onSuccess: (response) => {
      if (updateUser) {
        updateUser(response.data.user);
      }
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setIsUploading(false);
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated.",
      });
    },
    onError: (error: any) => {
      setIsUploading(false);
      setImagePreview(null);
      toast({
        title: "Upload Failed",
        description: error.response?.data?.message || "Failed to upload image",
        variant: "destructive",
      });
    },
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: authService.deleteAvatar,
    onSuccess: (response) => {
      if (updateUser) {
        updateUser({ ...response.data.user, avatar: null });
      }
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast({
        title: "Avatar Removed",
        description: "Your profile picture has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.response?.data?.message || "Failed to remove avatar",
        variant: "destructive",
      });
    },
  });

  const becomeInstructorMutation = useMutation({
    mutationFn: () =>
      authService.becomeInstructor({ message: instructorMessage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      setInstructorMessage("");
      toast({
        title: "Application Submitted",
        description: "Your instructor application is under review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Application Failed",
        description:
          error.response?.data?.message || "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  const processApplicationMutation = useMutation({
    mutationFn: ({
      userId,
      status,
    }: {
      userId: string;
      status: "approved" | "rejected";
    }) => authService.processInstructorApplication(userId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructorApplications"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      toast({
        title: "Application Processed",
        description: "Instructor application has been updated.",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      if (authLogout) {
        authLogout();
      }
      router.push("/");
      toast({
        title: "Logged out successfully",
        description: "See you soon!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Logout Failed",
        description: error.response?.data?.message || "Failed to logout",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPEG, PNG, GIF, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/upload-avatar`,
        {
          credentials: "include",
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();
      if (result.success) {
        if (updateUser) {
          updateUser(result.user);
        }
        queryClient.invalidateQueries({ queryKey: ["userProfile"] });
        toast({
          title: "Avatar Updated",
          description: "Your profile picture has been updated.",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (profileData?.data) {
      const userData = profileData.data;
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        bio: userData.bio || "",
        expertise: userData.expertise || [],
        instructorProfile: userData.instructorProfile || {
          availability: "within-24-hours",
          officeHours: "",
          contactEmail: "",
        },
      });
    }
    setIsEditing(false);
  };

  const addExpertise = () => {
    if (
      newExpertise.trim() &&
      !formData.expertise.includes(newExpertise.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        expertise: [...prev.expertise, newExpertise.trim()],
      }));
      setNewExpertise("");
    }
  };

  const removeExpertise = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise.filter((_, i) => i !== index),
    }));
  };

  const handleBecomeInstructor = () => {
    if (!instructorMessage.trim()) {
      toast({
        title: "Message required",
        description:
          "Please provide a message for your instructor application.",
        variant: "destructive",
      });
      return;
    }
    becomeInstructorMutation.mutate();
  };

  const handleProcessApplication = (
    userId: string,
    status: "approved" | "rejected"
  ) => {
    processApplicationMutation.mutate({ userId, status });
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleRemoveAvatar = () => {
    if (
      window.confirm("Are you sure you want to remove your profile picture?")
    ) {
      deleteAvatarMutation.mutate();
    }
  };

  if (isLoading) return <ProfileSkeleton />;
  if (error) return <ErrorState error={error} />;

  const profile = profileData?.data || {};

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground shadow-lg"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Enhanced Avatar with Upload */}
              <motion.div
                className="relative group"
                whileHover={{ scale: 1.05 }}
                onHoverStart={() => setIsHoveringAvatar(true)}
                onHoverEnd={() => setIsHoveringAvatar(false)}
              >
                <Avatar className="h-20 w-20 border-4 border-primary-foreground/20 shadow-xl">
                  <AvatarImage
                    src={imagePreview || user?.avatar || ""}
                    className="object-cover"
                  />
                  <AvatarFallback
                    className={cn(
                      "text-2xl font-bold text-primary-foreground bg-gradient-to-br",
                      getAvatarColor(user?.name)
                    )}
                  >
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      user?.name?.[0]?.toUpperCase() || "U"
                    )}
                  </AvatarFallback>
                </Avatar>

                <AnimatePresence>
                  {isHoveringAvatar && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer backdrop-blur-sm"
                    >
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={triggerFileInput}
                        disabled={isUploading}
                        className="text-primary-foreground p-2 bg-white/20 rounded-full transition-all hover:bg-white/30"
                      >
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Camera className="h-4 w-4" />
                        )}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {(user?.avatar || imagePreview) && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleRemoveAvatar}
                    disabled={deleteAvatarMutation.isPending || isUploading}
                    className="absolute -bottom-1 -right-1 bg-destructive text-destructive-foreground p-1.5 rounded-full hover:bg-destructive/90 transition-all shadow-lg ring-2 ring-primary-foreground"
                  >
                    {deleteAvatarMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </motion.button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </motion.div>

              <motion.div variants={slideInVariants} initial="hidden" animate="visible">
                <motion.h1 className="text-2xl font-bold mb-1" whileHover={{ scale: 1.02 }}>
                  {user?.name}
                </motion.h1>
                <div className="flex flex-wrap items-center gap-2 text-primary-foreground/80">
                  <div className="flex items-center space-x-1 bg-primary-foreground/10 px-2 py-1 rounded-full text-sm">
                    <Mail className="h-3 w-3" />
                    <span>{user?.email}</span>
                  </div>
                  <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {user?.role?.toUpperCase()}
                  </Badge>
                  {user?.isVerified && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-100">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </motion.div>
            </div>

            <motion.div className="mt-4 md:mt-0 flex flex-col space-y-2" variants={slideInVariants} initial="hidden" animate="visible">
              {!isEditing ? (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-md"
                    size="sm"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </motion.div>
              ) : (
                <motion.div className="flex space-x-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                    className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                    size="sm"
                  >
                    {updateProfileMutation.isPending ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    {updateProfileMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-lg shadow-sm border p-1"
        >
          <div className="flex space-x-1">
            {[
              {
                id: "profile",
                label: "Profile",
                icon: <User className="h-4 w-4" />,
              },
              ...(user?.role === "admin"
                ? [
                    {
                      id: "admin",
                      label: "Admin",
                      icon: <Shield className="h-4 w-4" />,
                    },
                  ]
                : []),
            ].map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 flex-1 justify-center relative overflow-hidden text-sm font-medium",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left Column - Basic Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <ProfileCard title="Personal Information" icon={<User className="h-4 w-4" />} delay={0.1}>
                  <div className="space-y-4">
                    <motion.div variants={itemVariants}>
                      <label className="text-sm font-medium text-foreground mb-2 block">Full Name</label>
                      {isEditing ? (
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <p className="text-foreground">{profile.name}</p>
                      )}
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <label className="text-sm font-medium text-foreground mb-2 block">Email Address</label>
                      {isEditing ? (
                        <Input
                          value={formData.email}
                          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                          disabled={true}
                          type="email"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <p className="text-foreground">{profile.email}</p>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </ProfileCard>

                {/* Bio Section */}
                <ProfileCard title="About Me" icon={<Star className="h-4 w-4" />} delay={0.2}>
                  {isEditing ? (
                    <motion.div variants={itemVariants}>
                      <Textarea
                        value={formData.bio}
                        onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                        className="min-h-[100px] resize-none"
                      />
                    </motion.div>
                  ) : (
                    <motion.p variants={itemVariants} className="text-muted-foreground leading-relaxed">
                      {profile.bio || (
                        <span className="text-muted-foreground italic">No bio provided yet. Share something about yourself!</span>
                      )}
                    </motion.p>
                  )}
                </ProfileCard>

                {/* Expertise Section */}
                <ProfileCard title="Areas of Expertise" icon={<Award className="h-4 w-4" />} delay={0.3}>
                  {isEditing ? (
                    <motion.div variants={itemVariants} className="space-y-3">
                      <div className="flex space-x-2">
                        <Input
                          value={newExpertise}
                          onChange={(e) => setNewExpertise(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addExpertise())}
                          placeholder="Add your expertise..."
                        />
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button onClick={addExpertise} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                      <motion.div layout className="flex flex-wrap gap-2">
                        {formData.expertise.map((skill, index) => (
                          <motion.div
                            key={skill}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Badge variant="secondary" className="px-2 py-1">
                              {skill}
                              <button
                                onClick={() => removeExpertise(index)}
                                className="ml-1 hover:text-destructive transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div layout className="flex flex-wrap gap-2">
                      {profile.expertise?.length > 0 ? (
                        profile.expertise.map((skill: string, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Badge variant="secondary" className="px-3 py-1">
                              <Target className="h-3 w-3 mr-1" />
                              {skill}
                            </Badge>
                          </motion.div>
                        ))
                      ) : (
                        <motion.p variants={itemVariants} className="text-muted-foreground italic">
                          No expertise added yet
                        </motion.p>
                      )}
                    </motion.div>
                  )}
                </ProfileCard>

                {/* Instructor Application Section */}
                {user?.role === "student" && (
                  <ProfileCard title="Become an Instructor" icon={<Zap className="h-4 w-4" />} delay={0.4}>
                    {profile.instructorApplication?.status === "pending" ? (
                      <motion.div variants={containerVariants} className="text-center space-y-3">
                        <motion.div variants={itemVariants}>
                          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-800 dark:text-yellow-200">
                            <Clock className="h-4 w-4 mr-1" />
                            Application Pending Review
                          </Badge>
                        </motion.div>
                        <motion.p variants={itemVariants} className="text-muted-foreground text-sm">
                          Your instructor application is under review. We'll notify you once a decision is made.
                        </motion.p>
                        {profile.instructorApplication.message && (
                          <motion.div variants={itemVariants} className="bg-muted p-3 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              <strong>Your message:</strong> {profile.instructorApplication.message}
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    ) : profile.instructorApplication?.status === "rejected" ? (
                      <motion.div variants={containerVariants} className="text-center space-y-3">
                        <motion.div variants={itemVariants}>
                          <Badge variant="secondary" className="bg-red-500/20 text-red-800 dark:text-red-200">
                            Application Rejected
                          </Badge>
                        </motion.div>
                        <motion.p variants={itemVariants} className="text-muted-foreground text-sm">
                          Your instructor application was not approved at this time.
                        </motion.p>
                        <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button onClick={() => setInstructorMessage("")} size="sm">
                            Reapply as Instructor
                          </Button>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div variants={containerVariants} className="space-y-3">
                        <motion.p variants={itemVariants} className="text-muted-foreground text-sm">
                          Share why you'd like to become an instructor and what you can teach.
                        </motion.p>
                        <motion.div variants={itemVariants}>
                          <Textarea
                            value={instructorMessage}
                            onChange={(e) => setInstructorMessage(e.target.value)}
                            placeholder="Tell us about your teaching experience, expertise, and what courses you'd like to create..."
                            className="min-h-[80px] resize-none"
                          />
                        </motion.div>
                        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            onClick={handleBecomeInstructor}
                            disabled={becomeInstructorMutation.isPending || !instructorMessage.trim()}
                            className="w-full"
                          >
                            {becomeInstructorMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Send className="h-4 w-4 mr-2" />
                            )}
                            Submit Application
                          </Button>
                        </motion.div>
                      </motion.div>
                    )}
                  </ProfileCard>
                )}

                {/* Instructor Profile Section */}
                {(user?.role === "instructor" || user?.instructorApplication?.status === "approved") && (
                  <ProfileCard title="Instructor Profile" icon={<Briefcase className="h-4 w-4" />} delay={0.5}>
                    <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          label: "Response Time",
                          value: formData.instructorProfile.availability,
                          editing: isEditing ? (
                            <select
                              value={formData.instructorProfile.availability}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  instructorProfile: {
                                    ...prev.instructorProfile,
                                    availability: e.target.value,
                                  },
                                }))
                              }
                              className="w-full p-2 border rounded-md"
                            >
                              <option value="within-1-hour">Within 1 hour</option>
                              <option value="within-24-hours">Within 24 hours</option>
                              <option value="within-48-hours">Within 48 hours</option>
                              <option value="within-1-week">Within 1 week</option>
                            </select>
                          ) : (
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{profile.instructorProfile?.availability?.replace(/-/g, " ") || "Within 24 hours"}</span>
                            </div>
                          ),
                        },
                        {
                          label: "Office Hours",
                          value: formData.instructorProfile.officeHours,
                          editing: (
                            <Input
                              value={formData.instructorProfile.officeHours}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  instructorProfile: {
                                    ...prev.instructorProfile,
                                    officeHours: e.target.value,
                                  },
                                }))
                              }
                              placeholder="Mon-Fri, 9AM-5PM EST"
                            />
                          ),
                          display: (
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{profile.instructorProfile?.officeHours || "Not specified"}</span>
                            </div>
                          ),
                        },
                        {
                          label: "Contact Email",
                          value: formData.instructorProfile.contactEmail,
                          editing: (
                            <Input
                              value={formData.instructorProfile.contactEmail}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  instructorProfile: {
                                    ...prev.instructorProfile,
                                    contactEmail: e.target.value,
                                  },
                                }))
                              }
                              placeholder="instructor@email.com"
                              type="email"
                            />
                          ),
                          display: (
                            <div className="flex items-center space-x-2 text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              <span>{profile.instructorProfile?.contactEmail || user?.email}</span>
                            </div>
                          ),
                        },
                      ].map((field, index) => (
                        <motion.div key={field.label} variants={itemVariants} className="space-y-2">
                          <label className="text-sm font-medium text-foreground">{field.label}</label>
                          {isEditing ? field.editing : field.display}
                        </motion.div>
                      ))}
                    </motion.div>
                  </ProfileCard>
                )}
              </div>

              {/* Right Column - Additional Info */}
              <div className="space-y-6">
                {/* Recent Searches */}
                <ProfileCard title="Recent Searches" icon={<Search className="h-4 w-4" />} delay={0.6}>
                  <motion.div variants={containerVariants} className="space-y-2">
                    {user?.recentSearches?.map((search: string, index: number) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        className="flex items-center justify-between group p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <span className="text-muted-foreground text-sm truncate">{search}</span>
                        <button className="opacity-0 group-hover:opacity-100 transition-all text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </motion.div>
                    ))}
                    {(!user?.recentSearches || user.recentSearches.length === 0) && (
                      <motion.p variants={itemVariants} className="text-muted-foreground text-sm text-center py-4">
                        No recent searches
                      </motion.p>
                    )}
                  </motion.div>
                </ProfileCard>

                {/* Application Status */}
                {user?.instructorApplication && user.instructorApplication.status !== "none" && (
                  <ProfileCard title="Instructor Application" icon={<Bookmark className="h-4 w-4" />} delay={0.7}>
                    <motion.div variants={containerVariants} className="space-y-3">
                      <motion.div variants={itemVariants}>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "w-full justify-center py-1 text-sm",
                            user.instructorApplication.status === "approved" &&
                              "bg-green-500/20 text-green-800 dark:text-green-200",
                            user.instructorApplication.status === "pending" &&
                              "bg-yellow-500/20 text-yellow-800 dark:text-yellow-200",
                            user.instructorApplication.status === "rejected" &&
                              "bg-red-500/20 text-red-800 dark:text-red-200"
                          )}
                        >
                          {user.instructorApplication.status.toUpperCase()}
                        </Badge>
                      </motion.div>
                      {user.instructorApplication.message && (
                        <motion.p variants={itemVariants} className="text-sm text-muted-foreground">
                          {user.instructorApplication.message}
                        </motion.p>
                      )}
                    </motion.div>
                  </ProfileCard>
                )}

                {/* Account Info */}
                <ProfileCard title="Account Information" icon={<Shield className="h-4 w-4" />} delay={0.8}>
                  <motion.div variants={containerVariants} className="space-y-3">
                    {[
                      {
                        label: "Email Verification",
                        value: user?.isVerified ? "Verified" : "Pending",
                        badge: (
                          <Badge variant={user?.isVerified ? "default" : "secondary"}>
                            {user?.isVerified ? "Verified" : "Pending"}
                          </Badge>
                        ),
                      },
                      {
                        label: "Member Since",
                        value: new Date(user?.createdAt).toLocaleDateString(),
                      },
                      {
                        label: "Last Updated",
                        value: new Date(user?.updatedAt).toLocaleDateString(),
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        variants={itemVariants}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                      >
                        <span className="text-muted-foreground text-sm">{item.label}</span>
                        {item.badge || <span className="text-sm text-muted-foreground">{item.value}</span>}
                      </motion.div>
                    ))}
                  </motion.div>
                </ProfileCard>

                {/* Logout Button */}
                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Card className="border-destructive/20">
                    <CardContent className="p-4">
                      <Button
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                        variant="outline"
                        className="w-full text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                      >
                        {logoutMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <LogOut className="h-4 w-4 mr-2" />
                        )}
                        Logout
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Admin Tab */}
          {activeTab === "admin" && user?.role === "admin" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProfileCard title="Instructor Applications" icon={<FileText className="h-4 w-4" />}>
                <div className="space-y-4">
                  {instructorApplications?.data?.length > 0 ? (
                    instructorApplications.data.map((application: any, index: number) => (
                      <motion.div
                        key={application._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border rounded-lg p-4 space-y-3 hover:shadow-md transition-all duration-200 bg-card"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-foreground">{application.name}</h4>
                            <p className="text-muted-foreground text-sm mt-1">{application.email}</p>
                            {application.instructorApplication.message && (
                              <p className="text-muted-foreground text-sm mt-2 bg-muted p-3 rounded-md">
                                {application.instructorApplication.message}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleProcessApplication(application._id, "approved")}
                              disabled={processApplicationMutation.isPending}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleProcessApplication(application._id, "rejected")}
                              disabled={processApplicationMutation.isPending}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Applied: {new Date(application.instructorApplication.submittedAt).toLocaleDateString()}
                        </p>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No pending applications</p>
                    </motion.div>
                  )}
                </div>
              </ProfileCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Enhanced Profile Card Component
function ProfileCard({
  title,
  icon,
  children,
  className,
  delay = 0,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card className={cn("shadow-sm hover:shadow-md transition-all duration-300", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <div className="p-1.5 bg-primary rounded-md text-primary-foreground">{icon}</div>
            <span>{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );
}

// Enhanced Skeleton Loader
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Header Skeleton */}
        <div className="bg-muted rounded-2xl p-6 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="h-20 w-20 bg-muted-foreground/20 rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-muted-foreground/20 rounded w-1/3"></div>
              <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-muted-foreground/20 rounded w-1/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted-foreground/20 rounded w-full"></div>
                    <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 bg-muted-foreground/20 rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted-foreground/20 rounded w-full"></div>
                    <div className="h-4 bg-muted-foreground/20 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Error State Component
function ErrorState({ error }: { error: any }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-card rounded-xl p-6 shadow-lg border text-center max-w-md w-full"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
          className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <X className="h-8 w-8 text-destructive" />
        </motion.div>
        <h2 className="text-xl font-bold text-foreground mb-2">Error Loading Profile</h2>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={() => window.location.reload()} className="w-full">
            <Sparkles className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
