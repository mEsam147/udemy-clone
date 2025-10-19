"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { resetPassword, validateResetToken } from "@/services/auth.service";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<
    "valid" | "invalid" | "checking"
  >("checking");
  const [userEmail, setUserEmail] = useState<string>("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const passwordValue = watch("password", "");

  // Validate token on page load
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setTokenStatus("invalid");
        setMessage({
          type: "error",
          text: "No reset token provided in the URL",
        });
        setValidating(false);
        return;
      }

      try {
        setValidating(true);
        const result = await validateResetToken(token);

        if (result.success) {
          setTokenStatus("valid");
          setUserEmail(result.email);
          setMessage(null);
        } else {
          setTokenStatus("invalid");
          setMessage({
            type: "error",
            text: result.message || "Invalid or expired reset token",
          });
        }
      } catch (error: any) {
        setTokenStatus("invalid");
        setMessage({
          type: "error",
          text:
            error.message ||
            "Failed to validate reset token. Please try again.",
        });
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const onSubmit = async (data: ResetFormData) => {
    if (!token) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await resetPassword(token, data.password);

      if (result.success) {
        setMessage({
          type: "success",
          text: "✅ Password reset successfully! Redirecting to login page...",
        });

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/auth/signin");
        }, 3000);
      } else {
        setMessage({
          type: "error",
          text: result.message || "Failed to reset password. Please try again.",
        });
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text:
          error.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, text: "" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengthText = [
      "Very Weak",
      "Weak",
      "Fair",
      "Good",
      "Strong",
      "Very Strong",
    ][strength];

    return { strength, text: strengthText };
  };

  const passwordStrength = getPasswordStrength(passwordValue);

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Reset Link
            </h2>
            <p className="text-gray-600">
              Please wait while we validate your reset link...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (tokenStatus === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center  p-4">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Reset Link
            </h2>
            <p className="text-gray-600 mb-4 line-clamp-2">{message?.text}</p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/auth/forgot-password")}
                className="w-full"
              >
                Request New Reset Link
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/auth/signin")}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center  w-full p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="w-full">
          <CardHeader className="text-center relative">
            <Button
              variant="ghost"
              onClick={() => router.push("/auth/signin")}
              className="absolute left-0 top-0"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <CardTitle className="text-2xl font-bold">
              Reset Your Password
            </CardTitle>
            <p className="text-gray-600 text-sm">
              For account: <span className="font-medium">{userEmail}</span>
            </p>
          </CardHeader>

          <CardContent>
            {message && (
              <Alert
                variant={message.type === "success" ? "default" : "destructive"}
                className="mb-4"
              >
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    {...register("password")}
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {passwordValue && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Password strength: </span>
                      <span
                        className={`font-medium ${
                          passwordStrength.strength <= 2
                            ? "text-red-600"
                            : passwordStrength.strength <= 3
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {passwordStrength.text}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          passwordStrength.strength <= 1
                            ? "bg-red-500 w-1/5"
                            : passwordStrength.strength <= 2
                            ? "bg-red-400 w-2/5"
                            : passwordStrength.strength <= 3
                            ? "bg-yellow-500 w-3/5"
                            : passwordStrength.strength <= 4
                            ? "bg-green-400 w-4/5"
                            : "bg-green-600 w-full"
                        }`}
                      />
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    {...register("confirmPassword")}
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Reset Password
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                Password Requirements:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• At least 8 characters long</li>
                <li>• One uppercase letter (A-Z)</li>
                <li>• One lowercase letter (a-z)</li>
                <li>• One number (0-9)</li>
                <li>• One special character (!@#$%^&*)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
