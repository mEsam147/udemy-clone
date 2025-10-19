// components/pricing-section.tsx - FIXED VERSION
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Crown, Sparkles, Zap, Users, Star, Loader2, BookOpen, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { paymentService } from "@/services/payment.service";

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  currency: string;
  features: string[];
  isPopular: boolean;
  trialDays: number;
  maxStudents: number;
  stripePriceId?: string;
}

interface PricingSectionProps {
  pricing: PricingPlan[];
  language: string;
}

export function PricingSection({ pricing, language }: PricingSectionProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [currentUserPlan, setCurrentUserPlan] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  // Fetch user's current plan on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserPlan();
    }
  }, [isAuthenticated, user]);

  const fetchUserPlan = async () => {
    try {
      const response = await paymentService.getUserPlan();
      if (response.success) {
        setCurrentUserPlan(response.data.plan);
      }
    } catch (error) {
      console.error("Error fetching user plan:", error);
    }
  };

  // Language translations
  const translations = {
    en: {
      title: "Choose Your Learning Plan",
      subtitle: "Start learning today with our flexible pricing options designed for every learner",
      monthly: "Monthly",
      yearly: "Yearly", 
      save: "Save",
      mostPopular: "Most Popular",
      getStarted: "Get Started",
      trustedBy: "Trusted by students from leading companies",
      perMonth: "/month",
      perYear: "/year",
      freeTrial: "day free trial", 
      students: "students",
      features: "Features included",
      currentPlan: "Current Plan",
      upgrade: "Upgrade",
      downgrade: "Downgrade",
      managingSubscription: "Managing Subscription...",
      redirectingToCheckout: "Redirecting to checkout...",
      free: "Free Forever",
      activateFreePlan: "Activate Free Plan",
      includedInPlan: "Included in your plan"
    },
    ar: {
      title: "اختر خطتك التعليمية",
      subtitle: "ابدأ التعلم اليوم مع خيارات الأسعار المرنة المصممة لكل متعلم",
      monthly: "شهري",
      yearly: "سنوي",
      save: "وفر", 
      mostPopular: "الأكثر شعبية",
      getStarted: "ابدأ الآن",
      trustedBy: "موثوق به من قبل طلاب من شركات رائدة",
      perMonth: "/شهر",
      perYear: "/سنة",
      freeTrial: "يوم تجربة مجانية",
      students: "طالب",
      features: "الميزات المتضمنة",
      currentPlan: "الخطة الحالية",
      upgrade: "ترقية",
      downgrade: "تخفيض",
      managingSubscription: "جاري إدارة الاشتراك...",
      redirectingToCheckout: "جاري التوجيه إلى checkout...",
      free: "مجاني للأبد",
      activateFreePlan: "تفعيل الخطة المجانية",
      includedInPlan: "مضمن في خطتك"
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Handle free plan activation
  const activateFreePlan = async () => {
    try {
      const response = await paymentService.createPlanCheckoutSession('free');
      
      if (response.success) {
        setCurrentUserPlan('free');
        // Show success message and redirect
        router.push('/dashboard?plan=free-activated');
      }
    } catch (error) {
      console.error('Error activating free plan:', error);
      throw error;
    }
  };

  // Handle paid plan checkout
  const processPaidPlan = async (plan: PricingPlan) => {
    try {
      const response = await paymentService.createPlanCheckoutSession(plan.id);
      
      if (response.success && response.sessionId) {
        // Load Stripe and redirect to checkout
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        
        if (!stripe) {
          throw new Error('Stripe failed to load');
        }

        const { error } = await stripe.redirectToCheckout({ 
          sessionId: response.sessionId 
        });
        
        if (error) {
          console.error('Stripe redirect error:', error);
          // Fallback to success page
          window.location.href = `/success?session_id=${response.sessionId}`;
        }
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error processing paid plan:', error);
      throw error;
    }
  };

  // Handle plan selection - FIXED VERSION
  const handlePlanSelect = async (plan: PricingPlan) => {
    setLoading(plan.id);
    
    try {
      if (!isAuthenticated) {
        // For FREE plan, redirect to signup with immediate access
        if (plan.id === 'free') {
          router.push(`/auth/signup?plan=free&immediateAccess=true`);
          return;
        }
        // For PAID plans, redirect to signup with plan info
        router.push(`/auth/signup?plan=${plan.id}`);
        return;
      }

      // Handle authenticated users
      if (plan.id === 'free') {
        await activateFreePlan();
      } else {
        await processPaidPlan(plan);
      }
      
    } catch (error: any) {
      console.error('Error selecting plan:', error);
      alert(error.message || 'Failed to process plan selection');
    } finally {
      setLoading(null);
    }
  };

  // Load Stripe.js
  const loadStripe = async (publishableKey: string) => {
    if (typeof window !== 'undefined') {
      try {
        const { loadStripe } = await import('@stripe/stripe-js');
        return loadStripe(publishableKey);
      } catch (error) {
        console.error('Failed to load Stripe:', error);
        return null;
      }
    }
    return null;
  };

  // Get button text based on plan and user status - FIXED
  const getButtonText = (plan: PricingPlan) => {
    if (loading === plan.id) {
      return plan.id === 'free' ? t.managingSubscription : t.redirectingToCheckout;
    }

    if (currentUserPlan === plan.id) {
      return (
        <span className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {t.includedInPlan}
        </span>
      );
    }

    if (plan.id === 'free') {
      return t.activateFreePlan;
    }

    return t.getStarted;
  };

  // Check if button should be disabled - FIXED
  const isButtonDisabled = (plan: PricingPlan) => {
    // Only disable if loading OR if it's the current plan (for visual indication)
    return loading === plan.id || currentUserPlan === plan.id;
  };

  // Get button variant based on plan and user status - FIXED for dark/light mode
  const getButtonVariant = (plan: PricingPlan) => {
    if (currentUserPlan === plan.id) {
      return "outline";
    }
    
    if (plan.isPopular) {
      return "default"; // This will use your theme's primary colors
    }
    
    return "secondary"; // This will use your theme's secondary colors
  };

  // Get button styles for dark/light mode compatibility - FIXED
  const getButtonStyles = (plan: PricingPlan) => {
    if (currentUserPlan === plan.id) {
      return "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20";
    }
    
    if (plan.isPopular) {
      return "bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white shadow-lg hover:shadow-xl";
    }
    
    return "bg-secondary hover:bg-secondary/80 text-secondary-foreground";
  };

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
              Flexible Plans
            </Badge>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-balance bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            {t.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
            {t.subtitle}
          </p>

          {/* Show current plan if user is authenticated */}
          {isAuthenticated && currentUserPlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full"
            >
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                {t.currentPlan}: <strong className="text-primary">{currentUserPlan}</strong>
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {pricing.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className={`relative ${plan.isPopular ? "md:scale-105 z-10" : ""}`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 border-0 shadow-lg">
                      <Crown className="w-4 h-4 mr-2" />
                      {t.mostPopular}
                    </Badge>
                  </div>
                )}

                {/* Current Plan Badge */}
                {currentUserPlan === plan.id && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 border-0 shadow-lg">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t.currentPlan}
                    </Badge>
                  </div>
                )}

                <Card className={`h-full border-2 transition-all duration-500 hover:shadow-2xl backdrop-blur-sm ${
                  plan.isPopular
                    ? "border-primary shadow-xl bg-gradient-to-b from-primary/10 to-card"
                    : currentUserPlan === plan.id
                    ? "border-green-500 shadow-lg bg-gradient-to-b from-green-500/10 to-card"
                    : "border-border bg-card/80 hover:border-primary/50"
                }`}>
                  <CardHeader className="text-center pb-8 pt-12">
                    <motion.h3 className="text-2xl font-bold mb-3" whileHover={{ scale: 1.05 }}>
                      {plan.name}
                    </motion.h3>
                    <p className="text-muted-foreground mb-6">{plan.description}</p>

                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-5xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                        {plan.price === 0 ? t.free : `$${plan.price.toFixed(2)}`}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-muted-foreground text-lg ml-2">
                          {t.perMonth}
                        </span>
                      )}
                    </div>

                    {/* Trial */}
                    {plan.trialDays > 0 && plan.id !== 'free' && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {plan.trialDays} {t.freeTrial}
                      </p>
                    )}

                    {/* Students */}
                    {plan.maxStudents > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        Up to {plan.maxStudents} {t.students}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Features */}
                    <div className="mb-8">
                      <h4 className="font-semibold text-sm text-muted-foreground mb-4 flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        {t.features}
                      </h4>
                      <ul className="space-y-3">
                        {plan.features.map((feature, featureIndex) => (
                          <motion.li
                            key={featureIndex}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: featureIndex * 0.05 }}
                            viewport={{ once: true }}
                            className="flex items-start gap-3 text-sm"
                          >
                            <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button - FIXED STYLING */}
                    <motion.div 
                      whileHover={{ scale: isButtonDisabled(plan) ? 1 : 1.02 }} 
                      whileTap={{ scale: isButtonDisabled(plan) ? 1 : 0.98 }}
                    >
                      <Button
                        onClick={() => handlePlanSelect(plan)}
                        disabled={isButtonDisabled(plan)}
                        variant={getButtonVariant(plan)}
                        className={`w-full text-lg py-6 rounded-xl font-semibold transition-all duration-300 ${
                          getButtonStyles(plan)
                        } ${isButtonDisabled(plan) ? 'opacity-70 cursor-not-allowed' : ''}`}
                        size="lg"
                      >
                        {loading === plan.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {plan.id === 'free' ? t.managingSubscription : t.redirectingToCheckout}
                          </>
                        ) : (
                          getButtonText(plan)
                        )}
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-20 pt-16 border-t border-border"
        >
          <p className="text-muted-foreground mb-8 text-lg">{t.trustedBy}</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {["Google", "Microsoft", "Apple", "Amazon", "Meta", "Netflix"].map((company, index) => (
              <motion.div
                key={company}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="h-10 w-24 bg-muted/50 rounded-lg flex items-center justify-center text-sm font-medium text-muted-foreground backdrop-blur-sm"
              >
                {company}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground">
            All plans include a 30-day money-back guarantee • Cancel anytime • Secure payment with Stripe
          </p>
        </motion.div>
      </div>
    </section>
  );
}