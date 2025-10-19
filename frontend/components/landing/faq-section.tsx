"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  HelpCircle,
  MessageCircle,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FAQSectionProps {
  faqs: {
    question: string;
    answer: string;
  }[];
}

const categories = [
  "All",
  "Getting Started",
  "Platform",
  "Policies",
  "Certificates",
  "Support",
];

export function FAQSection({ faqs }: FAQSectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredFaqs, setFilteredFaqs] = useState(faqs);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    filterFaqs(value, selectedCategory);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    filterFaqs(searchTerm, category);
  };

  const filterFaqs = (search: string, category: string) => {
    let filtered = faqs;

    if (category !== "All") {
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(category.toLowerCase()) ||
          faq.answer.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (search) {
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(search.toLowerCase()) ||
          faq.answer.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredFaqs(filtered);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/10 mb-6"
          >
            <HelpCircle className="w-8 h-8 text-brand-primary" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Got questions? We've got answers. Find everything you need to know
            about our platform.
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl mx-auto mb-8"
        >
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-3 w-full h-12 text-base"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <motion.div
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant={
                    selectedCategory === category ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleCategoryChange(category)}
                  className="transition-all duration-200"
                >
                  {category}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="border rounded-lg px-6 bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-6 group">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium group-hover:text-brand-primary transition-colors">
                        {faq.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-16 pt-16 border-t"
        >
          <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
          <p className="text-muted-foreground mb-6">
            Our support team is here to help you succeed in your learning
            journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button className="group">
                <MessageCircle className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Contact Support
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" className="group">
                <BookOpen className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Browse Help Center
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
