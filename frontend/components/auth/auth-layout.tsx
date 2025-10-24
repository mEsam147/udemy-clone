"use client"

import type React from "react"

import Link from "next/link"
import { useLocale } from "next-intl"
import { motion } from "framer-motion"
import { BookOpen, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const locale = useLocale()

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-brand-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              Mini Udemy
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {/* <LanguageSwitcher /> */}
            <ThemeToggle />
          </div>
        </div>

        {/* Back Button */}
        <Button variant="ghost" size="sm" className="self-start mb-8" asChild>
          <Link href={`/${locale}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm mx-auto"
        >
          {children}
        </motion.div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:block relative bg-gradient-to-br from-brand-primary/10 via-brand-secondary/10 to-brand-accent/10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20" />

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-20 h-20 bg-brand-primary/20 rounded-full animate-float" />
          <div
            className="absolute top-40 right-32 w-16 h-16 bg-brand-secondary/20 rounded-full animate-float"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute bottom-40 left-32 w-24 h-24 bg-brand-accent/20 rounded-full animate-float"
            style={{ animationDelay: "2s" }}
          />
          <div
            className="absolute bottom-20 right-20 w-12 h-12 bg-brand-primary/20 rounded-full animate-float"
            style={{ animationDelay: "0.5s" }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center h-full p-20">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-4xl font-bold mb-6 text-balance">Transform Your Career with Premium Learning</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed text-pretty">
              Join thousands of students who have advanced their careers through our expert-led courses and
              comprehensive learning platform.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold text-brand-primary mb-2">50K+</div>
                <p className="text-sm text-muted-foreground">Active Students</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-brand-primary mb-2">500+</div>
                <p className="text-sm text-muted-foreground">Expert Courses</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-brand-primary mb-2">95%</div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-brand-primary mb-2">4.9★</div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
