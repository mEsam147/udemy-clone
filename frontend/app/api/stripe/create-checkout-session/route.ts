import { type NextRequest, NextResponse } from "next/server"
import { createStripeCheckoutSession } from "@/lib/api-client"

export async function POST(request: NextRequest) {
  try {
    const { courseId, userId } = await request.json()

    if (!courseId || !userId) {
      return NextResponse.json({ error: "Course ID and User ID are required" }, { status: 400 })
    }

    // TODO: Replace with actual Stripe integration
    const sessionId = await createStripeCheckoutSession(courseId, userId)

    return NextResponse.json({ sessionId })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
