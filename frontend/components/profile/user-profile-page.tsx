"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  BookOpen,
  Award,
  Clock,
  Star,
  Calendar,
  MapPin,
  Globe,
  Edit,
  Settings,
  Heart,
  Download,
  Trophy,
  Target,
  TrendingUp,
} from "lucide-react"
import { CourseCard } from "@/components/courses/course-card"
import type { User as UserType, Course } from "@/lib/types"

interface UserProfilePageProps {
  user: UserType
  enrolledCourses: Course[]
  completedCourses: Course[]
  wishlistCourses: Course[]
}

export function UserProfilePage({ user, enrolledCourses, completedCourses, wishlistCourses }: UserProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    full_name: user.full_name,
    bio: "Passionate learner focused on web development and design. Always looking to expand my skills and take on new challenges.",
    location: "San Francisco, CA",
    website: "https://johndoe.dev",
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe",
  })

  // Calculate learning statistics
  const totalLearningHours = enrolledCourses.reduce((acc, course) => acc + course.duration_hours, 0)
  const averageRating =
    enrolledCourses.length > 0
      ? enrolledCourses.reduce((acc, course) => acc + course.rating, 0) / enrolledCourses.length
      : 0
  const completionRate = enrolledCourses.length > 0 ? (completedCourses.length / enrolledCourses.length) * 100 : 0

  const achievements = [
    { id: 1, title: "First Course Completed", description: "Completed your first course", icon: Trophy, earned: true },
    { id: 2, title: "Fast Learner", description: "Completed 3 courses in a month", icon: TrendingUp, earned: true },
    {
      id: 3,
      title: "Dedicated Student",
      description: "Studied for 50+ hours",
      icon: Target,
      earned: totalLearningHours >= 50,
    },
    {
      id: 4,
      title: "Course Collector",
      description: "Enrolled in 10+ courses",
      icon: BookOpen,
      earned: enrolledCourses.length >= 10,
    },
  ]

  const handleSaveProfile = () => {
    // TODO: Save profile data to API
    setIsEditing(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.full_name} />
                  <AvatarFallback className="text-2xl">
                    {user.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full bg-transparent"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={profileData.website}
                          onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile}>Save Changes</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <h1 className="text-3xl font-bold">{profileData.full_name}</h1>
                      <Badge variant="secondary" className="capitalize">
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-4 leading-relaxed">{profileData.bio}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {profileData.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        <a
                          href={profileData.website}
                          className="hover:text-primary"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Portfolio
                        </a>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined{" "}
                        {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Certificates
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Learning Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        <Card>
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-brand-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{enrolledCourses.length}</div>
            <div className="text-sm text-muted-foreground">Courses Enrolled</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Award className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{completedCourses.length}</div>
            <div className="text-sm text-muted-foreground">Courses Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalLearningHours}h</div>
            <div className="text-sm text-muted-foreground">Learning Hours</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Avg. Course Rating</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">My Learning ({enrolledCourses.length})</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Completion Rate:</span>
                  <div className="flex items-center gap-2">
                    <Progress value={completionRate} className="w-24" />
                    <span className="text-sm font-medium">{Math.round(completionRate)}%</span>
                  </div>
                </div>
              </div>
              {enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
                    <p className="text-muted-foreground mb-6">Start your learning journey by enrolling in a course.</p>
                    <Button>Browse Courses</Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Completed Courses ({completedCourses.length})</h2>
              {completedCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedCourses.map((course) => (
                    <div key={course.id} className="relative">
                      <CourseCard course={course} />
                      <Badge className="absolute top-2 right-2 bg-green-500">
                        <Award className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No completed courses</h3>
                    <p className="text-muted-foreground">Complete your first course to see it here.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="wishlist" className="mt-6">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">My Wishlist ({wishlistCourses.length})</h2>
              {wishlistCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistCourses.map((course) => (
                    <div key={course.id} className="relative">
                      <CourseCard course={course} />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No courses in wishlist</h3>
                    <p className="text-muted-foreground">Save courses you're interested in to your wishlist.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="mt-6">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Achievements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {achievements.map((achievement) => (
                  <Card
                    key={achievement.id}
                    className={achievement.earned ? "border-green-200 bg-green-50/50" : "opacity-60"}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-full ${achievement.earned ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"}`}
                        >
                          <achievement.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          {achievement.earned && (
                            <Badge variant="secondary" className="mt-2 bg-green-100 text-green-700">
                              Earned
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Learning Progress</h2>
              <div className="space-y-4">
                {enrolledCourses.map((course) => {
                  const progress = Math.floor(Math.random() * 100) // Mock progress
                  return (
                    <Card key={course.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <img
                            src={course.thumbnail_url || "/placeholder.svg?height=80&width=120"}
                            alt={course.title}
                            className="w-20 h-14 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{course.title}</h3>
                            <div className="flex items-center gap-4">
                              <Progress value={progress} className="flex-1" />
                              <span className="text-sm font-medium">{progress}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Last accessed: {new Date().toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Continue
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
