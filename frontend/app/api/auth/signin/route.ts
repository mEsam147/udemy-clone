import { type NextRequest, NextResponse } from "next/server"
import { signInWithSupabase } from "@/lib/api-client"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // TODO: Replace with actual Supabase authentication
    const result = await signInWithSupabase(email, password)

    return NextResponse.json({ success: true, user: result.user })
  } catch (error) {
    console.error("Sign in error:", error)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }
}
