import { type NextRequest, NextResponse } from "next/server"
import { signUpWithSupabase } from "@/lib/api-client"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    // TODO: Replace with actual Supabase authentication
    const result = await signUpWithSupabase(email, password, name)

    return NextResponse.json({
      success: true,
      user: result.user,
      message: "Please check your email to verify your account",
    })
  } catch (error) {
    console.error("Sign up error:", error)
    return NextResponse.json({ error: "Failed to create account" }, { status: 400 })
  }
}
