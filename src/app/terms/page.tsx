export const metadata = {
  title: "Terms of Service | PropEstate",
  description: "PropEstate terms of service - Rules and guidelines for using our platform",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600">
              By accessing and using PropEstate ("the Service"), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-600">
              PropEstate is an online real estate marketplace that connects property buyers, sellers, renters,
              landlords, agents, and builders. We provide a platform for listing and searching properties,
              but we are not a party to any transactions between users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-600 mb-4">When creating an account, you agree to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Property Listings</h2>
            <p className="text-gray-600 mb-4">When listing properties, you agree to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Provide accurate and truthful property information</li>
              <li>Have the legal right to list the property</li>
              <li>Not post fraudulent or misleading listings</li>
              <li>Update listing information promptly when changes occur</li>
              <li>Comply with all applicable real estate laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Prohibited Activities</h2>
            <p className="text-gray-600 mb-4">You may not:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Post false, misleading, or fraudulent content</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the Service for any illegal purposes</li>
              <li>Scrape or collect user data without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Fees and Payments</h2>
            <p className="text-gray-600">
              Some services may require payment. All fees are non-refundable unless otherwise stated.
              We reserve the right to change our pricing at any time with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Disclaimer of Warranties</h2>
            <p className="text-gray-600">
              The Service is provided "as is" without warranties of any kind. We do not guarantee the accuracy
              of property listings or the conduct of other users. PropEstate is not responsible for any
              transactions between users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
            <p className="text-gray-600">
              To the maximum extent permitted by law, PropEstate shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Indemnification</h2>
            <p className="text-gray-600">
              You agree to indemnify and hold harmless PropEstate and its affiliates from any claims,
              damages, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
            <p className="text-gray-600">
              We reserve the right to suspend or terminate your account at any time for violation of these
              Terms or for any other reason at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-600">
              We may modify these Terms at any time. Continued use of the Service after changes
              constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Governing Law</h2>
            <p className="text-gray-600">
              These Terms shall be governed by the laws of India. Any disputes shall be subject to
              the exclusive jurisdiction of the courts in Mumbai, India.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Information</h2>
            <p className="text-gray-600">
              For questions about these Terms, please contact us at:
            </p>
            <p className="text-gray-600 mt-2">
              <strong>Email:</strong> legal@propestate.com<br />
              <strong>Address:</strong> PropEstate, Mumbai, India
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
