"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Building2,
  MapPin,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  ChevronRight,
  Users,
  Briefcase,
  Award,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/utils"

interface Builder {
  id: string
  companyName: string
  description: string | null
  city: string | null
  state: string | null
  address: string | null
  website: string | null
  establishedYear: number | null
  totalProjects: number
  ongoingProjects: number
  completedProjects: number
  isFeatured: boolean
  user: {
    id: string
    name: string
    phone: string | null
    email: string
  }
}

interface Project {
  id: string
  name: string
  status: string
  location: string
  city: string
  priceRange: string | null
  totalUnits: number | null
  availableUnits: number | null
  images: string | null
}

export default function BuilderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [builder, setBuilder] = useState<Builder | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showContact, setShowContact] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "I am interested in your projects. Please contact me with more details.",
  })

  useEffect(() => {
    const fetchBuilder = async () => {
      try {
        const response = await fetch(`/api/builders/${resolvedParams.id}`)
        const data = await response.json()
        setBuilder(data.builder)
        setProjects(data.projects || [])
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBuilder()
  }, [resolvedParams.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!builder) return

    try {
      await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: builder.user.id,
          ...contactForm,
        }),
      })
      alert("Inquiry sent successfully!")
      setShowContact(false)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-64 bg-gradient-to-br from-blue-600 to-indigo-700 animate-pulse"></div>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!builder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Builder Not Found</h1>
          <p className="text-gray-600 mb-4">The builder you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/builders">
            <Button>Browse All Builders</Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    ONGOING: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    UPCOMING: "bg-yellow-100 text-yellow-700",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <nav className="flex items-center gap-2 text-sm text-blue-100 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/builders" className="hover:text-white">Builders</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{builder.companyName}</span>
          </nav>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <Building2 className="w-12 h-12 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{builder.companyName}</h1>
                {builder.isFeatured && <Badge variant="featured">Featured</Badge>}
              </div>
              {builder.city && (
                <p className="flex items-center gap-2 text-blue-100 mb-4">
                  <MapPin className="w-5 h-5" />
                  {builder.city}, {builder.state}
                </p>
              )}
              <div className="flex flex-wrap gap-6 text-sm">
                {builder.establishedYear && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Est. {builder.establishedYear}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  <span>{builder.totalProjects} Total Projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>{builder.completedProjects} Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-3xl font-bold text-blue-600">{builder.totalProjects}</p>
                    <p className="text-sm text-gray-500">Total Projects</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-600">{builder.completedProjects}</p>
                    <p className="text-sm text-gray-500">Completed</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-amber-600">{builder.ongoingProjects}</p>
                    <p className="text-sm text-gray-500">Ongoing</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About */}
            {builder.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About {builder.companyName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 whitespace-pre-line">{builder.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Projects ({projects.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length > 0 ? (
                  <div className="space-y-4">
                    {projects.map((project) => {
                      const images = project.images ? JSON.parse(project.images) : []
                      return (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="relative w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={images[0] || "/placeholder-project.jpg"}
                              alt={project.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{project.name}</h4>
                              <Badge className={statusColors[project.status]}>{project.status}</Badge>
                            </div>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {project.location}, {project.city}
                            </p>
                            {project.priceRange && (
                              <p className="text-blue-600 font-semibold mt-1">{project.priceRange}</p>
                            )}
                            <div className="flex gap-4 text-sm text-gray-500 mt-2">
                              {project.totalUnits && <span>{project.totalUnits} Units</span>}
                              {project.availableUnits !== null && (
                                <span className="text-green-600">{project.availableUnits} Available</span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 self-center" />
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No projects listed yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Contact Builder</h3>

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
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      required
                    />
                    <Button type="submit" className="w-full">Send Inquiry</Button>
                    <Button type="button" variant="outline" className="w-full" onClick={() => setShowContact(false)}>
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <Button className="w-full gap-2" onClick={() => setShowContact(true)}>
                      <MessageSquare className="w-4 h-4" />
                      Get Details
                    </Button>
                    {builder.user.phone && (
                      <Button variant="outline" className="w-full gap-2" asChild>
                        <a href={`tel:${builder.user.phone}`}>
                          <Phone className="w-4 h-4" />
                          Call Now
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" className="w-full gap-2" asChild>
                      <a href={`mailto:${builder.user.email}`}>
                        <Mail className="w-4 h-4" />
                        Email
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Info</h3>
                <div className="space-y-4">
                  {builder.address && (
                    <div className="flex gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-gray-900">{builder.address}</p>
                      </div>
                    </div>
                  )}
                  {builder.establishedYear && (
                    <div className="flex gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Established</p>
                        <p className="text-gray-900">{builder.establishedYear}</p>
                      </div>
                    </div>
                  )}
                  {builder.website && (
                    <div className="flex gap-3">
                      <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Website</p>
                        <a href={builder.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Visit Website
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
