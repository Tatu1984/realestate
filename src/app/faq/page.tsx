"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

const faqs = [
  {
    category: "Buying Property",
    questions: [
      {
        q: "How do I search for properties on PropEstate?",
        a: "Use our search bar on the homepage or search page. You can filter by location, property type, budget, and more. Our advanced filters help you find exactly what you're looking for.",
      },
      {
        q: "How do I contact a property owner or agent?",
        a: "Click on any property listing to view details. You'll find contact options including a contact form, phone number, and email. You can also send an inquiry directly through our platform.",
      },
      {
        q: "Are the listings verified?",
        a: "We verify property listings to the best of our ability. Look for the 'Verified' badge on listings. However, we always recommend visiting the property in person before making any decisions.",
      },
      {
        q: "Can I shortlist properties?",
        a: "Yes! Click the heart icon on any property to add it to your shortlist. Access your shortlisted properties from your dashboard anytime.",
      },
    ],
  },
  {
    category: "Selling/Renting Property",
    questions: [
      {
        q: "How do I list my property on PropEstate?",
        a: "Register on our platform, go to your dashboard, and click 'Post Property'. Fill in the details, upload photos, and submit. Your listing will be live after review.",
      },
      {
        q: "Is it free to list a property?",
        a: "Basic listings are free. We also offer premium and featured listings for better visibility. Check our membership plans for more details.",
      },
      {
        q: "How can I make my listing stand out?",
        a: "Add high-quality photos, write a detailed description, mention all amenities, and consider upgrading to a featured or premium listing for better visibility.",
      },
      {
        q: "How long does it take for my listing to go live?",
        a: "Most listings are reviewed and approved within 24-48 hours. You'll receive an email notification once your property is live.",
      },
    ],
  },
  {
    category: "Account & Payments",
    questions: [
      {
        q: "How do I create an account?",
        a: "Click the 'Register' button on the top right. Choose your account type (Property Owner, Agent, or Builder), fill in your details, and you're good to go.",
      },
      {
        q: "What are the membership plans?",
        a: "We offer various membership plans for agents and builders with features like multiple listings, featured placement, and analytics. Visit our pricing page for details.",
      },
      {
        q: "How do I update my profile?",
        a: "Log in to your account, go to Dashboard > Settings, and update your profile information, contact details, and preferences.",
      },
    ],
  },
  {
    category: "Safety & Security",
    questions: [
      {
        q: "Is my personal information safe?",
        a: "Yes, we take data privacy seriously. Your personal information is encrypted and never shared without your consent. Read our Privacy Policy for more details.",
      },
      {
        q: "How do I report a fraudulent listing?",
        a: "Click the 'Report' button on the listing page or contact us directly. Our team investigates all reports and takes appropriate action.",
      },
      {
        q: "What precautions should I take when dealing with property transactions?",
        a: "Always verify documents, visit the property in person, deal through official channels, never pay in cash, and consider hiring a legal expert for documentation.",
      },
    ],
  },
]

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const filteredFaqs = faqs.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h1>
          <p className="mt-4 text-lg text-purple-100">
            Find answers to common questions about buying, selling, and renting properties on PropEstate.
          </p>
          {/* Search */}
          <div className="mt-8 relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white text-gray-900"
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((category) => (
            <div key={category.category} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {category.category}
              </h2>
              <div className="space-y-3">
                {category.questions.map((item, index) => {
                  const id = `${category.category}-${index}`
                  const isOpen = openItems.includes(id)
                  return (
                    <div
                      key={id}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(id)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50"
                      >
                        <span className="font-medium text-gray-900">{item.q}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-500 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-600">{item.a}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-600">
              Try searching with different keywords or browse all categories.
            </p>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-4">
            Can&apos;t find the answer you&apos;re looking for? Please contact our friendly support team.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
