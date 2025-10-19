"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, ChevronLeft, ChevronRight, Quote, Play, Pause, Sparkles, Users } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
      students: "students"
    },
    ar: {
      title: "ماذا يقول طلابنا",
      subtitle: "انضم إلى آلاف الطلاب الناجحين الذين غيروا مسارهم المهني من خلال دوراتنا",
      successStories: "قصص نجاح الطلاب",
      transformative: "تجارب تعلم تحويلية",
      showing: "عرض",
      of: "من",
      testimonials: "تقييم",
      play: "تشغيل الدوران التلقائي",
      pause: "إيقاف الدوران التلقائي",
      students: "طالب"
    }
  }

  const t = translations[language as keyof typeof translations] || translations.en

  // Auto-advance testimonials
  useEffect(() => {
    if (!isAutoPlaying || testimonials.length === 0) return

    const interval = setInterval(() => {
      setDirection(1)
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, testimonials.length])

  const nextTestimonial = () => {
    if (testimonials.length === 0) return
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const prevTestimonial = () => {
    if (testimonials.length === 0) return
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying)
  }

  // Get visible testimonials (current, previous, next)
  const getVisibleTestimonials = () => {
    const length = testimonials.length
    if (length === 0) return []

    const prevIndex = (currentIndex - 1 + length) % length
    const nextIndex = (currentIndex + 1) % length

    return [
      { testimonial: testimonials[prevIndex], position: 'left', index: prevIndex },
      { testimonial: testimonials[currentIndex], position: 'center', index: currentIndex },
      { testimonial: testimonials[nextIndex], position: 'right', index: nextIndex }
    ]
  }

  const cardVariants = {
    left: {
      x: -200,
      scale: 0.8,
      opacity: 0.6,
      zIndex: 10,
      rotateY: -15,
    },
    center: {
      x: 0,
      scale: 1,
      opacity: 1,
      zIndex: 30,
      rotateY: 0,
    },
    right: {
      x: 200,
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

  if (!testimonials || testimonials.length === 0) {
    return null
  }

  const visibleTestimonials = getVisibleTestimonials()

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <Badge variant="secondary" className="text-sm font-semibold">
              {t.successStories}
            </Badge>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            {t.transformative}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
            {t.subtitle}
          </p>
        </motion.div>

        <div className="relative max-w-6xl mx-auto">
          {/* 3-Card Carousel Container */}
          <div className="relative h-[500px] mb-12 flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              <AnimatePresence mode="popLayout">
                {visibleTestimonials.map(({ testimonial, position, index }) => (
                  <motion.div
                    key={`${testimonial.id}-${position}`}
                    className={`absolute ${
                      position === 'center' ? 'cursor-default' : 'cursor-pointer'
                    }`}
                    variants={cardVariants}
                    initial={position}
                    animate={position}
                    exit="exit"
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                      duration: 0.5
                    }}
                    onClick={() => {
                      if (position !== 'center') {
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
                      w-xl h-96 border-0 shadow-2xl bg-card/80 backdrop-blur-sm relative overflow-hidden
                      transition-all duration-300
                      ${position === 'center' 
                        ? 'shadow-2xl' 
                        : 'shadow-lg hover:shadow-xl'
                      }
                      ${position !== 'center' ? 'hover:scale-90' : ''}
                    `}>
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-6 right-6 w-12 h-12 bg-primary rounded-full"></div>
                        <div className="absolute bottom-6 left-6 w-10 h-10 bg-blue-500 rounded-full"></div>
                      </div>

                      <CardContent className="p-8 h-full flex flex-col justify-center text-center relative">
                        {/* Quote Icon */}
                        <div className="absolute top-4 left-4 opacity-10">
                          <Quote className="h-16 w-16 text-primary" />
                        </div>

                        {/* Click hint for side cards */}
                        {position !== 'center' && (
                          <div className="absolute top-4 right-4">
                            <Badge variant="outline" className="text-xs">
                              Click
                            </Badge>
                          </div>
                        )}

                        {/* Content */}
                        <blockquote className="text-lg font-medium mb-6 leading-relaxed text-balance line-clamp-4">
                          "{testimonial.comment}"
                        </blockquote>

                        {/* Rating */}
                        <div className="flex items-center justify-center gap-1 mb-6">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-5 w-5 ${
                                i < testimonial.rating 
                                  ? "text-yellow-500 fill-current" 
                                  : "text-muted-foreground/30"
                              }`} 
                            />
                          ))}
                          <span className="ml-2 text-sm font-semibold text-muted-foreground">
                            {testimonial.rating}.0
                          </span>
                        </div>

                        {/* Author */}
                        <div className="flex items-center justify-center gap-4">
                          <Avatar className="h-16 w-16 border-2 border-background shadow-lg">
                            <AvatarImage
                              src={testimonial.user.avatar || "/placeholder.svg"}
                              alt={testimonial.user.name}
                            />
                            <AvatarFallback className="text-sm bg-gradient-to-r from-primary to-blue-500 text-primary-foreground">
                              {testimonial.user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <p className="font-bold text-base">{testimonial.user.name}</p>
                            <p className="text-muted-foreground text-sm mb-1 flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {t.students}
                            </p>
                            {testimonial.course && (
                              <Badge variant="outline" className="text-xs">
                                {testimonial.course.title}
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
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mb-16">
            {/* Auto-play Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAutoPlay}
              className="rounded-full w-12 h-12 p-0 border-border hover:bg-accent"
              title={isAutoPlaying ? t.pause : t.play}
            >
              {isAutoPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            {/* Navigation */}
            <Button
              variant="outline"
              size="lg"
              onClick={prevTestimonial}
              className="rounded-full w-14 h-14 p-0 border-border hover:bg-accent hover:scale-110 transition-transform"
              disabled={testimonials.length === 0}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            {/* Dots Indicator */}
            <div className="flex gap-3 mx-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1)
                    setCurrentIndex(index)
                    setIsAutoPlaying(false)
                  }}
                  className={`relative rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? "w-12 bg-primary" 
                      : "w-3 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  } h-3`}
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
            </div>

            <Button
              variant="outline"
              size="lg"
              onClick={nextTestimonial}
              className="rounded-full w-14 h-14 p-0 border-border hover:bg-accent hover:scale-110 transition-transform"
              disabled={testimonials.length === 0}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Thumbnail Testimonials */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 ${
                    index === currentIndex 
                      ? "border-primary shadow-lg bg-card/80" 
                      : "border-border bg-card/50 hover:border-primary/50"
                  } backdrop-blur-sm`}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1)
                    setCurrentIndex(index)
                    setIsAutoPlaying(false)
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar className="h-12 w-12 border-2 border-background">
                        <AvatarImage src={testimonial.user.avatar || "/placeholder.svg"} alt={testimonial.user.name} />
                        <AvatarFallback className="bg-gradient-to-r from-primary to-blue-500 text-primary-foreground">
                          {testimonial.user.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{testimonial.user.name}</p>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {t.students}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 text-yellow-500 fill-current" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      "{testimonial.comment}"
                    </p>
                    {testimonial.course && (
                      <Badge variant="secondary" className="mt-3 text-xs">
                        {testimonial.course.title}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-sm text-muted-foreground">
              {t.showing} {currentIndex + 1} {t.of} {testimonials.length} {t.testimonials}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}