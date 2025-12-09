"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import { BadgeCheck, Plus, Trash2, Save, X, Calendar, Search } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  userType: string
}

interface FeaturedSeller {
  id: string
  userId: string
  user: User
  startDate: string
  endDate: string
  isActive: boolean
}

export default function FeaturedSellersPage() {
  const [featured, setFeatured] = useState<FeaturedSeller[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({
    userId: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [featuredRes, usersRes] = await Promise.all([
        fetch("/api/admin/featured?type=SELLER"),
        fetch("/api/admin/users"),
      ])
      if (featuredRes.ok) {
        const data = await featuredRes.json()
        setFeatured(data.featured || [])
      }
      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(data.users?.filter((u: User) => u.userType === "SELLER") || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, featuredType: "SELLER" }),
      })
      if (response.ok) {
        fetchData()
        setShowModal(false)
        setFormData({
          userId: "",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        })
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this seller from featured list?")) return
    try {
      await fetch(`/api/admin/featured/${id}`, { method: "DELETE" })
      fetchData()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      !featured.some((f) => f.userId === u.id) &&
      (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <AdminLayout title="Featured Sellers" breadcrumbs={[{ name: "Featured Members", href: "/admin/featured" }, { name: "Sellers" }]}>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <BadgeCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Featured Sellers</h3>
              <p className="text-sm text-slate-500">{featured.length} featured sellers</p>
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium">
            <Plus className="w-5 h-5" /> Add Featured Seller
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : featured.length === 0 ? (
          <div className="p-12 text-center">
            <BadgeCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">No Featured Sellers</h3>
            <p className="text-slate-500 mb-4">Start featuring sellers to highlight them</p>
            <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" /> Add Featured Seller
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {featured.map((item) => (
              <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {item.user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{item.user?.name}</h4>
                    <p className="text-sm text-slate-500">{item.user?.email}</p>
                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {item.isActive ? "Active" : "Expired"}
                  </span>
                  <button onClick={() => handleRemove(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
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
              <h3 className="text-lg font-semibold text-slate-800">Add Featured Seller</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Search Seller</label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl" />
                </div>
                <select value={formData.userId} onChange={(e) => setFormData({ ...formData, userId: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" required>
                  <option value="">Select a seller</option>
                  {filteredUsers.map((user) => (<option key={user.id} value={user.id}>{user.name} ({user.email})</option>))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                  <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                  <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" required />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50"><X className="w-4 h-4" /> Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl"><Save className="w-4 h-4" /> Add to Featured</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
