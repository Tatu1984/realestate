"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import { ClipboardList, Eye, Trash2, X, MapPin, IndianRupee, Calendar, User, Building2, Check } from "lucide-react"

interface Requirement {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  propertyType: string
  transactionType: string
  budget: string
  location: string
  description: string
  bedrooms: number | null
  status: string
  createdAt: string
}

export default function RequirementsPage() {
  const [requirements, setRequirements] = useState<Requirement[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL")
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null)

  useEffect(() => {
    fetchRequirements()
  }, [])

  const fetchRequirements = async () => {
    try {
      const response = await fetch("/api/admin/requirements")
      if (response.ok) {
        const data = await response.json()
        setRequirements(data.requirements || [])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/requirements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (response.ok) {
        fetchRequirements()
        setSelectedReq(null)
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this requirement?")) return
    try {
      await fetch(`/api/admin/requirements/${id}`, { method: "DELETE" })
      fetchRequirements()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const filteredRequirements = filter === "ALL"
    ? requirements
    : requirements.filter((r) => r.status === filter)

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      NEW: "bg-blue-100 text-blue-700",
      IN_PROGRESS: "bg-amber-100 text-amber-700",
      FULFILLED: "bg-emerald-100 text-emerald-700",
      CLOSED: "bg-slate-100 text-slate-500",
    }
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-slate-100 text-slate-600"}`}>{status.replace("_", " ")}</span>
  }

  return (
    <AdminLayout title="Property Requirements" breadcrumbs={[{ name: "Requirements" }]}>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Buyer Requirements</h3>
              <p className="text-sm text-slate-500">{requirements.length} total requirements</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {["ALL", "NEW", "IN_PROGRESS", "FULFILLED", "CLOSED"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  filter === status ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : filteredRequirements.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">No Requirements Found</h3>
            <p className="text-slate-500">No property requirements match your filter</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRequirements.map((req) => (
              <div key={req.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {req.userName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-800">{req.userName}</h4>
                        {getStatusBadge(req.status)}
                      </div>
                      <p className="text-sm text-slate-500 mb-2">{req.userEmail} | {req.userPhone}</p>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="flex items-center gap-1 text-slate-600">
                          <Building2 className="w-4 h-4" />
                          {req.propertyType} - {req.transactionType}
                        </span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <IndianRupee className="w-4 h-4" />
                          {req.budget}
                        </span>
                        <span className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-4 h-4" />
                          {req.location}
                        </span>
                        {req.bedrooms && (
                          <span className="text-slate-600">{req.bedrooms} BHK</span>
                        )}
                      </div>
                      {req.description && (
                        <p className="text-sm text-slate-500 mt-2 line-clamp-2">{req.description}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedReq(req)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(req.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Requirement Details</h3>
              <button onClick={() => setSelectedReq(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                  {selectedReq.userName?.charAt(0) || "U"}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-slate-800">{selectedReq.userName}</h4>
                  <p className="text-slate-500">{selectedReq.userEmail}</p>
                  <p className="text-slate-500">{selectedReq.userPhone}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-500 uppercase mb-1">Property Type</p>
                  <p className="font-medium text-slate-800">{selectedReq.propertyType}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase mb-1">Transaction</p>
                  <p className="font-medium text-slate-800">{selectedReq.transactionType}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase mb-1">Budget</p>
                  <p className="font-medium text-slate-800">{selectedReq.budget}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase mb-1">Location</p>
                  <p className="font-medium text-slate-800">{selectedReq.location}</p>
                </div>
                {selectedReq.bedrooms && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase mb-1">Bedrooms</p>
                    <p className="font-medium text-slate-800">{selectedReq.bedrooms} BHK</p>
                  </div>
                )}
              </div>
              {selectedReq.description && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 uppercase mb-1">Description</p>
                  <p className="text-slate-600">{selectedReq.description}</p>
                </div>
              )}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 uppercase mb-2">Update Status</p>
                <div className="flex items-center gap-2">
                  {["NEW", "IN_PROGRESS", "FULFILLED", "CLOSED"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(selectedReq.id, status)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        selectedReq.status === status
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {status.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
