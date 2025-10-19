"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Download,
  BookOpen,
  Lock,
  CheckCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Lesson } from "@/lib/types"

interface AdvancedVideoPlayerProps {
  lesson: Lesson
  isEnrolled: boolean
  onProgress?: (progress: number) => void
  onComplete?: () => void
  nextLesson?: Lesson
  previousLesson?: Lesson
  onLessonChange?: (lessonId: string) => void
}

const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
const videoQualities = [
  { label: "Auto", value: "auto" },
  { label: "1080p", value: "1080" },
  { label: "720p", value: "720" },
  { label: "480p", value: "480" },
  { label: "360p", value: "360" },
]

export function AdvancedVideoPlayer({
  lesson,
  isEnrolled,
  onProgress,
  onComplete,
  nextLesson,
  previousLesson,
  onLessonChange,
}: AdvancedVideoPlayerProps) {
  const { toast } = useToast()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState([100])
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [quality, setQuality] = useState("auto")
  const [showSettings, setShowSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasWatched, setHasWatched] = useState(false)
  const [watchProgress, setWatchProgress] = useState(0)

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (showControls && isPlaying) {
      timeout = setTimeout(() => setShowControls(false), 3000)
    }
    return () => clearTimeout(timeout)
  }, [showControls, isPlaying])

  // Update progress
  useEffect(() => {
    if (duration > 0) {
      const progress = (currentTime / duration) * 100
      setWatchProgress(progress)
      onProgress?.(progress)

      // Mark as complete when 90% watched
      if (progress >= 90 && !hasWatched) {
        setHasWatched(true)
        onComplete?.()
        toast({
          title: "Lesson completed!",
          description: "Great job! You've completed this lesson.",
        })
      }
    }
  }, [currentTime, duration, hasWatched, onProgress, onComplete, toast])

  const handlePlayPause = () => {
    if (!videoRef.current) return

    if (!isEnrolled && !lesson.is_preview) {
      toast({
        title: "Enrollment required",
        description: "Please enroll in the course to watch this lesson.",
        variant: "destructive",
      })
      return
    }

    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      const newTime = (value[0] / 100) * duration
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0] / 100
      videoRef.current.volume = newVolume
      setVolume(value)
      setIsMuted(newVolume === 0)
    }
  }

  const handleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleSpeedChange = (speed: string) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = Number.parseFloat(speed)
      setPlaybackSpeed(Number.parseFloat(speed))
    }
  }

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds))
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <Card className="overflow-hidden bg-black relative">
      <div
        className="relative aspect-video bg-black group cursor-pointer"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => !showSettings && setShowControls(false)}
        onClick={handlePlayPause}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          poster={`/placeholder.svg?height=400&width=600&query=${encodeURIComponent(lesson.title)}`}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onWaiting={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
        >
          {lesson.video_url && <source src={lesson.video_url} type="video/mp4" />}
          Your browser does not support the video tag.
        </video>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
          </div>
        )}

        {/* Play Button Overlay */}
        {!isPlaying && !isLoading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
            >
              <Play className="h-8 w-8 text-brand-primary ml-1" />
            </motion.div>
          </div>
        )}

        {/* Preview/Lock Overlay */}
        {!isEnrolled && !lesson.is_preview && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center text-white">
              <Lock className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Lesson Locked</h3>
              <p className="text-sm opacity-80 mb-4">Enroll in the course to access this lesson</p>
              <Button variant="secondary">Enroll Now</Button>
            </div>
          </div>
        )}

        {/* Lesson Info Overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <div className="bg-black/70 text-white px-3 py-2 rounded-lg">
            <h3 className="font-medium text-sm">{lesson.title}</h3>
            <p className="text-xs opacity-80">{formatTime(duration)}</p>
          </div>
          <div className="flex gap-2">
            {lesson.is_preview && (
              <Badge className="bg-green-500">
                <Play className="h-3 w-3 mr-1" />
                Preview
              </Badge>
            )}
            {hasWatched && (
              <Badge className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-16 left-4 right-4">
          <div className="w-full bg-white/20 rounded-full h-1">
            <div
              className="bg-brand-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4"
            >
              {/* Progress Slider */}
              <div className="mb-4">
                <Slider
                  value={[progressPercentage]}
                  onValueChange={handleSeek}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-white/70 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                {/* Left Controls */}
                <div className="flex items-center gap-2">
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
                      handleSkip(-10)
                    }}
                    className="text-white hover:text-white hover:bg-white/20"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSkip(10)
                    }}
                    className="text-white hover:text-white hover:bg-white/20"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  {/* Volume Control */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMute()
                      }}
                      className="text-white hover:text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                    <div className="w-20">
                      <Slider value={volume} onValueChange={handleVolumeChange} max={100} step={1} className="w-full" />
                    </div>
                  </div>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                  {/* Speed Control */}
                  <Select value={playbackSpeed.toString()} onValueChange={handleSpeedChange}>
                    <SelectTrigger className="w-16 h-8 text-white border-white/20 bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {playbackSpeeds.map((speed) => (
                        <SelectItem key={speed} value={speed.toString()}>
                          {speed}x
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowSettings(!showSettings)
                    }}
                    className="text-white hover:text-white hover:bg-white/20"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleFullscreen()
                    }}
                    className="text-white hover:text-white hover:bg-white/20"
                  >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute bottom-20 right-4 bg-black/90 text-white rounded-lg p-4 min-w-48"
            >
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Quality</label>
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger className="w-full text-white border-white/20 bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {videoQualities.map((q) => (
                        <SelectItem key={q.value} value={q.value}>
                          {q.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Separator className="bg-white/20" />
                <div>
                  <label className="text-sm font-medium mb-2 block">Playback Speed</label>
                  <Select value={playbackSpeed.toString()} onValueChange={handleSpeedChange}>
                    <SelectTrigger className="w-full text-white border-white/20 bg-transparent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {playbackSpeeds.map((speed) => (
                        <SelectItem key={speed} value={speed.toString()}>
                          {speed}x
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lesson Navigation */}
      {(previousLesson || nextLesson) && (
        <div className="bg-muted/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {previousLesson && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onLessonChange?.(previousLesson.id)}
                className="flex items-center gap-2"
              >
                <SkipBack className="h-4 w-4" />
                Previous
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4">
            {lesson.resources.length > 0 && (
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Resources ({lesson.resources.length})
              </Button>
            )}
            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
              <BookOpen className="h-4 w-4" />
              Notes
            </Button>
          </div>
          <div className="flex items-center gap-4">
            {nextLesson && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onLessonChange?.(nextLesson.id)}
                className="flex items-center gap-2"
              >
                Next
                <SkipForward className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
