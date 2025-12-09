"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import { Image as ImageIcon, Plus, Edit2, Trash2, Save, X, MoveUp, MoveDown } from "lucide-react"

interface Banner {
  id: string
  title: string
  subtitle: string | null
  imageUrl: string
  linkUrl: string | null
  position: string
  order: number
  isActive: boolean
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
    position: "HOMEPAGE_HERO",
    isActive: true,
  })

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const response = await fetch("/api/admin/banners")
      if (response.ok) {
        const data = await response.json()
        setBanners(data.banners || [])
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
      const url = editingBanner ? `/api/admin/banners/${editingBanner.id}` : "/api/admin/banners"
      const method = editingBanner ? "PATCH" : "POST"
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        fetchBanners()
        closeModal()
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return
    try {
      await fetch(`/api/admin/banners/${id}`, { method: "DELETE" })
      fetchBanners()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const openModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner)
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle || "",
        imageUrl: banner.imageUrl,
        linkUrl: banner.linkUrl || "",
        position: banner.position,
        isActive: banner.isActive,
      })
    } else {
      setEditingBanner(null)
      setFormData({ title: "", subtitle: "", imageUrl: "", linkUrl: "", position: "HOMEPAGE_HERO", isActive: true })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingBanner(null)
  }

  return (
    <AdminLayout title="Banner Management" breadcrumbs={[{ name: "Advertising" }, { name: "Banners" }]}>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Banner Ads</h3>
              <p className="text-sm text-slate-500">{banners.length} banners</p>
            </div>
          </div>
          <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium">
            <Plus className="w-5 h-5" /> Add Banner
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center">
            <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">No Banners Yet</h3>
            <p className="text-slate-500 mb-4">Add banners to display on your site</p>
            <button onClick={() => openModal()} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
              <Plus className="w-4 h-4" /> Add Banner
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
            {banners.map((banner) => (
              <div key={banner.id} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100 hover:border-blue-200 transition-all">
                <div className="aspect-[16/6] bg-slate-200 relative">
                  {banner.imageUrl ? (
                    <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${banner.isActive ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"}`}>
                      {banner.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-800">{banner.title}</h4>
                      {banner.subtitle && <p className="text-sm text-slate-500">{banner.subtitle}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openModal(banner)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(banner.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">{banner.position}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">{editingBanner ? "Edit Banner" : "Add New Banner"}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subtitle</label>
                <input type="text" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Image URL *</label>
                <input type="url" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://example.com/banner.jpg" className="w-full px-4 py-3 border border-slate-200 rounded-xl" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Link URL</label>
                <input type="url" value={formData.linkUrl} onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Position</label>
                <select value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl">
                  <option value="HOMEPAGE_HERO">Homepage Hero</option>
                  <option value="HOMEPAGE_MIDDLE">Homepage Middle</option>
                  <option value="LISTING_TOP">Listing Top</option>
                  <option value="SIDEBAR">Sidebar</option>
                  <option value="FOOTER">Footer</option>
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 rounded" />
                <span className="text-sm font-medium text-slate-700">Active</span>
              </label>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl"><X className="w-4 h-4" /> Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl"><Save className="w-4 h-4" /> {editingBanner ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
