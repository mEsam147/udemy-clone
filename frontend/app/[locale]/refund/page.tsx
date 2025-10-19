// app/refund/page.tsx
"use client";

import { ArrowLeft, CheckCircle, XCircle, Clock, Mail, CreditCard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RefundPolicy() {
  const lastUpdated = "January 1, 2024";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Refund Policy</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We want you to be completely satisfied with your purchase. Here's our straightforward refund policy.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Last updated: {lastUpdated}
          </div>
        </div>

        {/* Quick Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center p-4 border border-green-200 rounded-lg bg-green-50">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-green-800 mb-2">What's Covered</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>30-day money-back guarantee</li>
                <li>Annual subscriptions</li>
                <li>Technical issues we can't fix</li>
                <li>Duplicate charges</li>
              </ul>
            </div>
            
            <div className="text-center p-4 border border-red-200 rounded-lg bg-red-50">
              <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
              <h3 className="font-semibold text-red-800 mb-2">What's Not Covered</h3>
              <ul className="text-sm text-red-700 space-y-1">
                <li>Monthly subscriptions</li>
                <li>Partial course completion</li>
                <li>Change of mind after 30 days</li>
                <li>Downloaded content</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="prose prose-lg max-w-none">
            {/* 30-Day Guarantee */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                30-Day Money-Back Guarantee
              </h2>
              <p className="text-gray-700 mb-4">
                We offer a 30-day money-back guarantee for all annual subscriptions. If you're not satisfied 
                with our platform for any reason, you can request a full refund within 30 days of your purchase.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 font-medium">
                  Note: This guarantee applies only to annual subscription plans.
                </p>
              </div>
            </section>

            {/* Monthly Subscriptions */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Monthly Subscriptions</h2>
              <p className="text-gray-700 mb-4">
                For monthly subscriptions, you can cancel at any time. When you cancel:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Your subscription will not renew for the next billing cycle</li>
                <li>You'll maintain access until the end of your current billing period</li>
                <li>No partial refunds are provided for unused time in the current month</li>
              </ul>
            </section>

            {/* How to Request */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Request a Refund</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1 flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Contact Support</h3>
                    <p className="text-gray-700">Email us at refunds@yourplatform.com with your order details</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1 flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Provide Information</h3>
                    <p className="text-gray-700">Include your email address and reason for the refund request</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1 flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Processing</h3>
                    <p className="text-gray-700">We'll process your refund within 5-7 business days</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Refund Processing */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refund Processing</h2>
              <p className="text-gray-700 mb-4">
                Once approved, refunds are processed within 5-7 business days. The refund will be issued 
                to your original payment method.
              </p>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-yellow-800">
                  <strong>Note:</strong> It may take additional time for the refund to appear on your 
                  bank or credit card statement, depending on your financial institution.
                </p>
              </div>
            </section>

            {/* Non-Refundable Items */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Non-Refundable Items</h2>
              <p className="text-gray-700 mb-4">
                The following are generally not eligible for refunds:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Monthly subscription fees for the current billing period</li>
                <li>Courses that are more than 50% completed</li>
                <li>Downloadable content or resources</li>
                <li>Gift cards or promotional credits</li>
                <li>Subscription renewals after the initial 30-day period</li>
              </ul>
            </section>

            {/* Special Circumstances */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Special Circumstances</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Technical Issues</h3>
                  <p className="text-gray-700">
                    If you experience persistent technical issues that prevent you from using our platform, 
                    we'll work to resolve them. If we cannot fix the issues, you may be eligible for a refund 
                    regardless of the 30-day period.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Duplicate Charges</h3>
                  <p className="text-gray-700">
                    If you've been charged multiple times for the same purchase, please contact us immediately. 
                    We'll refund any duplicate charges.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-6 h-6 text-purple-600" />
                Contact Us
              </h2>
              <p className="text-gray-700 mb-4">
                For refund requests or questions about our refund policy:
              </p>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> refunds@yourplatform.com
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Response Time:</strong> Within 24 hours
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Processing Time:</strong> 5-7 business days after approval
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild className="bg-green-600 hover:bg-green-700">
            <Link href="/contact">
              Contact Support
              <Mail className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}