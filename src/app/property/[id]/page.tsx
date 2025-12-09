"use client"

import { useState, useEffect, use } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Calendar,
  Eye,
  Heart,
  Share2,
  Phone,
  Mail,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  X,
  Building2,
  Compass,
  Layers,
  Car,
  Dumbbell,
  Waves,
  Shield,
  Leaf,
  Wifi,
  Wind,
  Play,
  User,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice, formatArea, timeAgo } from "@/lib/utils"

interface Property {
  id: string
  title: string
  description: string | null
  price: number
  propertyType: string
  listingType: string
  listingTier: string
  address: string
  locality: string
  city: string
  state: string
  pincode: string | null
  bedrooms: number | null
  bathrooms: number | null
  balconies: number | null
  floorNumber: number | null
  totalFloors: number | null
  facing: string | null
  furnishing: string | null
  builtUpArea: number | null
  carpetArea: number | null
  plotArea: number | null
  pricePerSqft: number | null
  maintenance: number | null
  securityDeposit: number | null
  images: string | null
  videoUrl: string | null
  amenities: string | null
  views: number
  availableFrom: string | null
  createdAt: string
  user: {
    id: string
    name: string
    phone: string | null
    email: string
    userType: string
    avatar: string | null
    agentProfile?: {
      companyName: string | null
      rating: number
      totalDeals: number
    } | null
  }
}

const amenityIcons: Record<string, typeof Wifi> = {
  "Swimming Pool": Waves,
  "Gym": Dumbbell,
  "Parking": Car,
  "Security": Shield,
  "Garden": Leaf,
  "Wifi": Wifi,
  "AC": Wind,
}

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { data: session } = useSession()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showGallery, setShowGallery] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "I am interested in this property. Please contact me.",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${resolvedParams.id}`)
        const data = await response.json()
        setProperty(data.property)
      } catch (error) {
        console.error("Error fetching property:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [resolvedParams.id])

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!property) return

    setSubmitting(true)
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          receiverId: property.user.id,
          ...inquiryForm,
        }),
      })

      if (response.ok) {
        alert("Inquiry sent successfully!")
        setShowContact(false)
      }
    } catch (error) {
      console.error("Error sending inquiry:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Property Not Found</h1>
          <p className="text-gray-600 mb-4">The property you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/search">
            <Button>Browse Properties</Button>
          </Link>
        </div>
      </div>
    )
  }

  const images = property.images ? JSON.parse(property.images) : ["/placeholder-property.jpg"]
  const amenities = property.amenities ? JSON.parse(property.amenities) : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Image Gallery */}
      <div className="relative bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="relative h-[400px] md:h-[500px]">
            <Image
              src={images[currentImageIndex] || "/placeholder-property.jpg"}
              alt={property.title}
              fill
              className="object-cover"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

            {/* Navigation Arrows */}
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

            {/* View All Photos Button */}
            <button
              onClick={() => setShowGallery(true)}
              className="absolute bottom-4 right-4 bg-white/90 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white"
            >
              View all {images.length} photos
            </button>

            {/* Thumbnails */}
            <div className="absolute bottom-4 left-4 flex gap-2">
              {images.slice(0, 4).map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 ${
                    currentImageIndex === index ? "border-white" : "border-transparent"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    width={64}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {property.listingTier === "PREMIUM" && <Badge variant="premium">Premium</Badge>}
              {property.listingTier === "FEATURED" && <Badge variant="featured">Featured</Badge>}
              <Badge variant={property.listingType === "SELL" ? "default" : "secondary"}>
                {property.listingType === "SELL" ? "For Sale" : property.listingType === "RENT" ? "For Rent" : property.listingType}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white">
                <Heart className="w-5 h-5 text-gray-700" />
              </button>
              <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white">
                <Share2 className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{property.title}</h1>
              <div className="flex items-center gap-2 mt-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>
                  {property.address}, {property.locality}, {property.city}, {property.state}
                  {property.pincode && ` - ${property.pincode}`}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <span className="text-3xl font-bold text-blue-600">{formatPrice(property.price)}</span>
                {property.pricePerSqft && (
                  <span className="text-gray-500">
                    @ {formatPrice(property.pricePerSqft)}/sq.ft
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {property.views} views
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Posted {timeAgo(new Date(property.createdAt))}
                </span>
              </div>
            </div>

            {/* Key Features */}
            <Card>
              <CardHeader>
                <CardTitle>Property Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {property.bedrooms && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Bed className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Bedrooms</p>
                        <p className="font-semibold">{property.bedrooms}</p>
                      </div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Bath className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Bathrooms</p>
                        <p className="font-semibold">{property.bathrooms}</p>
                      </div>
                    </div>
                  )}
                  {property.builtUpArea && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Maximize className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Built-up Area</p>
                        <p className="font-semibold">{formatArea(property.builtUpArea)}</p>
                      </div>
                    </div>
                  )}
                  {property.facing && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Compass className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Facing</p>
                        <p className="font-semibold">{property.facing}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Property Type</p>
                    <p className="font-medium">{property.propertyType}</p>
                  </div>
                  {property.carpetArea && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Carpet Area</p>
                      <p className="font-medium">{formatArea(property.carpetArea)}</p>
                    </div>
                  )}
                  {property.plotArea && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Plot Area</p>
                      <p className="font-medium">{formatArea(property.plotArea)}</p>
                    </div>
                  )}
                  {property.floorNumber && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Floor</p>
                      <p className="font-medium">
                        {property.floorNumber} of {property.totalFloors}
                      </p>
                    </div>
                  )}
                  {property.balconies && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Balconies</p>
                      <p className="font-medium">{property.balconies}</p>
                    </div>
                  )}
                  {property.furnishing && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Furnishing</p>
                      <p className="font-medium">{property.furnishing.replace("_", " ")}</p>
                    </div>
                  )}
                  {property.maintenance && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Maintenance</p>
                      <p className="font-medium">{formatPrice(property.maintenance)}/month</p>
                    </div>
                  )}
                  {property.securityDeposit && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Security Deposit</p>
                      <p className="font-medium">{formatPrice(property.securityDeposit)}</p>
                    </div>
                  )}
                  {property.availableFrom && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Available From</p>
                      <p className="font-medium">
                        {new Date(property.availableFrom).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {property.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 whitespace-pre-line">{property.description}</p>
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {amenities.map((amenity: string) => {
                      const Icon = amenityIcons[amenity] || Building2
                      return (
                        <div
                          key={amenity}
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                        >
                          <Icon className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium">{amenity}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Video */}
            {property.videoUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Property Video</CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={property.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Play className="w-5 h-5" />
                    Watch Property Video
                  </a>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{property.user.name}</h3>
                    <p className="text-sm text-gray-500">
                      {property.user.userType === "AGENT"
                        ? "Real Estate Agent"
                        : property.user.userType === "BUILDER"
                        ? "Builder/Developer"
                        : "Property Owner"}
                    </p>
                    {property.user.agentProfile && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-medium">
                          {property.user.agentProfile.rating.toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({property.user.agentProfile.totalDeals} deals)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {showContact ? (
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    <Input
                      placeholder="Your Name"
                      value={inquiryForm.name}
                      onChange={(e) =>
                        setInquiryForm({ ...inquiryForm, name: e.target.value })
                      }
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Your Email"
                      value={inquiryForm.email}
                      onChange={(e) =>
                        setInquiryForm({ ...inquiryForm, email: e.target.value })
                      }
                      required
                    />
                    <Input
                      type="tel"
                      placeholder="Your Phone"
                      value={inquiryForm.phone}
                      onChange={(e) =>
                        setInquiryForm({ ...inquiryForm, phone: e.target.value })
                      }
                    />
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Your Message"
                      value={inquiryForm.message}
                      onChange={(e) =>
                        setInquiryForm({ ...inquiryForm, message: e.target.value })
                      }
                      required
                    ></textarea>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? "Sending..." : "Send Inquiry"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowContact(false)}
                    >
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <Button className="w-full gap-2" onClick={() => setShowContact(true)}>
                      <MessageSquare className="w-4 h-4" />
                      Contact {property.user.userType === "AGENT" ? "Agent" : "Owner"}
                    </Button>
                    {property.user.phone && (
                      <Button variant="outline" className="w-full gap-2" asChild>
                        <a href={`tel:${property.user.phone}`}>
                          <Phone className="w-4 h-4" />
                          Call Now
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
