"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  Building2,
  MapPin,
  Calendar,
  Home,
  Phone,
  Mail,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  X,
  Users,
  Layers,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { formatPrice } from "@/lib/utils"

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  location: string
  city: string
  state: string
  startDate: string | null
  completionDate: string | null
  totalUnits: number | null
  availableUnits: number | null
  priceRange: string | null
  amenities: string | null
  images: string | null
  isFeatured: boolean
  builder: {
    id: string
    companyName: string
    totalProjects: number
    user: {
      id: string
      name: string
      phone: string | null
      email: string
    }
  }
}

interface Property {
  id: string
  title: string
  price: number
  propertyType: string
  bedrooms: number | null
  bathrooms: number | null
  builtUpArea: number | null
  images: string | null
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [project, setProject] = useState<Project | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showGallery, setShowGallery] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "I am interested in this project. Please contact me with more details.",
  })

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${resolvedParams.id}`)
        const data = await response.json()
        setProject(data.project)
        setProperties(data.properties || [])
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [resolvedParams.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!project) return

    try {
      await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: project.builder.user.id,
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
        <div className="h-96 bg-gray-200 animate-pulse"></div>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Not Found</h1>
          <p className="text-gray-600 mb-4">The project you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/projects">
            <Button>Browse All Projects</Button>
          </Link>
        </div>
      </div>
    )
  }

  const images = project.images ? JSON.parse(project.images) : ["/placeholder-project.jpg"]
  const amenities = project.amenities ? JSON.parse(project.amenities) : []

  const statusColors: Record<string, string> = {
    ONGOING: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    UPCOMING: "bg-yellow-100 text-yellow-700",
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="relative bg-gray-900">
        <div className="relative h-[400px] md:h-[500px]">
          <Image
            src={images[currentImageIndex] || "/placeholder-project.jpg"}
            alt={project.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="absolute top-4 left-4 flex gap-2">
            {project.isFeatured && <Badge variant="featured">Featured</Badge>}
            <Badge className={statusColors[project.status]}>{project.status}</Badge>
          </div>

          <button
            onClick={() => setShowGallery(true)}
            className="absolute bottom-4 right-4 bg-white/90 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white"
          >
            View all {images.length} photos
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/projects" className="hover:text-blue-600">Projects</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{project.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600">by {project.builder.companyName}</p>
              <div className="flex items-center gap-2 mt-2 text-gray-500">
                <MapPin className="w-5 h-5" />
                <span>{project.location}, {project.city}, {project.state}</span>
              </div>
              {project.priceRange && (
                <p className="text-2xl font-bold text-blue-600 mt-3">{project.priceRange}</p>
              )}
            </div>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {project.totalUnits && (
                    <div className="text-center">
                      <Layers className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{project.totalUnits}</p>
                      <p className="text-sm text-gray-500">Total Units</p>
                    </div>
                  )}
                  {project.availableUnits !== null && (
                    <div className="text-center">
                      <Home className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">{project.availableUnits}</p>
                      <p className="text-sm text-gray-500">Available</p>
                    </div>
                  )}
                  {project.startDate && (
                    <div className="text-center">
                      <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-lg font-bold">{new Date(project.startDate).getFullYear()}</p>
                      <p className="text-sm text-gray-500">Started</p>
                    </div>
                  )}
                  {project.completionDate && (
                    <div className="text-center">
                      <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-lg font-bold">{new Date(project.completionDate).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-500">Completion</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {project.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About This Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 whitespace-pre-line">{project.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenities.map((amenity: string) => (
                      <div key={amenity} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Building2 className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Properties */}
            {properties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Available Properties ({properties.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {properties.map((property) => {
                      const propImages = property.images ? JSON.parse(property.images) : []
                      return (
                        <Link
                          key={property.id}
                          href={`/property/${property.id}`}
                          className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={propImages[0] || "/placeholder-property.jpg"}
                              alt={property.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900">{property.title}</h4>
                            <p className="text-blue-600 font-bold text-lg">{formatPrice(property.price)}</p>
                            <div className="flex gap-4 text-sm text-gray-500 mt-1">
                              {property.bedrooms && <span>{property.bedrooms} BHK</span>}
                              {property.builtUpArea && <span>{property.builtUpArea} sq.ft</span>}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 self-center" />
                        </Link>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Builder Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.builder.companyName}</h3>
                    <p className="text-sm text-gray-500">{project.builder.totalProjects} Projects</p>
                  </div>
                </div>

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
                    {project.builder.user.phone && (
                      <Button variant="outline" className="w-full gap-2" asChild>
                        <a href={`tel:${project.builder.user.phone}`}>
                          <Phone className="w-4 h-4" />
                          Call Builder
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Full Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={() => setShowGallery(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={() => setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
            className="absolute left-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
          <button
            onClick={() => setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
            className="absolute right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
          <div className="relative w-full max-w-4xl h-[80vh]">
            <Image
              src={images[currentImageIndex]}
              alt={`Image ${currentImageIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  )
}
