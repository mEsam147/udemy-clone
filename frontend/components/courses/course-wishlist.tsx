"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Star, Clock, Users, Trash2, ShoppingCart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Course } from "@/lib/types"

interface CourseWishlistProps {
  courses: Course[]
  onRemoveFromWishlist: (courseId: string) => void
  onAddToCart: (courseId: string) => void
}

export function CourseWishlist({ courses, onRemoveFromWishlist, onAddToCart }: CourseWishlistProps) {
  const { toast } = useToast()
  const [wishlistCourses, setWishlistCourses] = useState<Course[]>(courses)

  useEffect(() => {
    setWishlistCourses(courses)
  }, [courses])

  const handleRemoveFromWishlist = (courseId: string) => {
    setWishlistCourses((prev) => prev.filter((course) => course.id !== courseId))
    onRemoveFromWishlist(courseId)
    toast({
      title: "Removed from wishlist",
      description: "Course has been removed from your wishlist.",
    })
  }

  const handleAddToCart = (courseId: string) => {
    onAddToCart(courseId)
    toast({
      title: "Added to cart",
      description: "Course has been added to your cart.",
    })
  }

  if (wishlistCourses.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
        <p className="text-muted-foreground mb-6">
          Start adding courses to your wishlist to keep track of what you want to learn.
        </p>
        <Button asChild>
          <a href="/courses">Browse Courses</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Wishlist ({wishlistCourses.length})</h2>
        <Button variant="outline" size="sm">
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add All to Cart
        </Button>
      </div>

      <div className="grid gap-4">
        {wishlistCourses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300">
              <div className="flex">
                <div className="relative w-48 h-32 flex-shrink-0">
                  <img
                    src={course.thumbnail_url || "/placeholder.svg?height=128&width=192"}
                    alt={course.title}
                    className="w-full h-full object-cover rounded-l-lg"
                  />
                </div>
                <CardContent className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg hover:text-brand-primary transition-colors line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{course.short_description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-2xl font-bold text-brand-primary">${course.price}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={course.instructor.avatar_url || "/placeholder.svg"}
                          alt={course.instructor.full_name}
                        />
                        <AvatarFallback className="text-xs">
                          {course.instructor.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{course.instructor.full_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{course.rating}</span>
                      <span className="text-sm text-muted-foreground">({course.total_ratings})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {course.duration_hours}h
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.total_students.toLocaleString()}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {course.level}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleRemoveFromWishlist(course.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                      <Button size="sm" onClick={() => handleAddToCart(course.id)}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
