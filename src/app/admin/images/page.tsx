"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import { Image as ImageIcon, Plus, Edit2, Trash2, Save, X, Upload } from "lucide-react"

interface DefaultImage {
  id: string
  name: string
  type: string
  url: string
  description: string | null
}

const imageTypes = [
  "PROPERTY_DEFAULT",
  "USER_AVATAR",
  "PROJECT_DEFAULT",
  "BANNER_DEFAULT",
  "LOGO",
  "FAVICON",
  "OG_IMAGE",
]

export default function DefaultImagesPage() {
  const [images, setImages] = useState<DefaultImage[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingImage, setEditingImage] = useState<DefaultImage | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    type: "PROPERTY_DEFAULT",
    url: "",
    description: "",
  })

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      const response = await fetch("/api/admin/images")
      if (response.ok) {
        const data = await response.json()
        setImages(data.images || [])
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
      const url = editingImage ? `/api/admin/images/${editingImage.id}` : "/api/admin/images"
      const method = editingImage ? "PATCH" : "POST"
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        fetchImages()
        closeModal()
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this image?")) return
    try {
      await fetch(`/api/admin/images/${id}`, { method: "DELETE" })
      fetchImages()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const openModal = (image?: DefaultImage) => {
    if (image) {
      setEditingImage(image)
      setFormData({
        name: image.name,
        type: image.type,
        url: image.url,
        description: image.description || "",
      })
    } else {
      setEditingImage(null)
      setFormData({ name: "", type: "PROPERTY_DEFAULT", url: "", description: "" })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingImage(null)
  }

  return (
    <AdminLayout title="Default Images" breadcrumbs={[{ name: "CMS Management" }, { name: "Default Images" }]}>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Default Images</h3>
              <p className="text-sm text-slate-500">Fallback images for the site</p>
            </div>
          </div>
          <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium">
            <Plus className="w-5 h-5" /> Add Image
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : images.length === 0 ? (
          <div className="p-12 text-center">
            <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">No Default Images</h3>
            <p className="text-slate-500 mb-4">Add default/fallback images for your site</p>
            <button onClick={() => openModal()} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
              <Plus className="w-4 h-4" /> Add Image
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {images.map((image) => (
              <div key={image.id} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100 group">
                <div className="aspect-video bg-slate-200 relative">
                  <img src={image.url} alt={image.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => openModal(image)} className="p-2 bg-white rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-600">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(image.id)} className="p-2 bg-white rounded-lg text-slate-700 hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-slate-800 mb-1">{image.name}</h4>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{image.type}</span>
                  {image.description && <p className="text-sm text-slate-500 mt-2">{image.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">{editingImage ? "Edit Image" : "Add Default Image"}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Default Property Image" className="w-full px-4 py-3 border border-slate-200 rounded-xl" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl">
                  {imageTypes.map((type) => (<option key={type} value={type}>{type.replace(/_/g, " ")}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Image URL *</label>
                <input type="url" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} placeholder="https://example.com/image.jpg" className="w-full px-4 py-3 border border-slate-200 rounded-xl" required />
              </div>
              {formData.url && (
                <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden">
                  <img src={formData.url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} className="w-full px-4 py-3 border border-slate-200 rounded-xl" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl"><X className="w-4 h-4" /> Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl"><Save className="w-4 h-4" /> {editingImage ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
