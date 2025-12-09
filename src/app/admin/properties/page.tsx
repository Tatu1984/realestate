"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import AdminLayout from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Filter,
  Download,
  Home,
  MapPin,
  IndianRupee,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  TrendingUp,
  Building2,
  Bed,
  Bath,
  Square,
  X,
} from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface Property {
  id: string
  title: string
  propertyType: string
  listingType: string
  city: string
  locality: string
  price: number
  bedrooms: number | null
  bathrooms: number | null
  builtUpArea: number | null
  status: string
  listingTier: string
  views: number
  images: string | null
  createdAt: string
  user: {
    name: string
    email: string
  }
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ACTIVE: "bg-green-100 text-green-700",
  SOLD: "bg-blue-100 text-blue-700",
  EXPIRED: "bg-red-100 text-red-700",
}

const tierColors: Record<string, string> = {
  BASIC: "bg-slate-100 text-slate-700",
  FEATURED: "bg-purple-100 text-purple-700",
  PREMIUM: "bg-amber-100 text-amber-700",
}

export default function AdminPropertiesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [filterType, setFilterType] = useState("ALL")
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (session?.user?.userType !== "ADMIN") {
      router.push("/admin")
    }
  }, [status, session, router])

  useEffect(() => {
    fetchProperties()
  }, [session])

  const fetchProperties = async () => {
    if (session?.user?.userType !== "ADMIN") return
    try {
      const response = await fetch("/api/admin/properties")
      if (response.ok) {
        const data = await response.json()
        setProperties(data.properties || [])
      }
    } catch (error) {
      console.error("Error fetching properties:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedProperty) return
    try {
      const response = await fetch(`/api/admin/properties/${selectedProperty.id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setProperties(properties.filter(p => p.id !== selectedProperty.id))
        setShowDeleteModal(false)
        setSelectedProperty(null)
      }
    } catch (error) {
      console.error("Error deleting property:", error)
    }
  }

  const handleExport = () => {
    const csvContent = [
      ["ID", "Title", "Type", "Listing", "City", "Price", "Status", "Views", "Created"].join(","),
      ...filteredProperties.map(p => [
        p.id,
        `"${p.title}"`,
        p.propertyType,
        p.listingType,
        p.city,
        p.price,
        p.status,
        p.views,
        new Date(p.createdAt).toLocaleDateString()
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `properties-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "ALL" || property.status === filterStatus
    const matchesType = filterType === "ALL" || property.listingType === filterType
    return matchesSearch && matchesStatus && matchesType
  })

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/properties/${id}/approve`, {
        method: "POST",
      })
      if (response.ok) {
        setProperties((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: "ACTIVE" } : p))
        )
      }
    } catch (error) {
      console.error("Error approving property:", error)
    }
  }

  if (status === "loading" || loading) {
    return (
      <AdminLayout title="Manage Listings" breadcrumbs={[{ name: "Listings" }]}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    )
  }

  if (session?.user?.userType !== "ADMIN") {
    return null
  }

  return (
    <AdminLayout title="Manage Listings" breadcrumbs={[{ name: "Listings" }]}>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProperty && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-2">Delete Property</h3>
            <p className="text-slate-600 mb-4">
              Are you sure you want to delete <strong>{selectedProperty.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {/* Filter Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="SOLD">Sold</option>
              <option value="EXPIRED">Expired</option>
            </select>
            {/* Filter Type */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Types</option>
              <option value="SELL">For Sale</option>
              <option value="RENT">For Rent</option>
              <option value="PG">PG</option>
            </select>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Link href="/admin/properties/add">
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Plus className="w-4 h-4" />
                Add Listing
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{properties.length}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {properties.filter((p) => p.status === "PENDING").length}
              </p>
              <p className="text-xs text-slate-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {properties.filter((p) => p.status === "ACTIVE").length}
              </p>
              <p className="text-xs text-slate-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {properties.filter((p) => p.listingTier === "FEATURED").length}
              </p>
              <p className="text-xs text-slate-500">Featured</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">
                {properties.filter((p) => p.listingTier === "PREMIUM").length}
              </p>
              <p className="text-xs text-slate-500">Premium</p>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((property) => {
            const images = property.images ? JSON.parse(property.images) : []
            return (
              <div
                key={property.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48">
                  {images[0] ? (
                    <Image
                      src={images[0]}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <Home className="w-12 h-12 text-slate-300" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[property.status]}`}>
                      {property.status}
                    </span>
                    {property.listingTier !== "BASIC" && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${tierColors[property.listingTier]}`}>
                        {property.listingTier}
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                    <Eye className="w-3 h-3" />
                    {property.views}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-slate-800 line-clamp-1">{property.title}</h3>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {property.listingType}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1 text-slate-500 text-sm mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{property.locality}, {property.city}</span>
                  </div>

                  <p className="text-xl font-bold text-blue-600 mb-3">
                    {formatPrice(property.price)}
                    {property.listingType === "RENT" && <span className="text-sm font-normal">/mo</span>}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                    {property.bedrooms && (
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4 text-slate-400" />
                        <span>{property.bedrooms}</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4 text-slate-400" />
                        <span>{property.bathrooms}</span>
                      </div>
                    )}
                    {property.builtUpArea && (
                      <div className="flex items-center gap-1">
                        <Square className="w-4 h-4 text-slate-400" />
                        <span>{property.builtUpArea} sq.ft</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{property.user.name}</span>
                        <br />
                        {new Date(property.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        {property.status === "PENDING" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(property.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        <Link href={`/property/${property.id}`} target="_blank">
                          <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <Link href={`/admin/properties/${property.id}/edit`}>
                          <button className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => { setSelectedProperty(property); setShowDeleteModal(true); }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl">
            <Home className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="font-medium text-lg mb-1">No properties found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
