"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import { MessageSquare, Eye, Trash2, X, User, Building2, Calendar, Phone, Mail } from "lucide-react"

interface ProjectResponse {
  id: string
  projectId: string
  projectName: string
  userName: string
  userEmail: string
  userPhone: string
  message: string
  status: string
  createdAt: string
}

export default function ProjectResponsesPage() {
  const [responses, setResponses] = useState<ProjectResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResponse, setSelectedResponse] = useState<ProjectResponse | null>(null)
  const [filter, setFilter] = useState("ALL")

  useEffect(() => {
    fetchResponses()
  }, [])

  const fetchResponses = async () => {
    try {
      const response = await fetch("/api/admin/projects/responses")
      if (response.ok) {
        const data = await response.json()
        setResponses(data.responses || [])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/projects/responses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      fetchResponses()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this response?")) return
    try {
      await fetch(`/api/admin/projects/responses/${id}`, { method: "DELETE" })
      fetchResponses()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const filteredResponses = filter === "ALL" ? responses : responses.filter((r) => r.status === filter)

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      NEW: "bg-blue-100 text-blue-700",
      CONTACTED: "bg-amber-100 text-amber-700",
      CONVERTED: "bg-emerald-100 text-emerald-700",
      CLOSED: "bg-slate-100 text-slate-500",
    }
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-slate-100 text-slate-600"}`}>{status}</span>
  }

  return (
    <AdminLayout title="Project Responses" breadcrumbs={[{ name: "Projects", href: "/admin/projects" }, { name: "Responses" }]}>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Project Enquiries</h3>
              <p className="text-sm text-slate-500">{responses.length} responses</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {["ALL", "NEW", "CONTACTED", "CONVERTED", "CLOSED"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  filter === status ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : filteredResponses.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">No Responses</h3>
            <p className="text-slate-500">No project enquiries found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredResponses.map((response) => (
              <div key={response.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {response.userName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-800">{response.userName}</h4>
                        {getStatusBadge(response.status)}
                      </div>
                      <p className="text-sm text-slate-500 flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4" />
                        {response.projectName}
                      </p>
                      <p className="text-sm text-slate-600 line-clamp-2">{response.message}</p>
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(response.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedResponse(response)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(response.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedResponse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">Response Details</h3>
              <button onClick={() => setSelectedResponse(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                  {selectedResponse.userName?.charAt(0) || "U"}
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-slate-800">{selectedResponse.userName}</h4>
                  <p className="text-slate-500">{selectedResponse.projectName}</p>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <p className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-5 h-5 text-slate-400" />
                  {selectedResponse.userEmail}
                </p>
                <p className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-5 h-5 text-slate-400" />
                  {selectedResponse.userPhone}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 uppercase mb-2">Message</p>
                <p className="text-slate-600 bg-slate-50 p-3 rounded-lg">{selectedResponse.message}</p>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 uppercase mb-2">Update Status</p>
                <div className="flex flex-wrap items-center gap-2">
                  {["NEW", "CONTACTED", "CONVERTED", "CLOSED"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        handleStatusChange(selectedResponse.id, status)
                        setSelectedResponse({ ...selectedResponse, status })
                      }}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        selectedResponse.status === status
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {status}
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
