"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, MapPin, Star, X } from "lucide-react"

interface City {
  id: string
  name: string
  state: string
  isPopular: boolean
  _count?: { localities: number }
}

export default function AdminCitiesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCity, setEditingCity] = useState<City | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    state: "",
    isPopular: false,
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (session?.user?.userType !== "ADMIN") {
      router.push("/admin")
    }
  }, [status, session, router])

  useEffect(() => {
    fetchCities()
  }, [session])

  const fetchCities = async () => {
    if (session?.user?.userType !== "ADMIN") return
    try {
      const response = await fetch("/api/admin/cities")
      if (response.ok) {
        const data = await response.json()
        setCities(data.cities || [])
      }
    } catch (error) {
      console.error("Error fetching cities:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingCity ? "PATCH" : "POST"
      const url = editingCity ? `/api/admin/cities/${editingCity.id}` : "/api/admin/cities"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchCities()
        setShowModal(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error saving city:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this city and all its localities?")) return
    try {
      const response = await fetch(`/api/admin/cities/${id}`, { method: "DELETE" })
      if (response.ok) {
        setCities(cities.filter(c => c.id !== id))
      }
    } catch (error) {
      console.error("Error deleting city:", error)
    }
  }

  const togglePopular = async (id: string, isPopular: boolean) => {
    try {
      const response = await fetch(`/api/admin/cities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPopular: !isPopular }),
      })
      if (response.ok) {
        setCities(cities.map(c => c.id === id ? { ...c, isPopular: !isPopular } : c))
      }
    } catch (error) {
      console.error("Error updating city:", error)
    }
  }

  const openEditModal = (city: City) => {
    setEditingCity(city)
    setFormData({
      name: city.name,
      state: city.state,
      isPopular: city.isPopular,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingCity(null)
    setFormData({ name: "", state: "", isPopular: false })
  }

  if (status === "loading" || loading) {
    return (
      <AdminLayout title="Cities" breadcrumbs={[{ name: "Cities" }]}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Cities" breadcrumbs={[{ name: "Cities" }]}>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{editingCity ? "Edit City" : "Add City"}</h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">City Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mumbai"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Maharashtra"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Mark as Popular</span>
              </label>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowModal(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingCity ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-600">Manage cities and locations</p>
        <Button onClick={() => { resetForm(); setShowModal(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Add City
        </Button>
      </div>

      {/* Cities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cities.map((city) => (
          <div key={city.id} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold">{city.name}</h3>
                  <p className="text-sm text-slate-500">{city.state}</p>
                </div>
              </div>
              <button
                onClick={() => togglePopular(city.id, city.isPopular)}
                className={`p-1 rounded ${city.isPopular ? "text-amber-500" : "text-slate-300"}`}
              >
                <Star className={`w-5 h-5 ${city.isPopular ? "fill-amber-500" : ""}`} />
              </button>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-sm text-slate-500">
                {city._count?.localities || 0} localities
              </span>
              <div className="flex gap-2">
                <button onClick={() => openEditModal(city)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <Edit2 className="w-4 h-4 text-slate-500" />
                </button>
                <button onClick={() => handleDelete(city.id)} className="p-2 hover:bg-red-100 rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {cities.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No cities added yet</p>
            <Button onClick={() => setShowModal(true)} className="mt-4">Add First City</Button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
