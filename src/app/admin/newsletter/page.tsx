"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/button"
import { Search, Trash2, Download, Mail, Users, CheckCircle, XCircle } from "lucide-react"

interface Subscriber {
  id: string
  email: string
  isActive: boolean
  createdAt: string
}

export default function AdminNewsletterPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (session?.user?.userType !== "ADMIN") {
      router.push("/admin")
    }
  }, [status, session, router])

  useEffect(() => {
    fetchSubscribers()
  }, [session])

  const fetchSubscribers = async () => {
    if (session?.user?.userType !== "ADMIN") return
    try {
      const response = await fetch("/api/admin/newsletter")
      if (response.ok) {
        const data = await response.json()
        setSubscribers(data.subscribers || [])
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/newsletter/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (response.ok) {
        setSubscribers(subscribers.map(s => s.id === id ? { ...s, isActive: !isActive } : s))
      }
    } catch (error) {
      console.error("Error updating subscriber:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this subscriber?")) return
    try {
      const response = await fetch(`/api/admin/newsletter/${id}`, { method: "DELETE" })
      if (response.ok) {
        setSubscribers(subscribers.filter(s => s.id !== id))
      }
    } catch (error) {
      console.error("Error deleting subscriber:", error)
    }
  }

  const handleExport = () => {
    const csvContent = [
      ["Email", "Status", "Subscribed Date"].join(","),
      ...subscribers.map(s => [
        s.email,
        s.isActive ? "Active" : "Inactive",
        new Date(s.createdAt).toLocaleDateString()
      ].join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (status === "loading" || loading) {
    return (
      <AdminLayout title="Newsletter Subscribers" breadcrumbs={[{ name: "Newsletter" }]}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Newsletter Subscribers" breadcrumbs={[{ name: "Newsletter" }]}>
      {/* Action Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{subscribers.length}</p>
              <p className="text-sm text-slate-500">Total Subscribers</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{subscribers.filter(s => s.isActive).length}</p>
              <p className="text-sm text-slate-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <div className="flex items-center gap-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold">{subscribers.filter(s => !s.isActive).length}</p>
              <p className="text-sm text-slate-500">Inactive</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subscribers List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="text-left py-4 px-6 font-semibold text-sm">Email</th>
              <th className="text-left py-4 px-6 font-semibold text-sm">Status</th>
              <th className="text-left py-4 px-6 font-semibold text-sm">Subscribed</th>
              <th className="text-right py-4 px-6 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubscribers.map((subscriber) => (
              <tr key={subscriber.id} className="border-b hover:bg-slate-50">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{subscriber.email}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <button
                    onClick={() => toggleStatus(subscriber.id, subscriber.isActive)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      subscriber.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {subscriber.isActive ? "Active" : "Inactive"}
                  </button>
                </td>
                <td className="py-4 px-6 text-sm text-slate-500">
                  {new Date(subscriber.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-6">
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDelete(subscriber.id)}
                      className="p-2 hover:bg-red-100 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredSubscribers.length === 0 && (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No subscribers found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
