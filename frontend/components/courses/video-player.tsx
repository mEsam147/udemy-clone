"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Pause, Volume2, VolumeX, Maximize, Lock } from "lucide-react"
import { fetchSignedVideoUrl } from "@/lib/api"

interface VideoPlayerProps {
  videoUrl?: string
  thumbnailUrl?: string
  title: string
  isPreview?: boolean
}

export function VideoPlayer({ videoUrl, thumbnailUrl, title, isPreview = false }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handlePlayPause = async () => {
    if (!videoRef.current) return

    if (isPreview && !signedUrl) {
      // For preview, show limited content
      setIsPlaying(!isPlaying)
      return
    }

    if (!signedUrl && videoUrl) {
      setIsLoading(true)
      try {
        // TODO: Replace with actual signed URL fetch
        const { url } = await fetchSignedVideoUrl(videoUrl)
        setSignedUrl(url)
      } catch (error) {
        console.error("Error fetching signed URL:", error)
        return
      } finally {
        setIsLoading(false)
      }
    }

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleFullscreen = () => {
    if (!videoRef.current) return
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen()
    }
  }

  return (
    <Card className="overflow-hidden bg-black">
      <div
        className="relative aspect-video bg-black group cursor-pointer"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        onClick={handlePlayPause}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          poster={thumbnailUrl || "/placeholder.svg?height=400&width=600"}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        >
          {signedUrl && <source src={signedUrl} type="video/mp4" />}
          Your browser does not support the video tag.
        </video>

        {/* Thumbnail Overlay for Preview */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
              ) : (
                <Play className="h-8 w-8 text-brand-primary ml-1" />
              )}
            </motion.div>
          </div>
        )}

        {/* Preview Lock Overlay */}
        {isPreview && (
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full flex items-center gap-2 text-sm">
            <Lock className="h-4 w-4" />
            Preview
          </div>
        )}

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showControls ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handlePlayPause()
                }}
                className="text-white hover:text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleMute()
                }}
                className="text-white hover:text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white text-sm">{title}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleFullscreen()
                }}
                className="text-white hover:text-white hover:bg-white/20"
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </Card>
  )
}
