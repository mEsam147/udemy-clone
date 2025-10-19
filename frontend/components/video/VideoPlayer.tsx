// components/video/VideoPlayer.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import { Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  url: string;
  duration?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onProgress?: (progress: { played: number; playedSeconds: number }) => void;
  onEnded?: () => void;
  onDuration?: (duration: number) => void;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  className?: string;
  playerRef?: React.RefObject<any>;
}

export function VideoPlayer({
  url,
  duration,
  onPlay,
  onPause,
  onProgress,
  onEnded,
  onDuration,
  autoPlay = false,
  controls = true,
  muted = false,
  className,
  playerRef,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(muted);
  const [played, setPlayed] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const internalPlayerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>(
    setTimeout(() => {}, 300)
  );

  const actualPlayerRef = playerRef || internalPlayerRef;

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      onPlay?.();
    } else {
      onPause?.();
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSeek = (value: number[]) => {
    const newPlayed = value[0];
    setPlayed(newPlayed);
    setSeeking(true);
  };

  const handleSeekRelease = (value: number[]) => {
    const newPlayed = value[0];
    setPlayed(newPlayed);
    setSeeking(false);
    actualPlayerRef.current?.seekTo(newPlayed);
  };

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    if (!seeking) {
      setPlayed(state.played);
      setPlayedSeconds(state.playedSeconds);
    }
    onProgress?.(state);
  };

  const handleFullscreen = () => {
    if (containerRef.current?.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  return (
    // Added aspect-video class here
    <div
      ref={containerRef}
      className={cn(
        "relative bg-black rounded-lg overflow-hidden group aspect-video",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      <ReactPlayer
        ref={actualPlayerRef}
        url={url}
        width="100%"
        height="100%"
        playing={isPlaying}
        volume={isMuted ? 0 : volume}
        onPlay={() => {
          setIsPlaying(true);
          onPlay?.();
        }}
        onPause={() => {
          setIsPlaying(false);
          onPause?.();
        }}
        onProgress={handleProgress}
        onEnded={() => {
          setIsPlaying(false);
          onEnded?.();
        }}
        onDuration={onDuration}
        progressInterval={1000}
        config={{
          file: {
            attributes: {
              controlsList: "nodownload",
              crossOrigin: "anonymous",
            },
            forceVideo: true,
          },
        }}
      />

      {controls && (
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300",
            (showControls || !isPlaying) && "opacity-100"
          )}
        >
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full"
                onClick={handlePlayPause}
              >
                <Play className="w-8 h-8 text-white ml-1" />
              </Button>
            </div>
          )}

          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 p-4 transform transition-transform duration-300",
              (showControls || !isPlaying) ? "translate-y-0" : "translate-y-full"
            )}
          >
            <div className="mb-4">
              <Slider
                value={[played]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleSeek}
                onValueCommit={handleSeekRelease}
                className="cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </Button>

                <div className="text-white text-sm font-medium">
                  {formatTime(playedSeconds)} / {formatTime(duration || 0)}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={handleToggleMute}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="w-20 cursor-pointer"
                  />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={handleFullscreen}
                >
                  <Maximize className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}