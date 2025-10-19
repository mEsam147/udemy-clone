import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us - Mini Udemy",
  description:
    "Learn more about Mini Udemy's mission, team, and commitment to online education",
};

const teamMembers = [
  {
    name: "Sarah Johnson",
    role: "CEO & Founder",
    avatar: "/professional-female-avatar.png",
    bio: "Former education technology executive with 15 years of experience.",
  },
  {
    name: "Michael Chen",
    role: "Head of Technology",
    avatar: "/professional-male-avatar.png",
    bio: "Software architect with a passion for educational technology.",
  },
  {
    name: "Emily Rodriguez",
    role: "Head of Content",
    avatar: "/professional-instructor-avatar.png",
    bio: "Curriculum development expert with a Ph.D. in Education.",
  },
  {
    name: "David Kim",
    role: "Head of Community",
    avatar: "/instructor-avatar.png",
    bio: "Community building expert focused on student success.",
  },
];

const stats = [
  { label: "Active Students", value: "50K+" },
  { label: "Expert Instructors", value: "1000+" },
  { label: "Course Library", value: "5000+" },
  { label: "Student Success Rate", value: "92%" },
];

const values = [
  {
    title: "Quality Education",
    description:
      "We ensure high-quality content through rigorous review processes and expert instructors.",
  },
  {
    title: "Accessibility",
    description:
      "Making education accessible to everyone through affordable pricing and scholarships.",
  },
  {
    title: "Innovation",
    description:
      "Continuously improving our platform with the latest learning technologies.",
  },
  {
    title: "Community",
    description:
      "Building a supportive community of learners and educators worldwide.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className=" bg-background to-muted/5 py-20 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              Transforming Education for the Digital Age
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Our mission is to create a world where anyone, anywhere can
              transform their life through learning.
            </p>
            <Button size="lg" asChild>
              <Link href="/courses">Start Learning</Link>
            </Button>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-brand-primary mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value) => (
                <Card key={value.title} className="bg-card">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-3">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Meet Our Team
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member) => (
                <Card key={member.name} className="text-center">
                  <CardContent className="p-6">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-semibold mb-1">
                      {member.name}
                    </h3>
                    <div className="text-sm text-brand-primary mb-3">
                      {member.role}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Have questions or want to learn more about our platform? We'd love
              to hear from you.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" variant="default">
                Contact Us
              </Button>
              <Button size="lg" variant="outline">
                Support Center
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
