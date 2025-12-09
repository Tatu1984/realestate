"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import { MonitorPlay, Plus, Edit2, Trash2, Save, X, Eye, Calendar } from "lucide-react"

interface Ad {
  id: string
  title: string
  type: string
  placement: string
  imageUrl: string
  linkUrl: string
  startDate: string
  endDate: string
  isActive: boolean
  clicks: number
  impressions: number
}

export default function AdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAd, setEditingAd] = useState<Ad | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    type: "BANNER",
    placement: "HOMEPAGE",
    imageUrl: "",
    linkUrl: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    isActive: true,
  })

  useEffect(() => {
    fetchAds()
  }, [])

  const fetchAds = async () => {
    try {
      const response = await fetch("/api/admin/ads")
      if (response.ok) {
        const data = await response.json()
        setAds(data.ads || [])
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
      const url = editingAd ? `/api/admin/ads/${editingAd.id}` : "/api/admin/ads"
      const method = editingAd ? "PATCH" : "POST"
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        fetchAds()
        closeModal()
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this ad?")) return
    try {
      await fetch(`/api/admin/ads/${id}`, { method: "DELETE" })
      fetchAds()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const openModal = (ad?: Ad) => {
    if (ad) {
      setEditingAd(ad)
      setFormData({
        title: ad.title,
        type: ad.type,
        placement: ad.placement,
        imageUrl: ad.imageUrl,
        linkUrl: ad.linkUrl,
        startDate: ad.startDate.split("T")[0],
        endDate: ad.endDate.split("T")[0],
        isActive: ad.isActive,
      })
    } else {
      setEditingAd(null)
      setFormData({
        title: "",
        type: "BANNER",
        placement: "HOMEPAGE",
        imageUrl: "",
        linkUrl: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        isActive: true,
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingAd(null)
  }

  return (
    <AdminLayout title="Advertisement Management" breadcrumbs={[{ name: "Advertising" }, { name: "Ads" }]}>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <MonitorPlay className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Ad Campaigns</h3>
              <p className="text-sm text-slate-500">{ads.length} advertisements</p>
            </div>
          </div>
          <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium">
            <Plus className="w-5 h-5" /> Create Ad
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : ads.length === 0 ? (
          <div className="p-12 text-center">
            <MonitorPlay className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">No Ads Yet</h3>
            <p className="text-slate-500 mb-4">Create your first advertisement</p>
            <button onClick={() => openModal()} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
              <Plus className="w-4 h-4" /> Create Ad
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Ad</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Type</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Placement</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Period</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Stats</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-10 bg-slate-100 rounded-lg overflow-hidden">
                          {ad.imageUrl ? <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" /> : <MonitorPlay className="w-6 h-6 text-slate-400 m-auto mt-2" />}
                        </div>
                        <span className="font-medium text-slate-800">{ad.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-sm">{ad.type}</span></td>
                    <td className="px-6 py-4 text-slate-600">{ad.placement}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(ad.startDate).toLocaleDateString()} - {new Date(ad.endDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-slate-600">{ad.impressions || 0} views</p>
                        <p className="text-slate-400">{ad.clicks || 0} clicks</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${ad.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {ad.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {ad.linkUrl && <a href={ad.linkUrl} target="_blank" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></a>}
                        <button onClick={() => openModal(ad)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(ad.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">{editingAd ? "Edit Ad" : "Create New Ad"}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl">
                    <option value="BANNER">Banner</option>
                    <option value="SIDEBAR">Sidebar</option>
                    <option value="POPUP">Popup</option>
                    <option value="NATIVE">Native</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Placement</label>
                  <select value={formData.placement} onChange={(e) => setFormData({ ...formData, placement: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl">
                    <option value="HOMEPAGE">Homepage</option>
                    <option value="LISTING">Listing Page</option>
                    <option value="DETAIL">Property Detail</option>
                    <option value="SEARCH">Search Results</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Image URL *</label>
                <input type="url" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Link URL</label>
                <input type="url" value={formData.linkUrl} onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                  <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                  <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-5 h-5 rounded" />
                <span className="text-sm font-medium text-slate-700">Active</span>
              </label>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl"><X className="w-4 h-4" /> Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl"><Save className="w-4 h-4" /> {editingAd ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
