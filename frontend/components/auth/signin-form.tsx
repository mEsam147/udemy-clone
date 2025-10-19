

// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { motion } from "framer-motion";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Separator } from "@/components/ui/separator";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react";
// import { SocialLoginButton } from "@/components/auth/social-login-button";
// import { login } from "@/services/auth.service";
// import { toast } from "sonner";
// import { setTokenCookie } from "@/lib/cookies";
// import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "@/context/AuthContext";

// const signInSchema = z.object({
//   email: z.string().email("Please enter a valid email address"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
// });

// type SignInFormData = z.infer<typeof signInSchema>;

// export function SignInForm() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);

//   const { setIsAuthenticated, checkAuth } = useAuth();
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<SignInFormData>({
//     resolver: zodResolver(signInSchema),
//   });

//   const { toast } = useToast();
//   const Router = useRouter();

//   const onSubmit = async (data: SignInFormData) => {
//     setIsLoading(true);
//     setError(null);
//     setSuccess(null);
//     try {
//       const res = await login({
//         email: data.email,
//         password: data.password,
//       });

//       if (res?.success) {
//         setTokenCookie(res.token);
//         setIsAuthenticated(true);
        
//         // Check authentication state immediately after login
//         await checkAuth();

//         setSuccess("Login successfully!");

//         toast({
//           title: "Login successfully!",
//           description: "You have successfully logged in to your account.",
//         });
        
//         Router.push("/");
//       }
//     } catch (err: any) {
//       setError(err.message || "Failed to create account");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleSocialLogin = async (provider: "google" | "github") => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}`;
//     } catch (err) {
//       setError(`Failed to sign up with ${provider}. Please try again.`);
//       console.error(`${provider} signup error:`, err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="text-center">
//         <motion.h1
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="text-2xl font-bold"
//         >
//           Sign In
//         </motion.h1>
//         <motion.p
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: 0.1 }}
//           className="text-muted-foreground mt-2"
//         >
//           Welcome back! Please sign in to your account.
//         </motion.p>
//       </div>

//       {error && (
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.3 }}
//         >
//           <Alert variant="destructive">
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         </motion.div>
//       )}

//       <motion.form
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, delay: 0.2 }}
//         onSubmit={handleSubmit(onSubmit)}
//         className="space-y-4"
//       >
//         <div className="space-y-2">
//           <Label htmlFor="email">Email</Label>
//           <div className="relative">
//             <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//             <Input
//               id="email"
//               type="email"
//               placeholder="john@example.com"
//               className="pl-10"
//               {...register("email")}
//               disabled={isLoading}
//             />
//           </div>
//           {errors.email && (
//             <p className="text-sm text-destructive">{errors.email.message}</p>
//           )}
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="password">Password</Label>
//           <div className="relative">
//             <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//             <Input
//               id="password"
//               type={showPassword ? "text" : "password"}
//               placeholder="••••••••"
//               className="pl-10 pr-10"
//               {...register("password")}
//               disabled={isLoading}
//             />
//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
//               disabled={isLoading}
//             >
//               {showPassword ? (
//                 <EyeOff className="h-4 w-4" />
//               ) : (
//                 <Eye className="h-4 w-4" />
//               )}
//             </button>
//           </div>
//           {errors.password && (
//             <p className="text-sm text-destructive">
//               {errors.password.message}
//             </p>
//           )}
//         </div>

//         <div className="flex items-center justify-between">
//           <Link
//             href="/auth/forgot-password"
//             className="text-sm text-brand-primary hover:underline"
//           >
//             Forgot Password?
//           </Link>
//         </div>

//         <Button type="submit" className="w-full" disabled={isLoading}>
//           {isLoading ? (
//             <>
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               Signing in...
//             </>
//           ) : (
//             "Sign In"
//           )}
//         </Button>
//       </motion.form>

//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, delay: 0.3 }}
//       >
//         <div className="relative">
//           <div className="absolute inset-0 flex items-center">
//             <Separator className="w-full" />
//           </div>
//           <div className="relative flex justify-center text-xs uppercase">
//             <span className="bg-background px-2 text-muted-foreground">
//               Or
//             </span>
//           </div>
//         </div>

//         <div className="grid grid-cols-2 gap-3 mt-4">
//           <SocialLoginButton
//             provider="google"
//             onClick={() => handleSocialLogin("google")}
//             disabled={isLoading}
//           />
//           <SocialLoginButton
//             provider="github"
//             onClick={() => handleSocialLogin("github")}
//             disabled={isLoading}
//           />
//         </div>
//       </motion.div>

//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, delay: 0.4 }}
//         className="text-center"
//       >
//         <p className="text-sm text-muted-foreground">
//           Don't have an account?{" "}
//           <Link
//             href="/auth/signup"
//             className="text-brand-primary hover:underline font-medium"
//           >
//             Sign Up
//           </Link>
//         </p>
//       </motion.div>
//     </div>
//   );
// }



// components/auth/SignInForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { SocialLoginButton } from "@/components/auth/social-login-button";
import { login } from "@/services/auth.service";
import { enrollmentsService } from "@/services/enrollment.service";
import { getCourseDetails } from "@/services/course.service";
import { toast } from "sonner";
import { setTokenCookie } from "@/lib/cookies";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { setIsAuthenticated, checkAuth } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const action = searchParams.get("action");

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await login({
        email: data.email,
        password: data.password,
      });

      if (res?.success) {
        setTokenCookie(res.token);
        setIsAuthenticated(true);
        await checkAuth();

        setSuccess("Login successful!");
        toast({
          title: "Login successful!",
          description: "You have successfully logged in to your account.",
        });

        // Handle redirect and enrollment
        if (redirect && action === "enroll") {
          // Extract courseId from redirect URL (e.g., /courses/courseId)
          const courseId = redirect.split("/courses/")[1]?.split("/")[0];
          if (courseId) {
            try {
              const enrollmentCheck = await enrollmentsService.checkEnrollment(courseId);
              if (!enrollmentCheck.isEnrolled) {
                const courseDetails = await getCourseDetails(courseId);
                const isFree = courseDetails.isFree || courseDetails.price === 0;

                if (isFree) {
                  const enrollResult = await enrollmentsService.enrollInCourse(courseId);
                  if (enrollResult.success) {
                    toast({
                      title: "Enrolled successfully!",
                      description: "You have been enrolled in the course.",
                    });
                    router.push(`/courses/${courseId}/learn`);
                  } else {
                    throw new Error(enrollResult.message || "Failed to enroll");
                  }
                } else {
                  router.push(`/courses/${courseId}/checkout`);
                }
              } else {
                router.push(`/courses/${courseId}/learn`);
              }
            } catch (enrollError: any) {
              setError(enrollError.message || "Failed to enroll in the course");
              toast({
                variant: "destructive",
                title: "Enrollment failed",
                description: enrollError.message || "Failed to enroll in the course",
              });
              router.push(redirect); // Redirect to course page even if enrollment fails
            }
          } else {
            router.push(redirect);
          }
        } else {
          router.push(redirect || "/");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
      toast({
        variant: "destructive",
        title: "Login failed",
        description: err.message || "Failed to sign in",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    setIsLoading(true);
    setError(null);

    try {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}?redirect=${encodeURIComponent(
        redirect || "/"
      )}&action=${encodeURIComponent(action || "")}`;
    } catch (err) {
      setError(`Failed to sign in with ${provider}. Please try again.`);
      console.error(`${provider} sign-in error:`, err);
      toast({
        variant: "destructive",
        title: "Social login failed",
        description: `Failed to sign in with ${provider}. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto p-4 sm:p-6">
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl font-bold"
        >
          Sign In
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-muted-foreground mt-2"
        >
          Welcome back! Please sign in to your account.
        </motion.p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              className="pl-10"
              {...register("email")}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pl-10 pr-10"
              {...register("password")}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Link
            href="/auth/forgot-password"
            className="text-sm text-brand-primary hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </motion.form>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <SocialLoginButton
            provider="google"
            onClick={() => handleSocialLogin("google")}
            disabled={isLoading}
          />
          <SocialLoginButton
            provider="github"
            onClick={() => handleSocialLogin("github")}
            disabled={isLoading}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center"
      >
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-brand-primary hover:underline font-medium"
          >
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
