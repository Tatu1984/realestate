"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Users,
  Star,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Calendar,
  Award,
  MessageSquare,
  Home,
  Building2,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/utils"

interface Agent {
  id: string
  companyName: string | null
  licenseNumber: string | null
  experience: number | null
  specialization: string | null
  description: string | null
  address: string | null
  city: string | null
  state: string | null
  isFeatured: boolean
  rating: number
  totalDeals: number
  user: {
    id: string
    name: string
    phone: string | null
    email: string
    avatar: string | null
  }
}

interface Property {
  id: string
  title: string
  price: number
  propertyType: string
  listingType: string
  locality: string
  city: string
  bedrooms: number | null
  bathrooms: number | null
  builtUpArea: number | null
  images: string | null
}

export default function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [agent, setAgent] = useState<Agent | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showContact, setShowContact] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "Hi, I am interested in your services. Please contact me.",
  })

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await fetch(`/api/agents/${resolvedParams.id}`)
        const data = await response.json()
        setAgent(data.agent)
        setProperties(data.properties || [])
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAgent()
  }, [resolvedParams.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agent) return

    try {
      await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: agent.user.id,
          ...contactForm,
        }),
      })
      alert("Message sent successfully!")
      setShowContact(false)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-xl mb-6"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Agent Not Found</h1>
          <p className="text-gray-600 mb-4">The agent profile you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/agents">
            <Button>Browse All Agents</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/agents" className="hover:text-blue-600">Agents</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{agent.user.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agent Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-bold text-gray-900">{agent.user.name}</h1>
                      {agent.isFeatured && <Badge variant="featured">Featured</Badge>}
                    </div>
                    {agent.companyName && (
                      <p className="text-gray-600">{agent.companyName}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold">{agent.rating.toFixed(1)}</span>
                        <span className="text-gray-500">({agent.totalDeals} deals)</span>
                      </div>
                      {agent.city && (
                        <span className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-4 h-4" />
                          {agent.city}, {agent.state}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About */}
            {agent.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 whitespace-pre-line">{agent.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {agent.experience && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Experience</p>
                        <p className="font-medium">{agent.experience} years</p>
                      </div>
                    </div>
                  )}
                  {agent.specialization && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Award className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Specialization</p>
                        <p className="font-medium">{agent.specialization}</p>
                      </div>
                    </div>
                  )}
                  {agent.licenseNumber && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Award className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">License</p>
                        <p className="font-medium">{agent.licenseNumber}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Deals Closed</p>
                      <p className="font-medium">{agent.totalDeals}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Listings */}
            {properties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Active Listings ({properties.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {properties.map((property) => {
                      const images = property.images ? JSON.parse(property.images) : []
                      return (
                        <Link
                          key={property.id}
                          href={`/property/${property.id}`}
                          className="flex gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={images[0] || "/placeholder-property.jpg"}
                              alt={property.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{property.title}</p>
                            <p className="text-blue-600 font-medium">{formatPrice(property.price)}</p>
                            <p className="text-sm text-gray-500 truncate">
                              {property.locality}, {property.city}
                            </p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Contact */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Contact Agent</h3>

                {showContact ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                      placeholder="Your Name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Your Email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                    />
                    <Input
                      type="tel"
                      placeholder="Your Phone"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    />
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      rows={3}
                      placeholder="Message"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      required
                    />
                    <Button type="submit" className="w-full">Send Message</Button>
                    <Button type="button" variant="outline" className="w-full" onClick={() => setShowContact(false)}>
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <Button className="w-full gap-2" onClick={() => setShowContact(true)}>
                      <MessageSquare className="w-4 h-4" />
                      Send Message
                    </Button>
                    {agent.user.phone && (
                      <Button variant="outline" className="w-full gap-2" asChild>
                        <a href={`tel:${agent.user.phone}`}>
                          <Phone className="w-4 h-4" />
                          {agent.user.phone}
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" className="w-full gap-2" asChild>
                      <a href={`mailto:${agent.user.email}`}>
                        <Mail className="w-4 h-4" />
                        Email
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
