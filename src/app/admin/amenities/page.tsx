"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import { Layers, Plus, Edit2, Trash2, Save, X, Wifi, Car, Dumbbell, Trees, Shield, Droplets } from "lucide-react"

interface Amenity {
  id: string
  name: string
  icon: string
  category: string
  isActive: boolean
}

const iconOptions = [
  { value: "wifi", label: "WiFi", Icon: Wifi },
  { value: "parking", label: "Parking", Icon: Car },
  { value: "gym", label: "Gym", Icon: Dumbbell },
  { value: "garden", label: "Garden", Icon: Trees },
  { value: "security", label: "Security", Icon: Shield },
  { value: "pool", label: "Pool", Icon: Droplets },
]

const categories = ["BASIC", "PREMIUM", "LUXURY", "OUTDOOR", "SECURITY", "ENTERTAINMENT"]

export default function AmenitiesPage() {
  const [amenities, setAmenities] = useState<Amenity[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    icon: "wifi",
    category: "BASIC",
    isActive: true,
  })

  useEffect(() => {
    fetchAmenities()
  }, [])

  const fetchAmenities = async () => {
    try {
      const response = await fetch("/api/admin/amenities")
      if (response.ok) {
        const data = await response.json()
        setAmenities(data.amenities || [])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingAmenity ? `/api/admin/amenities/${editingAmenity.id}` : "/api/admin/amenities"
      const method = editingAmenity ? "PATCH" : "POST"
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        fetchAmenities()
        closeModal()
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this amenity?")) return
    try {
      await fetch(`/api/admin/amenities/${id}`, { method: "DELETE" })
      fetchAmenities()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const openModal = (amenity?: Amenity) => {
    if (amenity) {
      setEditingAmenity(amenity)
      setFormData({
        name: amenity.name,
        icon: amenity.icon,
        category: amenity.category,
        isActive: amenity.isActive,
      })
    } else {
      setEditingAmenity(null)
      setFormData({ name: "", icon: "wifi", category: "BASIC", isActive: true })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingAmenity(null)
  }

  const getIcon = (iconName: string) => {
    const found = iconOptions.find((i) => i.value === iconName)
    return found ? found.Icon : Layers
  }

  return (
    <AdminLayout title="Amenities" breadcrumbs={[{ name: "Featured Projects", href: "/admin/projects" }, { name: "Amenities" }]}>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Property Amenities</h3>
              <p className="text-sm text-slate-500">{amenities.length} amenities</p>
            </div>
          </div>
          <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium">
            <Plus className="w-5 h-5" /> Add Amenity
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : amenities.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">No Amenities Yet</h3>
            <p className="text-slate-500 mb-4">Add amenities for properties</p>
            <button onClick={() => openModal()} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
              <Plus className="w-4 h-4" /> Add Amenity
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6">
            {amenities.map((amenity) => {
              const IconComponent = getIcon(amenity.icon)
              return (
                <div key={amenity.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-blue-200 transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(amenity)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(amenity.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-1">{amenity.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{amenity.category}</span>
                    <span className={`w-2 h-2 rounded-full ${amenity.isActive ? "bg-emerald-500" : "bg-slate-300"}`}></span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">{editingAmenity ? "Edit Amenity" : "Add New Amenity"}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Swimming Pool" className="w-full px-4 py-3 border border-slate-200 rounded-xl" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {iconOptions.map((option) => (
                    <button key={option.value} type="button" onClick={() => setFormData({ ...formData, icon: option.value })}
                      className={`p-3 rounded-xl border-2 transition-all ${formData.icon === option.value ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}>
                      <option.Icon className={`w-6 h-6 mx-auto ${formData.icon === option.value ? "text-blue-600" : "text-slate-400"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl">
                  {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 rounded" />
                <span className="text-sm font-medium text-slate-700">Active</span>
              </label>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl"><X className="w-4 h-4" /> Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl"><Save className="w-4 h-4" /> {editingAmenity ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
