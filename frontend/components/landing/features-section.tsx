"use client"

import { Card, CardContent } from "@/components/ui/card"

const features = [
  {
    icon: "🎓",
    title: "Expert Instructors",
    description: "Learn from industry professionals with years of real-world experience",
    gradient: "from-blue-500 to-purple-600",
  },
  {
    icon: "⏰",
    title: "Lifetime Access",
    description: "Access your courses anytime, anywhere with no time restrictions",
    gradient: "from-green-500 to-teal-600",
  },
  {
    icon: "🏆",
    title: "Certificates",
    description: "Earn verified certificates upon completion to showcase your skills",
    gradient: "from-orange-500 to-red-600",
  },
  {
    icon: "👥",
    title: "Community",
    description: "Join a vibrant community of learners and get support when you need it",
    gradient: "from-purple-500 to-pink-600",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Why Choose Mini Udemy?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            We provide everything you need to succeed in your learning journey with premium features and support.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={feature.title} className="group">
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-background/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div
                    className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-16 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <span className="text-2xl mr-2">📚</span>
              <span className="text-3xl font-bold">500+</span>
            </div>
            <p className="text-muted-foreground">Expert Courses</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <span className="text-2xl mr-2">👥</span>
              <span className="text-3xl font-bold">50K+</span>
            </div>
            <p className="text-muted-foreground">Happy Students</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <span className="text-2xl mr-2">⭐</span>
              <span className="text-3xl font-bold">4.9</span>
            </div>
            <p className="text-muted-foreground">Average Rating</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-3">
              <span className="text-2xl mr-2">🌍</span>
              <span className="text-3xl font-bold">120+</span>
            </div>
            <p className="text-muted-foreground">Countries</p>
          </div>
        </div>
      </div>
    </section>
  )
}
