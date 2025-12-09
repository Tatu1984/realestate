"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import { FileText, Check, X, Clock, User, Mail, Phone, Calendar, Eye } from "lucide-react"

interface UserRequest {
  id: string
  name: string
  email: string
  phone: string | null
  userType: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  message: string | null
}

export default function UserRequestsPage() {
  const [requests, setRequests] = useState<UserRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL")
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/admin/users/requests")
      if (response.ok) {
        const data = await response.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: string, action: "APPROVED" | "REJECTED") => {
    try {
      const response = await fetch(`/api/admin/users/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      })
      if (response.ok) {
        fetchRequests()
        setSelectedRequest(null)
      }
    } catch (error) {
      console.error("Error updating request:", error)
    }
  }

  const filteredRequests = filter === "ALL"
    ? requests
    : requests.filter((r) => r.status === filter)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
      case "APPROVED":
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium flex items-center gap-1"><Check className="w-3 h-3" /> Approved</span>
      case "REJECTED":
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1"><X className="w-3 h-3" /> Rejected</span>
      default:
        return null
    }
  }

  const getUserTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      BUYER: "bg-blue-100 text-blue-700",
      SELLER: "bg-purple-100 text-purple-700",
      AGENT: "bg-emerald-100 text-emerald-700",
      BUILDER: "bg-orange-100 text-orange-700",
    }
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || "bg-slate-100 text-slate-700"}`}>{type}</span>
  }

  return (
    <AdminLayout title="User Requests" breadcrumbs={[{ name: "Users", href: "/admin/users" }, { name: "Requests" }]}>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Registration Requests</h3>
              <p className="text-sm text-slate-500">{requests.filter(r => r.status === "PENDING").length} pending approvals</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  filter === status
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-500 mt-4">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">No User Requests</h3>
            <p className="text-slate-500">No {filter !== "ALL" ? filter.toLowerCase() : ""} registration requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {request.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{request.name}</p>
                          <p className="text-sm text-slate-500">{request.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getUserTypeBadge(request.userType)}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="flex items-center gap-1 text-slate-600">
                          <Mail className="w-4 h-4" /> {request.email}
                        </p>
                        {request.phone && (
                          <p className="flex items-center gap-1 text-slate-500">
                            <Phone className="w-4 h-4" /> {request.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {request.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleAction(request.id, "APPROVED")}
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAction(request.id, "REJECTED")}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Request Details</h3>
              <button onClick={() => setSelectedRequest(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                  {selectedRequest.name?.charAt(0) || "U"}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-slate-800">{selectedRequest.name}</h4>
                  {getUserTypeBadge(selectedRequest.userType)}
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <p className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-5 h-5 text-slate-400" />
                  {selectedRequest.email}
                </p>
                {selectedRequest.phone && (
                  <p className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-5 h-5 text-slate-400" />
                    {selectedRequest.phone}
                  </p>
                )}
                <p className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  {new Date(selectedRequest.createdAt).toLocaleString()}
                </p>
              </div>
              {selectedRequest.message && (
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm font-medium text-slate-700 mb-2">Message</p>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{selectedRequest.message}</p>
                </div>
              )}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm font-medium text-slate-700 mb-2">Status</p>
                {getStatusBadge(selectedRequest.status)}
              </div>
              {selectedRequest.status === "PENDING" && (
                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={() => handleAction(selectedRequest.id, "APPROVED")}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <Check className="w-5 h-5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(selectedRequest.id, "REJECTED")}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
                  >
                    <X className="w-5 h-5" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
