"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import AdminLayout from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/button"
import {
  Heart,
  Trash2,
  Building2,
  MapPin,
  Bed,
  Bath,
  Square,
  Eye,
  ExternalLink
} from "lucide-react"

interface Favorite {
  id: string
  createdAt: string
  property: {
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
    status: string
  }
}

export default function AdminShortlistPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    fetchFavorites()
  }, [session])

  const fetchFavorites = async () => {
    if (!session?.user) return
    try {
      const response = await fetch("/api/favorites")
      if (response.ok) {
        const data = await response.json()
        setFavorites(data.favorites || [])
      }
    } catch (error) {
      console.error("Error fetching favorites:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id: string, propertyId: string) => {
    if (!confirm("Remove this property from your shortlist?")) return
    try {
      const response = await fetch(`/api/favorites/${propertyId}`, { method: "DELETE" })
      if (response.ok) {
        setFavorites(favorites.filter(f => f.id !== id))
      }
    } catch (error) {
      console.error("Error removing favorite:", error)
    }
  }

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lac`
    }
    return `₹${price.toLocaleString()}`
  }

  if (status === "loading" || loading) {
    return (
      <AdminLayout title="Shortlisted Properties" breadcrumbs={[{ name: "Shortlist" }]}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Shortlisted Properties" breadcrumbs={[{ name: "Shortlist" }]}>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{favorites.length}</p>
              <p className="text-sm text-slate-500">Total Saved</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{favorites.filter(f => f.property.listingType === "SELL").length}</p>
              <p className="text-sm text-slate-500">For Sale</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{favorites.filter(f => f.property.listingType === "RENT").length}</p>
              <p className="text-sm text-slate-500">For Rent</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{favorites.filter(f => f.property.listingType === "PG").length}</p>
              <p className="text-sm text-slate-500">PG/Hostel</p>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => {
            const images = favorite.property.images ? JSON.parse(favorite.property.images) : []
            return (
              <div key={favorite.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={images[0] || "/placeholder-property.jpg"}
                    alt={favorite.property.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      favorite.property.listingType === "SELL"
                        ? "bg-green-100 text-green-700"
                        : favorite.property.listingType === "RENT"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}>
                      {favorite.property.listingType === "SELL" ? "For Sale" :
                       favorite.property.listingType === "RENT" ? "For Rent" : "PG"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemove(favorite.id, favorite.property.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                  >
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{favorite.property.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                    <MapPin className="w-4 h-4" />
                    {favorite.property.locality}, {favorite.property.city}
                  </p>

                  <p className="text-xl font-bold text-blue-600 mb-3">
                    {formatPrice(favorite.property.price)}
                    {favorite.property.listingType === "RENT" && <span className="text-sm font-normal">/month</span>}
                  </p>

                  <div className="flex gap-4 text-sm text-gray-600 mb-4">
                    {favorite.property.bedrooms && (
                      <span className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        {favorite.property.bedrooms} Beds
                      </span>
                    )}
                    {favorite.property.bathrooms && (
                      <span className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        {favorite.property.bathrooms} Baths
                      </span>
                    )}
                    {favorite.property.builtUpArea && (
                      <span className="flex items-center gap-1">
                        <Square className="w-4 h-4" />
                        {favorite.property.builtUpArea} sqft
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/property/${favorite.property.id}`} className="flex-1">
                      <Button variant="outline" className="w-full gap-2" size="sm">
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemove(favorite.id, favorite.property.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center">
          <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Shortlisted Properties</h3>
          <p className="text-slate-500 mb-6">Start exploring properties and save your favorites here!</p>
          <Link href="/search">
            <Button className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Browse Properties
            </Button>
          </Link>
        </div>
      )}
    </AdminLayout>
  )
}
