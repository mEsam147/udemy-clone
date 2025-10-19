// components/home-client.tsx
"use client";

import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FAQSection } from "@/components/landing/faq-section";
import { CategoriesSection } from "@/components/landing/categories-section";
import { PopularInstructorsSection } from "@/components/landing/popular-instructors-section";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { FeaturedCoursesSection } from "./landing/featured-courses-section";
import { NewCoursesSection } from "./landing/new-courses-section";
import { PopularCoursesSection } from "./landing/popular-courses-section";

interface HomeClientProps {
  homeData?: any;
  language?: string;
  error?: string;
}

export function HomeClient({ homeData, language, error }: HomeClientProps) {
  const {
    hero,
    categories,
    courses,
    instructors,
    testimonials,
    features,
    pricing,
    faqs
  } = homeData;

  console.log(homeData);





  
const pricingPlans = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for getting started",
    price: 0,
    period: "monthly",
    currency: "USD",
    features: [
      "Access to free courses",
      "Basic learning resources", 
      "Community support",
      "Limited storage",
      "Mobile app access"
    ],
    isPopular: false,
    trialDays: 0,
    maxStudents: 1
  },
  {
    id: "pro",
    name: "Pro", 
    description: "For serious learners and creators",
    price: 29,
    period: "monthly",
    currency: "USD",
    features: [
      "All free features",
      "Access to premium courses",
      "Downloadable resources",
      "Certificate of completion",
      "Priority support",
      "Unlimited storage",
      "Advanced analytics"
    ],
    isPopular: true,
    trialDays: 7,
    maxStudents: 100
  },
  {
    id: "team",
    name: "Team",
    description: "For teams and organizations",
    price: 99,
    period: "monthly", 
    currency: "USD",
    features: [
      "All Pro features",
      "Team management dashboard",
      "Progress tracking for team",
      "Custom branding",
      "Dedicated account manager",
      "API access",
      "SSO integration"
    ],
    isPopular: false,
    trialDays: 14,
    maxStudents: 1000
  }
];


  return (
    <div className="min-h-screen">
      <Navbar language={language} />
      
      {error && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <main>
        <HeroSection 
          stats={hero.stats}
          trendingSkills={hero.trendingSkills}
          headlines={hero.headlines}
          language={language}
        />
        
        <CategoriesSection 
          categories={categories}
          language={language}
        />
        
        <FeaturedCoursesSection 
          courses={courses.featured}
          language={language}
        />
        
        <PopularCoursesSection 
          courses={courses.popular}
          language={language}
        />
        
        <FeaturesSection 
          features={features}
          language={language}
        />
        
        <NewCoursesSection 
          courses={courses.new}
          language={language}
        />
        
        <PopularInstructorsSection 
          instructors={instructors}
          language={language}
        />
        
        <TestimonialsSection 
          testimonials={testimonials}
          language={language}
        />
        
        <PricingSection 
          pricing={pricingPlans}
          language={language}
          // pricingPlans={pricingPlans}
        />
        
        <FAQSection 
          faqs={faqs}
          language={language}
        />
      </main>
      
      <Footer language={language} />
    </div>
  );
}