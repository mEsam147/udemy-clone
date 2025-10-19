
"use client"

import Link from "next/link"
import { useTranslations, useLocale } from "next-intl"
import { BookOpen, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react"
import { useCategories } from "@/hooks/useCourses"
import { Category } from "@/lib/types"

// Utility function to shuffle array and get n random elements
const getRandomItems = <T,>(array: T[], n: number): T[] => {
  if (!array || array.length === 0) return [];
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, array.length));
};

export function Footer() {
  const t = useTranslations()
  const locale = useLocale()
  const { data: categories } = useCategories()
  console.log("data footer", categories)

  // Get 5 random categories
  const randomCategories = getRandomItems(categories || [], 5);

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-brand-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                Mini Udemy
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Transform your career with premium online courses from industry experts. Learn at your own pace and
              achieve your goals.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-muted-foreground hover:text-brand-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-brand-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-brand-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-brand-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-brand-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link
                href={`/${locale}/courses`}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("nav.courses")}
              </Link>
              <Link
                href={`/${locale}/about`}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About Us
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </Link>
              <Link
                href={`/${locale}/blog`}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold">Categories</h3>
            <div className="space-y-2">
              {randomCategories.map((category: Category , i:Number) => (
                <Link
                  key={i}
                  href={`/${locale}/courses?category=${encodeURIComponent(category)}`}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <div className="space-y-2">
              <Link
                href={`/${locale}/help`}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Help Center
              </Link>
              <Link
                href={`/${locale}/privacy`}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href={`/${locale}/terms`}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href={`/${locale}/refund`}
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Refund Policy
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Mini Udemy. All rights reserved. Built with ❤️ for learners worldwide.
          </p>
        </div>
      </div>
    </footer>
  )
}
