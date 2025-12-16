export const metadata = {
  title: "Privacy Policy | PropEstate",
  description: "PropEstate privacy policy - How we collect, use, and protect your data",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600">
              PropEstate ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you visit our website
              and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-600 mb-4">We may collect information about you in various ways:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Personal Data:</strong> Name, email address, phone number, and postal address when you register or contact us.</li>
              <li><strong>Property Information:</strong> Details about properties you list or inquire about.</li>
              <li><strong>Usage Data:</strong> Information about how you use our website and services.</li>
              <li><strong>Device Information:</strong> Browser type, IP address, and device identifiers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Connect buyers, sellers, and agents</li>
              <li>Send promotional communications (with your consent)</li>
              <li>Respond to your comments and questions</li>
              <li>Protect against fraudulent or illegal activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
            <p className="text-gray-600 mb-4">We may share your information with:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Service Providers:</strong> Third parties that help us operate our platform.</li>
              <li><strong>Real Estate Professionals:</strong> Agents and builders when you express interest in properties.</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-600">
              We implement appropriate technical and organizational measures to protect your personal information.
              However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
            <p className="text-gray-600 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies</h2>
            <p className="text-gray-600">
              We use cookies and similar tracking technologies to track activity on our website and hold certain information.
              You can instruct your browser to refuse all cookies or indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
            <p className="text-gray-600">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-gray-600 mt-2">
              <strong>Email:</strong> privacy@propestate.com<br />
              <strong>Address:</strong> PropEstate, Mumbai, India
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
