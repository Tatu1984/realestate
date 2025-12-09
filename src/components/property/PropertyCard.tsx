"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, MapPin, Bed, Bath, Maximize, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatPrice, formatArea } from "@/lib/utils"

interface PropertyCardProps {
  property: {
    id: string
    title: string
    price: number
    propertyType: string
    listingType: string
    listingTier: string
    bedrooms?: number | null
    bathrooms?: number | null
    builtUpArea?: number | null
    locality: string
    city: string
    images?: string | null
    views: number
  }
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const images = property.images ? JSON.parse(property.images) : []
  const mainImage = images[0] || "/placeholder-property.jpg"

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={mainImage}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {property.listingTier === "PREMIUM" && (
            <Badge variant="premium">Premium</Badge>
          )}
          {property.listingTier === "FEATURED" && (
            <Badge variant="featured">Featured</Badge>
          )}
          <Badge variant={property.listingType === "SELL" ? "default" : "secondary"}>
            {property.listingType === "SELL" ? "For Sale" : property.listingType === "RENT" ? "For Rent" : property.listingType}
          </Badge>
        </div>
        {/* Favorite Button */}
        <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
          <Heart className="w-4 h-4 text-gray-600" />
        </button>
        {/* Views */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          <Eye className="w-3 h-3" />
          {property.views}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Price */}
        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(property.price)}
          </span>
          {property.builtUpArea && (
            <span className="text-sm text-gray-500">
              {formatPrice(Math.round(property.price / property.builtUpArea))}/sq.ft
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/property/${property.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
            {property.title}
          </h3>
        </Link>

        {/* Location */}
        <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
          <MapPin className="w-4 h-4" />
          <span className="line-clamp-1">{property.locality}, {property.city}</span>
        </div>

        {/* Property Type */}
        <p className="text-sm text-gray-500 mt-1">{property.propertyType}</p>

        {/* Features */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
          {property.bedrooms && (
            <div className="flex items-center gap-1 text-gray-600">
              <Bed className="w-4 h-4" />
              <span className="text-sm">{property.bedrooms} Beds</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center gap-1 text-gray-600">
              <Bath className="w-4 h-4" />
              <span className="text-sm">{property.bathrooms} Baths</span>
            </div>
          )}
          {property.builtUpArea && (
            <div className="flex items-center gap-1 text-gray-600">
              <Maximize className="w-4 h-4" />
              <span className="text-sm">{formatArea(property.builtUpArea)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
