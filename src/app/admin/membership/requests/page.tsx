"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import { ArrowUpRight, Check, X, Clock, User, CreditCard, Calendar } from "lucide-react"

interface UpgradeRequest {
  id: string
  userId: string
  userName: string
  userEmail: string
  currentPlan: string
  requestedPlan: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  note: string | null
}

export default function UpgradeRequestsPage() {
  const [requests, setRequests] = useState<UpgradeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL")

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/admin/membership/requests")
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
      const response = await fetch(`/api/admin/membership/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      })
      if (response.ok) {
        fetchRequests()
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

  return (
    <AdminLayout title="Upgrade Requests" breadcrumbs={[{ name: "Membership", href: "/admin/membership" }, { name: "Upgrade Requests" }]}>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Membership Upgrade Requests</h3>
              <p className="text-sm text-slate-500">{requests.filter(r => r.status === "PENDING").length} pending requests</p>
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
            <ArrowUpRight className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">No Upgrade Requests</h3>
            <p className="text-slate-500">No {filter !== "ALL" ? filter.toLowerCase() : ""} upgrade requests found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRequests.map((request) => (
              <div key={request.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {request.userName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-800">{request.userName || "Unknown User"}</h4>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {request.userEmail}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-slate-500">
                          <CreditCard className="w-4 h-4" />
                          {request.currentPlan} <span className="mx-1">→</span> <span className="text-blue-600 font-medium">{request.requestedPlan}</span>
                        </span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {request.note && (
                        <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded-lg">
                          Note: {request.note}
                        </p>
                      )}
                    </div>
                  </div>

                  {request.status === "PENDING" && (
                    <div className="flex items-center gap-2 ml-16 lg:ml-0">
                      <button
                        onClick={() => handleAction(request.id, "APPROVED")}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(request.id, "REJECTED")}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
