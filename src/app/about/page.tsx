import { Building2, Users, Shield, Award, Target, Heart } from "lucide-react"

export const metadata = {
  title: "About Us | PropEstate",
  description: "Learn about PropEstate - India's trusted real estate marketplace",
}

export default function AboutPage() {
  const stats = [
    { label: "Properties Listed", value: "50,000+" },
    { label: "Happy Customers", value: "10,000+" },
    { label: "Verified Agents", value: "2,000+" },
    { label: "Cities Covered", value: "100+" },
  ]

  const values = [
    {
      icon: Shield,
      title: "Trust & Transparency",
      description: "We verify all listings and agents to ensure you get accurate information.",
    },
    {
      icon: Target,
      title: "Customer Focus",
      description: "Your property journey is our priority. We're here to help every step of the way.",
    },
    {
      icon: Heart,
      title: "Passion for Excellence",
      description: "We continuously improve our platform to provide the best experience.",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About PropEstate</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            India's most trusted real estate marketplace, connecting buyers, sellers, and agents
            to make property transactions simple, transparent, and secure.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl font-bold text-blue-600">{stat.value}</p>
                <p className="text-gray-600 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                At PropEstate, we believe everyone deserves to find their perfect home. Our mission
                is to simplify the real estate journey by providing a platform that connects people
                with the right properties and professionals.
              </p>
              <p className="text-gray-600 mb-4">
                Founded with the vision of making property transactions transparent and hassle-free,
                we've grown to become one of India's leading real estate marketplaces.
              </p>
              <p className="text-gray-600">
                Whether you're buying your first home, selling a property, or looking for rental
                accommodation, PropEstate is your trusted partner throughout the process.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
              <Building2 className="w-16 h-16 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Why Choose Us?</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>Verified and trusted listings</span>
                </li>
                <li className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>Expert real estate agents</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span>Secure transactions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value) => (
              <div key={value.title} className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Our team is here to help you with any questions about buying, selling, or renting properties.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-900 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  )
}
