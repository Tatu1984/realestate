"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/button"
import { Search, Eye, Trash2, Mail, Phone, Calendar, MessageSquare, X, CheckCircle } from "lucide-react"

interface Inquiry {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  status: string
  createdAt: string
  property: {
    title: string
  } | null
}

export default function AdminEnquiriesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (session?.user?.userType !== "ADMIN") {
      router.push("/admin")
    }
  }, [status, session, router])

  useEffect(() => {
    fetchInquiries()
  }, [session])

  const fetchInquiries = async () => {
    if (session?.user?.userType !== "ADMIN") return
    try {
      const response = await fetch("/api/admin/enquiries")
      if (response.ok) {
        const data = await response.json()
        setInquiries(data.inquiries || [])
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        setInquiries(inquiries.map(i => i.id === id ? { ...i, status: newStatus } : i))
      }
    } catch (error) {
      console.error("Error updating inquiry:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return
    try {
      const response = await fetch(`/api/admin/enquiries/${id}`, { method: "DELETE" })
      if (response.ok) {
        setInquiries(inquiries.filter(i => i.id !== id))
        if (selectedInquiry?.id === id) {
          setShowModal(false)
          setSelectedInquiry(null)
        }
      }
    } catch (error) {
      console.error("Error deleting inquiry:", error)
    }
  }

  const filteredInquiries = inquiries.filter((inquiry) => {
    const matchesSearch =
      inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "ALL" || inquiry.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    RESPONDED: "bg-blue-100 text-blue-700",
    CLOSED: "bg-green-100 text-green-700",
  }

  if (status === "loading" || loading) {
    return (
      <AdminLayout title="Enquiries" breadcrumbs={[{ name: "Enquiries" }]}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Enquiries" breadcrumbs={[{ name: "Enquiries" }]}>
      {/* View Modal */}
      {showModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold">Enquiry Details</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">From</p>
                <p className="font-medium">{selectedInquiry.name}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium">{selectedInquiry.email}</p>
                </div>
                {selectedInquiry.phone && (
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-medium">{selectedInquiry.phone}</p>
                  </div>
                )}
              </div>
              {selectedInquiry.property && (
                <div>
                  <p className="text-sm text-slate-500">Property</p>
                  <p className="font-medium">{selectedInquiry.property.title}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-slate-500">Message</p>
                <p className="bg-slate-50 p-3 rounded-lg">{selectedInquiry.message}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-2">Status</p>
                <div className="flex gap-2">
                  {["PENDING", "RESPONDED", "CLOSED"].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selectedInquiry.id, s)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedInquiry.status === s ? statusColors[s] : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                Close
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleDelete(selectedInquiry.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="RESPONDED">Responded</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-2xl font-bold">{inquiries.length}</p>
          <p className="text-sm text-slate-500">Total</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-2xl font-bold text-amber-600">{inquiries.filter(i => i.status === "PENDING").length}</p>
          <p className="text-sm text-slate-500">Pending</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-2xl font-bold text-blue-600">{inquiries.filter(i => i.status === "RESPONDED").length}</p>
          <p className="text-sm text-slate-500">Responded</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-2xl font-bold text-green-600">{inquiries.filter(i => i.status === "CLOSED").length}</p>
          <p className="text-sm text-slate-500">Closed</p>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="text-left py-4 px-6 font-semibold text-sm">From</th>
              <th className="text-left py-4 px-6 font-semibold text-sm">Property</th>
              <th className="text-left py-4 px-6 font-semibold text-sm">Message</th>
              <th className="text-left py-4 px-6 font-semibold text-sm">Status</th>
              <th className="text-left py-4 px-6 font-semibold text-sm">Date</th>
              <th className="text-right py-4 px-6 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInquiries.map((inquiry) => (
              <tr key={inquiry.id} className="border-b hover:bg-slate-50">
                <td className="py-4 px-6">
                  <p className="font-medium">{inquiry.name}</p>
                  <p className="text-sm text-slate-500">{inquiry.email}</p>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm">{inquiry.property?.title || "General Inquiry"}</p>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm text-slate-600 truncate max-w-xs">{inquiry.message}</p>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[inquiry.status]}`}>
                    {inquiry.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <p className="text-sm text-slate-500">{new Date(inquiry.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="py-4 px-6">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => { setSelectedInquiry(inquiry); setShowModal(true); }}
                      className="p-2 hover:bg-blue-100 rounded-lg"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(inquiry.id)}
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

        {filteredInquiries.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No enquiries found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
