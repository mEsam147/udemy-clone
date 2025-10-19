// app/terms/page.tsx
"use client";

import { FileText, Scale, User, Book, CreditCard, Shield, AlertCircle } from "lucide-react";

export default function TermsOfService() {
  const lastUpdated = "January 1, 2024";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Please read these terms carefully before using our platform.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Last updated: {lastUpdated}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="prose prose-lg max-w-none">
            {/* Agreement */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Scale className="w-6 h-6 text-blue-600" />
                Agreement to Terms
              </h2>
              <p className="text-gray-700">
                By accessing or using our platform, you agree to be bound by these Terms of Service 
                and our Privacy Policy. If you disagree with any part of these terms, you may not 
                access our platform.
              </p>
            </section>

            {/* Accounts */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-6 h-6 text-green-600" />
                User Accounts
              </h2>
              <p className="text-gray-700 mb-4">
                When you create an account with us, you must provide accurate and complete information. 
                You are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Ensuring you logout at the end of each session</li>
              </ul>
            </section>

            {/* Course Access */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Book className="w-6 h-6 text-purple-600" />
                Course Access and Usage
              </h2>
              <p className="text-gray-700 mb-4">
                When you enroll in a course:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>You get a limited, non-exclusive license to access the course content</li>
                <li>Content is for your personal, non-commercial use only</li>
                <li>You may not share your account or course materials with others</li>
                <li>You may not download, distribute, or modify course content</li>
              </ul>
            </section>

            {/* Payments */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-orange-600" />
                Payments and Refunds
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Payment Terms</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>All fees are quoted in USD and are exclusive of taxes</li>
                    <li>You authorize us to charge your payment method for applicable fees</li>
                    <li>Subscription fees recur automatically based on your billing cycle</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Refund Policy</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>30-day money-back guarantee for annual subscriptions</li>
                    <li>Monthly subscriptions can be canceled anytime</li>
                    <li>Refund requests must be submitted through our support system</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* User Conduct */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-red-600" />
                User Conduct
              </h2>
              <p className="text-gray-700 mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Use the platform for any illegal purpose</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Upload or transmit viruses or malicious code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the platform's security features</li>
                <li>Use automated systems to access the platform</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                The platform and its original content, features, and functionality are owned by us 
                and are protected by international copyright, trademark, and other intellectual 
                property laws.
              </p>
              <p className="text-gray-700">
                Course content is licensed to you for personal use only and remains the property 
                of the respective instructors or us.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
              <p className="text-gray-700">
                We may terminate or suspend your account immediately, without prior notice, for 
                conduct that we believe violates these Terms of Service or is harmful to other 
                users, us, or third parties.
              </p>
            </section>

            {/* Disclaimer */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                Disclaimer
              </h2>
              <p className="text-gray-700 mb-4">
                The platform is provided on an "as-is" and "as-available" basis. We do not warrant that:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>The platform will be uninterrupted or error-free</li>
                <li>Defects will be corrected</li>
                <li>The platform is free of viruses or other harmful components</li>
                <li>Course content will achieve any particular results</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-700">
                To the fullest extent permitted by law, we shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages resulting from your use 
                or inability to use the platform.
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these terms at any time. We will notify users of 
                significant changes via email or platform notification. Continued use of the 
                platform after changes constitutes acceptance of the new terms.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Governing Law</h2>
              <p className="text-gray-700">
                These Terms shall be governed by the laws of the State of Delaware, without regard 
                to its conflict of law provisions.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@yourplatform.com
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Address:</strong> 123 Learning Street, Education City, EC 12345
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <div className="inline-flex gap-4">
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Print Terms
            </button>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Back to Top
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}