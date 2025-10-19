// app/help/page.tsx
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { 
  Search, 
  MessageCircle, 
  BookOpen, 
  Video, 
  Mail, 
  Phone, 
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle,
  Users,
  FileText,
  HelpCircle,
  ExternalLink,
  ArrowRight,
  Star,
  Zap,
  Shield,
  CreditCard,
  Monitor,
  Smartphone,
  Globe,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";

const popularArticles = [
  {
    id: 1,
    title: "How to reset your password",
    category: "Account",
    views: 2543,
    likes: 189,
    readTime: 3
  },
  {
    id: 2,
    title: "Troubleshooting video playback issues",
    category: "Technical",
    views: 1876,
    likes: 142,
    readTime: 5
  },
  {
    id: 3,
    title: "Understanding your subscription plan",
    category: "Billing",
    views: 1642,
    likes: 98,
    readTime: 4
  },
  {
    id: 4,
    title: "Downloading course materials",
    category: "Courses",
    views: 1421,
    likes: 76,
    readTime: 2
  },
  {
    id: 5,
    title: "Setting up two-factor authentication",
    category: "Security",
    views: 1287,
    likes: 203,
    readTime: 6
  }
];

const helpCategories = [
  {
    icon: <Users className="w-6 h-6" />,
    title: "Account & Profile",
    description: "Manage your account settings, profile, and preferences",
    articles: 24,
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: <Monitor className="w-6 h-6" />,
    title: "Courses & Learning",
    description: "Access courses, track progress, and learning features",
    articles: 32,
    color: "from-green-500 to-green-600"
  },
  {
    icon: <CreditCard className="w-6 h-6" />,
    title: "Billing & Payments",
    description: "Payment methods, subscriptions, and billing issues",
    articles: 18,
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: "Technical Support",
    description: "Troubleshooting, system requirements, and technical issues",
    articles: 29,
    color: "from-orange-500 to-orange-600"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Privacy & Security",
    description: "Privacy settings, data protection, and security features",
    articles: 15,
    color: "from-red-500 to-red-600"
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Platform Features",
    description: "Using platform tools, features, and integrations",
    articles: 27,
    color: "from-indigo-500 to-indigo-600"
  }
];

const faqSections = [
  {
    category: "Getting Started",
    items: [
      {
        question: "How do I create an account?",
        answer: "Click the 'Sign Up' button in the top right corner, enter your email address, create a password, and follow the verification process. You'll receive a confirmation email to activate your account."
      },
      {
        question: "Is there a free trial available?",
        answer: "Yes! We offer a 7-day free trial for all new users. You'll have full access to our platform features during this period. No credit card required to start your trial."
      },
      {
        question: "What are the system requirements?",
        answer: "Our platform works on all modern browsers (Chrome, Firefox, Safari, Edge). For the best experience, we recommend using the latest browser version and a stable internet connection with at least 5 Mbps download speed."
      }
    ]
  },
  {
    category: "Account Management",
    items: [
      {
        question: "How do I reset my password?",
        answer: "Click 'Forgot Password' on the login page, enter your email address, and we'll send you a password reset link. The link expires in 1 hour for security reasons."
      },
      {
        question: "Can I change my email address?",
        answer: "Yes, you can update your email in Account Settings. We'll send a verification email to your new address to confirm the change."
      },
      {
        question: "How do I delete my account?",
        answer: "Go to Account Settings > Privacy, and click 'Delete Account'. Note: This action is permanent and cannot be undone. All your data will be permanently removed."
      }
    ]
  },
  {
    category: "Billing & Payments",
    items: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and in some regions, bank transfers and digital wallets."
      },
      {
        question: "How do I cancel my subscription?",
        answer: "Go to Billing > Subscription and click 'Cancel Subscription'. You'll continue to have access until the end of your current billing period."
      },
      {
        question: "Can I get a refund?",
        answer: "We offer a 30-day money-back guarantee for all annual subscriptions. Monthly subscriptions can be canceled at any time without additional charges."
      }
    ]
  }
];

const contactMethods = [
  {
    icon: <MessageSquare className="w-8 h-8" />,
    title: "Live Chat",
    description: "Get instant help from our support team",
    responseTime: "2-5 minutes",
    availability: "24/7",
    action: "Start Chat",
    color: "bg-green-500"
  },
  {
    icon: <Mail className="w-8 h-8" />,
    title: "Email Support",
    description: "Send us a detailed message",
    responseTime: "4-12 hours",
    availability: "24/7",
    action: "Send Email",
    color: "bg-blue-500"
  },
  {
    icon: <Phone className="w-8 h-8" />,
    title: "Phone Support",
    description: "Speak directly with our team",
    responseTime: "Immediate",
    availability: "Mon-Fri, 9AM-6PM EST",
    action: "Call Now",
    color: "bg-purple-500"
  },
  {
    icon: <Video className="w-8 h-8" />,
    title: "Video Call",
    description: "Screen share for technical issues",
    responseTime: "Schedule appointment",
    availability: "By appointment",
    action: "Schedule",
    color: "bg-orange-500"
  }
];

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("help");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contactFormRef = useRef<HTMLDivElement>(null);

  const filteredArticles = popularArticles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToContact = () => {
    contactFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      // Show success message
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50/30">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 text-white border-0 backdrop-blur-sm">
              <HelpCircle className="w-3 h-3 mr-1" />
              Help Center
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              How can we help you today?
            </h1>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Find answers to common questions, browse documentation, or get in touch with our support team.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for answers, articles, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg border-0 bg-white text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-white/50"
              />
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 mt-8 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-300" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-300" />
                <span>Average response: 15min</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-blue-300" />
                <span>98% Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="help" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Help Articles
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Contact Support
            </TabsTrigger>
          </TabsList>

          {/* Help Articles Tab */}
          <TabsContent value="help" className="space-y-12">
            {/* Popular Articles */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Popular Help Articles</h2>
                  <p className="text-gray-600 mt-2">Most frequently viewed articles by our users</p>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  View All Articles
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid gap-4">
                {filteredArticles.map((article) => (
                  <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {article.category}
                            </Badge>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {article.views.toLocaleString()}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {article.readTime} min read
                              </div>
                            </div>
                          </div>
                          <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                            {article.title}
                          </h3>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Help Categories */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {helpCategories.map((category, index) => (
                  <Card 
                    key={index} 
                    className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-sm"
                  >
                    <CardHeader className="pb-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                        {category.icon}
                      </div>
                      <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                        {category.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {category.articles} articles
                        </Badge>
                        <Button variant="ghost" size="sm" className="group-hover:bg-blue-50 group-hover:text-blue-600">
                          Explore
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-12">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600">
                Quick answers to the most common questions we receive
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              {faqSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="space-y-4">
                  <h3 className="text-2xl font-semibold text-gray-900 border-b pb-2">
                    {section.category}
                  </h3>
                  <Accordion type="single" collapsible className="space-y-4">
                    {section.items.map((item, itemIndex) => (
                      <AccordionItem 
                        key={itemIndex} 
                        value={`item-${sectionIndex}-${itemIndex}`}
                        className="border rounded-lg px-6 hover:border-blue-300 transition-colors"
                      >
                        <AccordionTrigger className="hover:no-underline py-4">
                          <span className="text-left font-semibold text-gray-900">
                            {item.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 text-gray-600 leading-relaxed">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>

            {/* Still Need Help CTA */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 max-w-4xl mx-auto">
              <CardContent className="p-8 text-center">
                <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Still have questions?
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Can't find the answer you're looking for? Our support team is here to help.
                </p>
                <Button onClick={() => setActiveTab("contact")} className="bg-blue-600 hover:bg-blue-700">
                  Contact Support
                  <MessageCircle className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Support Tab */}
          <TabsContent value="contact" className="space-y-12">
            <div ref={contactFormRef} className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-lg text-gray-600">
                Choose the best way to reach our support team
              </p>
            </div>

            {/* Contact Methods */}
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                {contactMethods.map((method, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow border-0 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg ${method.color} flex items-center justify-center text-white flex-shrink-0`}>
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-2">
                            {method.title}
                          </h3>
                          <p className="text-gray-600 mb-4 text-sm">
                            {method.description}
                          </p>
                          <div className="space-y-2 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              <span>Response: {method.responseTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Zap className="w-3 h-3" />
                              <span>Available: {method.availability}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button className="w-full mt-4">
                        {method.action}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Support Ticket Form */}
            <section className="max-w-4xl mx-auto">
              <Card>
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">Submit a Support Ticket</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitTicket} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium text-gray-700">
                          Full Name *
                        </label>
                        <Input id="name" placeholder="Enter your full name" required />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Email Address *
                        </label>
                        <Input id="email" type="email" placeholder="Enter your email" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="category" className="text-sm font-medium text-gray-700">
                        Issue Category *
                      </label>
                      <select 
                        id="category"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select a category</option>
                        <option value="technical">Technical Issue</option>
                        <option value="billing">Billing & Payment</option>
                        <option value="account">Account Issue</option>
                        <option value="course">Course Content</option>
                        <option value="feature">Feature Request</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium text-gray-700">
                        Subject *
                      </label>
                      <Input id="subject" placeholder="Brief description of your issue" required />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium text-gray-700">
                        Detailed Description *
                      </label>
                      <Textarea 
                        id="description" 
                        placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce, and what you were trying to accomplish."
                        rows={6}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="attachments" className="text-sm font-medium text-gray-700">
                        Attachments (Optional)
                      </label>
                      <Input id="attachments" type="file" multiple />
                      <p className="text-sm text-gray-500">
                        You can attach screenshots, documents, or other files that might help us understand your issue.
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Submitting Ticket...
                        </>
                      ) : (
                        <>
                          Submit Support Ticket
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </section>
          </TabsContent>
        </Tabs>

        {/* Additional Resources */}
        <section className="mt-16 max-w-6xl mx-auto">
          <Card className="bg-gradient-to-r from-slate-900 to-gray-900 text-white border-0">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center md:text-left">
                  <Video className="w-8 h-8 text-blue-400 mx-auto md:mx-0 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Video Tutorials</h3>
                  <p className="text-gray-300 text-sm">
                    Watch step-by-step guides and tutorials
                  </p>
                  <Button variant="link" className="text-blue-400 p-0 mt-2">
                    Watch Tutorials
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
                
                <div className="text-center md:text-left">
                  <BookOpen className="w-8 h-8 text-green-400 mx-auto md:mx-0 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Documentation</h3>
                  <p className="text-gray-300 text-sm">
                    Comprehensive guides and API documentation
                  </p>
                  <Button variant="link" className="text-green-400 p-0 mt-2">
                    Read Docs
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
                
                <div className="text-center md:text-left">
                  <Users className="w-8 h-8 text-purple-400 mx-auto md:mx-0 mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Community Forum</h3>
                  <p className="text-gray-300 text-sm">
                    Get help from our community of experts
                  </p>
                  <Button variant="link" className="text-purple-400 p-0 mt-2">
                    Join Community
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}