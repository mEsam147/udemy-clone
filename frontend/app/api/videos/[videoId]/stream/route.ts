import { type NextRequest, NextResponse } from "next/server"
import { getSignedVideoUrl } from "@/lib/api-client"

export async function GET(request: NextRequest, { params }: { params: { videoId: string } }) {
  try {
    const { videoId } = params

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 })
    }

    // TODO: Replace with actual video streaming service
    const signedUrl = await getSignedVideoUrl(videoId)

    return NextResponse.redirect(signedUrl)
  } catch (error) {
    console.error("Video streaming error:", error)
    return NextResponse.json({ error: "Failed to stream video" }, { status: 500 })
  }
}
