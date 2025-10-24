"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ChevronLeft, ChevronRight, Quote, Play, Pause, Sparkles, Users } from "lucide-react"
import { motion, AnimatePresence, PanInfo } from "framer-motion"

interface Testimonial {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  course: {
    id: string;
    title: string;
    category: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  language: string;
}

export function TestimonialsSection({ testimonials, language }: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [direction, setDirection] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragDistance, setDragDistance] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Language translations
  const translations = {
    en: {
      title: "What Our Students Say",
      subtitle: "Join thousands of successful students who have transformed their careers with our courses",
      successStories: "Student Success Stories",
      transformative: "Transformative Learning Experiences",
      showing: "Showing",
      of: "of",
      testimonials: "testimonials",
      play: "Play auto-rotation",
      pause: "Pause auto-rotation",
      students: "students",
      swipe: "Swipe to navigate"
    }

  }
  const t = translations[language as keyof typeof translations] || translations.en

  // Check mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-advance testimonials
  useEffect(() => {
    if (!isAutoPlaying || testimonials.length === 0 || isDragging) return

    const interval = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, testimonials.length, isDragging])

  const nextTestimonial = useCallback(() => {
    if (testimonials.length === 0) return
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlaying(false)
  }, [testimonials.length])

  const prevTestimonial = useCallback(() => {
    if (testimonials.length === 0) return
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlaying(false)
  }, [testimonials.length])

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying)
  }

  // Touch and mouse event handlers for drag/swipe
  const handleDragStart = (event: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    setDragStartX(clientX)
    setDragDistance(0)
    setIsAutoPlaying(false)
  }

  const handleDragMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    const distance = clientX - dragStartX
    setDragDistance(distance)
  }

  const handleDragEnd = () => {
    if (!isDragging) return

    const swipeThreshold = 50
    if (Math.abs(dragDistance) > swipeThreshold) {
      if (dragDistance > 0) {
        prevTestimonial()
      } else {
        nextTestimonial()
      }
    }

    setIsDragging(false)
    setDragDistance(0)
  }

  // Mobile: Show single card, Desktop: Show 3 cards
  const getVisibleTestimonials = () => {
    const length = testimonials.length
    if (length === 0) return []

    if (isMobile) {
      // Mobile - only show current testimonial
      return [
        { testimonial: testimonials[currentIndex], position: 'center', index: currentIndex }
      ]
    } else {
      // Desktop - show current, previous, and next
      const prevIndex = (currentIndex - 1 + length) % length
      const nextIndex = (currentIndex + 1) % length

      return [
        { testimonial: testimonials[prevIndex], position: 'left', index: prevIndex },
        { testimonial: testimonials[currentIndex], position: 'center', index: currentIndex },
        { testimonial: testimonials[nextIndex], position: 'right', index: nextIndex }
      ]
    }
  }

  // Animation variants for different screen sizes
  const cardVariants = {
    // Mobile variants (single card with drag)
    mobile: {
      initial: { opacity: 0, scale: 0.9, x: 100 },
      animate: {
        opacity: 1,
        scale: 1,
        x: dragDistance,
        transition: { type: "spring", stiffness: 300, damping: 30 }
      },
      exit: { opacity: 0, scale: 0.9, x: -100 }
    },
    // Desktop variants (3-card layout)
    desktop: {
      left: {
        x: -200 + (dragDistance * 0.3),
        scale: 0.8,
        opacity: 0.6,
        zIndex: 10,
        rotateY: -15,
      },
      center: {
        x: dragDistance,
        scale: 1,
        opacity: 1,
        zIndex: 30,
        rotateY: 0,
      },
      right: {
        x: 200 + (dragDistance * 0.3),
        scale: 0.8,
        opacity: 0.6,
        zIndex: 10,
        rotateY: 15,
      },
      exit: {
        opacity: 0,
        scale: 0.8,
        zIndex: 0,
      }
    }
  }

  if (!testimonials || testimonials.length === 0) {
    return null
  }

  const visibleTestimonials = getVisibleTestimonials()

  return (
    <section className="py-12 md:py-24 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-4 md:left-10 w-20 h-20 md:w-32 md:h-32 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-4 md:right-10 w-24 h-24 md:w-40 md:h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-48 md:h-48 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            <Badge variant="secondary" className="text-xs md:text-sm font-semibold">
              {t.successStories}
            </Badge>
          </div>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-balance bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent px-4">
            {t.transformative}
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed px-4">
            {t.subtitle}
          </p>
        </motion.div>

        <div className="relative max-w-6xl mx-auto">
          {/* Swipe Hint for Mobile */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-4"
            >
              <Badge variant="outline" className="text-xs animate-pulse">
                {t.swipe}
              </Badge>
            </motion.div>
          )}

          {/* Carousel Container - Responsive height with drag area */}
          <div
            ref={carouselRef}
            className={`relative ${isMobile ? 'h-[400px] mb-8' : 'h-[400px] md:h-[500px] mb-8 md:mb-12'} flex items-center justify-center select-none touch-none`}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <AnimatePresence mode="popLayout" initial={false}>
                {visibleTestimonials.map(({ testimonial, position, index }) => (
                  <motion.div
                    key={`${testimonial.id}-${position}`}
                    className={`${isMobile ? 'w-full max-w-sm px-4' : 'absolute'} ${
                      (position === 'center' || isMobile) ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                    }`}
                    variants={isMobile ? cardVariants.mobile : cardVariants.desktop}
                    initial={isMobile ? "initial" : position}
                    animate={isMobile ? "animate" : position}
                    exit={isMobile ? "exit" : "exit"}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      duration: 0.5
                    }}
                    onClick={(e) => {
                      // Prevent click during drag
                      if (Math.abs(dragDistance) > 10) {
                        e.preventDefault()
                        return
                      }

                      if (!isMobile && position !== 'center') {
                        setDirection(position === 'left' ? -1 : 1)
                        setCurrentIndex(index)
                        setIsAutoPlaying(false)
                      }
                    }}
                    style={{
                      perspective: "1000px",
                    }}
                  >
                    <Card className={`
                      ${isMobile
                        ? 'w-full h-80 md:h-96 mx-auto'
                        : 'w-80 md:w-96 h-80 md:h-96'
                      } border-0 shadow-xl md:shadow-2xl bg-card/80 backdrop-blur-sm relative overflow-hidden
                      transition-all duration-300
                      ${(position === 'center' || isMobile)
                        ? 'shadow-xl md:shadow-2xl'
                        : 'shadow-lg hover:shadow-xl'
                      }
                      ${!isMobile && position !== 'center' ? 'hover:scale-90' : ''}
                      ${isDragging ? 'transition-none' : ''}
                    `}>
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-4 md:top-6 right-4 md:right-6 w-8 h-8 md:w-12 md:h-12 bg-primary rounded-full"></div>
                        <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 w-6 h-6 md:w-10 md:h-10 bg-blue-500 rounded-full"></div>
                      </div>

                      <CardContent className="p-4 md:p-6 lg:p-8 h-full flex flex-col justify-center text-center relative">
                        {/* Quote Icon */}
                        <div className="absolute top-3 md:top-4 left-3 md:left-4 opacity-10">
                          <Quote className="h-12 w-12 md:h-16 md:w-16 text-primary" />
                        </div>

                        {/* Drag Indicator for Desktop */}
                        {!isMobile && position === 'center' && (
                          <div className="absolute top-3 md:top-4 right-3 md:right-4">
                            <Badge variant="outline" className="text-xs">
                              Drag
                            </Badge>
                          </div>
                        )}

                        {/* Click hint for side cards (desktop only) */}
                        {!isMobile && position !== 'center' && (
                          <div className="absolute top-3 md:top-4 right-3 md:right-4">
                            <Badge variant="outline" className="text-xs">
                              Click
                            </Badge>
                          </div>
                        )}

                        {/* Content */}
                        <blockquote className="text-sm md:text-base lg:text-lg font-medium mb-4 md:mb-6 leading-relaxed text-balance line-clamp-4">
                          "{testimonial.comment}"
                        </blockquote>

                        {/* Rating */}
                        <div className="flex items-center justify-center gap-1 mb-4 md:mb-6">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 md:h-5 md:w-5 ${
                                i < testimonial.rating
                                  ? "text-yellow-500 fill-current"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-xs md:text-sm font-semibold text-muted-foreground">
                            {testimonial.rating}.0
                          </span>
                        </div>

                        {/* Author */}
                        <div className="flex items-center justify-center gap-3 md:gap-4">
                          <Avatar className="h-12 w-12 md:h-16 md:w-16 border-2 border-background shadow-lg">
                            <AvatarImage
                              src={testimonial.user.avatar || "/placeholder.svg"}
                              alt={testimonial.user.name}
                            />
                            <AvatarFallback className="text-xs md:text-sm bg-gradient-to-r from-primary to-blue-500 text-primary-foreground">
                              {testimonial.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <p className="font-bold text-sm md:text-base">{testimonial.user.name}</p>
                            <p className="text-muted-foreground text-xs md:text-sm mb-1 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {t.students}
                            </p>
                            {testimonial.course && (
                              <Badge variant="outline" className="text-xs">
                                {testimonial.course.title.length > 20
                                  ? testimonial.course.title.substring(0, 20) + '...'
                                  : testimonial.course.title
                                }
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Drag Overlay for better UX */}
            {isDragging && (
              <div className="absolute inset-0 bg-transparent cursor-grabbing z-40" />
            )}
          </div>

          {/* Enhanced Responsive Controls */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-8 md:mb-16 px-4">
            {/* Auto-play Toggle */}
            <Button
              variant="outline"
              size={isMobile ? "icon" : "sm"}
              onClick={toggleAutoPlay}
              className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-full p-0 border-border hover:bg-accent`}
              title={isAutoPlaying ? t.pause : t.play}
            >
              {isAutoPlaying ? (
                <Pause className="h-4 w-4 md:h-5 md:w-5" />
              ) : (
                <Play className="h-4 w-4 md:h-5 md:w-5" />
              )}
            </Button>

            {/* Navigation and Dots Container */}
            <div className="flex items-center gap-4 md:gap-6">
              {/* Navigation Buttons */}
              <div className="flex items-center gap-2 md:gap-4">
                <Button
                  variant="outline"
                  size={isMobile ? "icon" : "lg"}
                  onClick={prevTestimonial}
                  className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12 md:w-14 md:h-14'} rounded-full p-0 border-border hover:bg-accent hover:scale-110 transition-transform`}
                  disabled={testimonials.length === 0}
                >
                  <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                </Button>

                {/* Dots Indicator - Responsive */}
                <div className="flex gap-2 md:gap-3 mx-2 md:mx-4">
                  {testimonials.slice(0, isMobile ? 5 : testimonials.length).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setDirection(index > currentIndex ? 1 : -1)
                        setCurrentIndex(index)
                        setIsAutoPlaying(false)
                      }}
                      className={`relative rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? `${isMobile ? 'w-6' : 'w-8 md:w-12'} bg-primary`
                          : "w-2 md:w-3 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      } h-2 md:h-3`}
                    >
                      {index === currentIndex && (
                        <motion.div
                          layoutId="activeDot"
                          className="absolute inset-0 bg-primary rounded-full"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </button>
                  ))}
                  {/* Show ellipsis on mobile if more than 5 testimonials */}
                  {isMobile && testimonials.length > 5 && (
                    <span className="text-xs text-muted-foreground flex items-center">
                      ...+{testimonials.length - 5}
                    </span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size={isMobile ? "icon" : "lg"}
                  onClick={nextTestimonial}
                  className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12 md:w-14 md:h-14'} rounded-full p-0 border-border hover:bg-accent hover:scale-110 transition-transform`}
                  disabled={testimonials.length === 0}
                >
                  <ChevronRight className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                </Button>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-6 md:mt-12"
          >
            <p className="text-xs md:text-sm text-muted-foreground">
              {t.showing} {currentIndex + 1} {t.of} {testimonials.length} {t.testimonials}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
