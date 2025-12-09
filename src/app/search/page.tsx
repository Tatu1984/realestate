"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Search,
  MapPin,
  Filter,
  Grid,
  List,
  ChevronDown,
  X,
  Bed,
  Bath,
  Maximize,
  Heart,
  SlidersHorizontal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { formatPrice, formatArea } from "@/lib/utils"

const propertyTypes = [
  "All Types",
  "Apartment",
  "House",
  "Villa",
  "Plot",
  "Commercial",
  "PG",
]

const bedroomOptions = ["Any", "1", "2", "3", "4", "5+"]

const sortOptions = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Most Popular", value: "popular" },
]

interface Property {
  id: string
  title: string
  price: number
  propertyType: string
  listingType: string
  listingTier: string
  bedrooms: number | null
  bathrooms: number | null
  builtUpArea: number | null
  locality: string
  city: string
  state: string
  images: string | null
  views: number
  createdAt: string
}

function SearchContent() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("newest")

  // Filters
  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [listingType, setListingType] = useState(searchParams.get("type") || "SELL")
  const [propertyType, setPropertyType] = useState(searchParams.get("propertyType") || "All Types")
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "Any")
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")

  const fetchProperties = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (location) params.set("location", location)
      if (listingType) params.set("listingType", listingType)
      if (propertyType !== "All Types") params.set("propertyType", propertyType)
      if (bedrooms !== "Any") params.set("bedrooms", bedrooms)
      if (minPrice) params.set("minPrice", minPrice)
      if (maxPrice) params.set("maxPrice", maxPrice)
      params.set("sortBy", sortBy)

      const response = await fetch(`/api/properties?${params.toString()}`)
      const data = await response.json()
      setProperties(data.properties || [])
    } catch (error) {
      console.error("Error fetching properties:", error)
    } finally {
      setLoading(false)
    }
  }, [location, listingType, propertyType, bedrooms, minPrice, maxPrice, sortBy])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  const clearFilters = () => {
    setLocation("")
    setPropertyType("All Types")
    setBedrooms("Any")
    setMinPrice("")
    setMaxPrice("")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Listing Type Tabs */}
          <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg w-fit">
            {(["SELL", "RENT", "PG"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setListingType(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  listingType === tab
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab === "SELL" ? "Buy" : tab === "RENT" ? "Rent" : "PG"}
              </button>
            ))}
          </div>

          {/* Search Bar & Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by location, project, or builder"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Property Type Filter */}
            <div className="relative">
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="h-10 px-3 pr-8 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Bedrooms Filter */}
            <div className="relative">
              <select
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                className="h-10 px-3 pr-8 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {bedroomOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "Any" ? "Bedrooms" : `${option} BHK`}
                  </option>
                ))}
              </select>
            </div>

            {/* More Filters Button */}
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>

            <Button onClick={fetchProperties}>Search</Button>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Min Price
                  </label>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Max Price
                  </label>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button size="sm" onClick={fetchProperties}>
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Results Header */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{properties.length}</span> properties found
          </p>
          <div className="flex items-center gap-3">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 px-3 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${
                  viewMode === "grid" ? "bg-white shadow-sm" : ""
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${
                  viewMode === "list" ? "bg-white shadow-sm" : ""
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Property Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-xl"></div>
                <div className="p-4 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {properties.map((property) => {
              const images = property.images ? JSON.parse(property.images) : []
              const mainImage = images[0] || "/placeholder-property.jpg"

              if (viewMode === "list") {
                return (
                  <Link
                    key={property.id}
                    href={`/property/${property.id}`}
                    className="bg-white rounded-xl border hover:shadow-lg transition-shadow flex overflow-hidden"
                  >
                    <div className="relative w-64 h-48 flex-shrink-0">
                      <Image
                        src={mainImage}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                      {property.listingTier !== "BASIC" && (
                        <Badge
                          className="absolute top-3 left-3"
                          variant={property.listingTier === "PREMIUM" ? "premium" : "featured"}
                        >
                          {property.listingTier}
                        </Badge>
                      )}
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xl font-bold text-gray-900">
                            {formatPrice(property.price)}
                          </p>
                          <h3 className="font-semibold text-gray-900 mt-1">
                            {property.title}
                          </h3>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                          <Heart className="w-5 h-5 text-gray-400" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-sm mt-2">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {property.locality}, {property.city}
                        </span>
                      </div>
                      <div className="flex gap-6 mt-4 text-sm text-gray-600">
                        {property.bedrooms && (
                          <div className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            <span>{property.bedrooms} Beds</span>
                          </div>
                        )}
                        {property.bathrooms && (
                          <div className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            <span>{property.bathrooms} Baths</span>
                          </div>
                        )}
                        {property.builtUpArea && (
                          <div className="flex items-center gap-1">
                            <Maximize className="w-4 h-4" />
                            <span>{formatArea(property.builtUpArea)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              }

              return (
                <Link
                  key={property.id}
                  href={`/property/${property.id}`}
                  className="bg-white rounded-xl border hover:shadow-lg transition-shadow overflow-hidden group"
                >
                  <div className="relative h-48">
                    <Image
                      src={mainImage}
                      alt={property.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    {property.listingTier !== "BASIC" && (
                      <Badge
                        className="absolute top-3 left-3"
                        variant={property.listingTier === "PREMIUM" ? "premium" : "featured"}
                      >
                        {property.listingTier}
                      </Badge>
                    )}
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white">
                      <Heart className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-xl font-bold text-gray-900">
                      {formatPrice(property.price)}
                    </p>
                    <h3 className="font-semibold text-gray-900 mt-1 line-clamp-1">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">
                        {property.locality}, {property.city}
                      </span>
                    </div>
                    <div className="flex gap-4 mt-3 pt-3 border-t text-sm text-gray-600">
                      {property.bedrooms && (
                        <span className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          {property.bedrooms}
                        </span>
                      )}
                      {property.bathrooms && (
                        <span className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          {property.bathrooms}
                        </span>
                      )}
                      {property.builtUpArea && (
                        <span className="flex items-center gap-1">
                          <Maximize className="w-4 h-4" />
                          {property.builtUpArea}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <SearchContent />
    </Suspense>
  )
}
