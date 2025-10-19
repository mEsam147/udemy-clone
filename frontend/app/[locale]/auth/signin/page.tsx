import type { Metadata } from "next"
import { SignInForm } from "@/components/auth/signin-form"
import { AuthLayout } from "@/components/auth/auth-layout"

export const metadata: Metadata = {
  title: "Sign In - Mini Udemy",
  description: "Sign in to your Mini Udemy account to continue learning",
}

export default function SignInPage() {
  return (
    <AuthLayout>
      <SignInForm />
    </AuthLayout>
  )
}
