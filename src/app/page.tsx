import Link from "next/link"
import Image from "next/image"
import {
  Building2,
  Users,
  Home,
  TrendingUp,
  Shield,
  Clock,
  ArrowRight,
  Star,
  MapPin,
} from "lucide-react"
import SearchBox from "@/components/property/SearchBox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import prisma from "@/lib/prisma"
import { formatPrice } from "@/lib/utils"

const cities = [
  { name: "Mumbai", image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=400", count: 12500 },
  { name: "Delhi", image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400", count: 10200 },
  { name: "Bangalore", image: "https://images.unsplash.com/photo-1599686523092-af2e62b1b77b?w=400", count: 9800 },
  { name: "Hyderabad", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400", count: 7500 },
  { name: "Chennai", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400", count: 6200 },
  { name: "Pune", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400", count: 5800 },
]

const features = [
  {
    icon: Shield,
    title: "Verified Listings",
    description: "All properties are verified by our team for authenticity",
  },
  {
    icon: Clock,
    title: "Quick Response",
    description: "Get responses from property owners within 24 hours",
  },
  {
    icon: TrendingUp,
    title: "Best Prices",
    description: "Compare prices and find the best deals in your area",
  },
]

async function getFeaturedProperties() {
  try {
    return await prisma.property.findMany({
      where: {
        status: "ACTIVE",
        listingTier: { in: ["FEATURED", "PREMIUM"] },
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    })
  } catch {
    return []
  }
}

async function getFeaturedAgents() {
  try {
    return await prisma.agentProfile.findMany({
      where: { isFeatured: true },
      include: { user: true },
      take: 4,
    })
  } catch {
    return []
  }
}

async function getFeaturedProjects() {
  try {
    return await prisma.project.findMany({
      where: { isFeatured: true },
      include: { builder: { include: { user: true } } },
      take: 4,
    })
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [properties, agents, projects] = await Promise.all([
    getFeaturedProperties(),
    getFeaturedAgents(),
    getFeaturedProjects(),
  ])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Find Your <span className="text-blue-300">Dream Home</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
              Discover thousands of properties across India. Buy, sell, or rent your perfect space with PropEstate.
            </p>
          </div>
          <SearchBox />
          <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-blue-300" />
              <span>50,000+ Properties</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-300" />
              <span>10,000+ Happy Customers</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-300" />
              <span>500+ Verified Builders</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Explore Properties by City</h2>
            <p className="mt-2 text-gray-600">Find your dream home in India&apos;s top cities</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cities.map((city) => (
              <Link
                key={city.name}
                href={`/search?city=${city.name}`}
                className="group relative rounded-xl overflow-hidden aspect-[4/5] bg-gray-200"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10"></div>
                <Image
                  src={city.image}
                  alt={city.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                  <h3 className="text-white font-semibold text-lg">{city.name}</h3>
                  <p className="text-gray-200 text-sm">{city.count.toLocaleString()}+ Properties</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
              <p className="mt-2 text-gray-600">Hand-picked properties for you</p>
            </div>
            <Link href="/search?tier=featured">
              <Button variant="outline" className="gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          {properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => {
                const images = property.images ? JSON.parse(property.images) : []
                return (
                  <Link
                    key={property.id}
                    href={`/property/${property.id}`}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    <div className="relative h-48">
                      <Image
                        src={images[0] || "/placeholder-property.jpg"}
                        alt={property.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {property.listingTier === "PREMIUM" && <Badge variant="premium">Premium</Badge>}
                        {property.listingTier === "FEATURED" && <Badge variant="featured">Featured</Badge>}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xl font-bold text-gray-900">{formatPrice(property.price)}</p>
                      <h3 className="font-semibold text-gray-900 mt-1 line-clamp-1">{property.title}</h3>
                      <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                        <MapPin className="w-4 h-4" />
                        <span>{property.locality}, {property.city}</span>
                      </div>
                      <div className="flex gap-4 mt-3 pt-3 border-t text-sm text-gray-600">
                        {property.bedrooms && <span>{property.bedrooms} Beds</span>}
                        {property.bathrooms && <span>{property.bathrooms} Baths</span>}
                        {property.builtUpArea && <span>{property.builtUpArea} sq.ft</span>}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No featured properties yet. Be the first to list!</p>
              <Link href="/admin/properties/add">
                <Button className="mt-4">Post Property</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Popular Projects</h2>
              <p className="mt-2 text-gray-600">Top projects from trusted builders</p>
            </div>
            <Link href="/projects">
              <Button variant="outline" className="gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {projects.map((project) => {
                const images = project.images ? JSON.parse(project.images) : []
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-40">
                      <Image
                        src={images[0] || "/placeholder-project.jpg"}
                        alt={project.name}
                        fill
                        className="object-cover"
                      />
                      <Badge className="absolute top-3 left-3" variant={project.status === "COMPLETED" ? "success" : "default"}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-500">by {project.builder.companyName}</p>
                      <div className="flex items-center gap-1 text-gray-500 text-sm mt-2">
                        <MapPin className="w-4 h-4" />
                        <span>{project.location}, {project.city}</span>
                      </div>
                      {project.priceRange && (
                        <p className="text-blue-600 font-semibold mt-2">{project.priceRange}</p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No featured projects yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Agents */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Top Agents</h2>
              <p className="mt-2 text-gray-600">Work with the best real estate professionals</p>
            </div>
            <Link href="/agents">
              <Button variant="outline" className="gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          {agents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {agents.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.id}`}
                  className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{agent.user.name}</h3>
                  {agent.companyName && (
                    <p className="text-sm text-gray-500">{agent.companyName}</p>
                  )}
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">{agent.rating.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({agent.totalDeals} deals)</span>
                  </div>
                  {agent.city && (
                    <p className="text-sm text-gray-500 mt-2">{agent.city}, {agent.state}</p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No featured agents yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why Choose PropEstate?</h2>
            <p className="mt-2 text-blue-200">We make finding your dream home simple and trustworthy</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="w-16 h-16 bg-blue-800 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-blue-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-blue-200">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to List Your Property?
            </h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-8">
              Join thousands of property owners who trust PropEstate. List your property for free and reach millions of potential buyers and tenants.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/admin/properties/add">
                <Button size="xl" className="bg-white text-blue-600 hover:bg-gray-100">
                  Post Property Free
                </Button>
              </Link>
              <Link href="/register">
                <Button size="xl" variant="outline" className="border-white text-white hover:bg-white/10">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
