"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import { AlertTriangle, Plus, Edit2, Trash2, Save, X, Bell, Info, AlertCircle, CheckCircle } from "lucide-react"

interface Alert {
  id: string
  title: string
  message: string
  type: string
  placement: string
  startDate: string
  endDate: string
  isActive: boolean
}

const alertTypes = [
  { value: "INFO", label: "Info", icon: Info, color: "bg-blue-100 text-blue-700" },
  { value: "WARNING", label: "Warning", icon: AlertTriangle, color: "bg-amber-100 text-amber-700" },
  { value: "ERROR", label: "Error", icon: AlertCircle, color: "bg-red-100 text-red-700" },
  { value: "SUCCESS", label: "Success", icon: CheckCircle, color: "bg-emerald-100 text-emerald-700" },
]

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "INFO",
    placement: "TOP_BANNER",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    isActive: true,
  })

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/admin/alerts")
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts || [])
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
      const url = editingAlert ? `/api/admin/alerts/${editingAlert.id}` : "/api/admin/alerts"
      const method = editingAlert ? "PATCH" : "POST"
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        fetchAlerts()
        closeModal()
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this alert?")) return
    try {
      await fetch(`/api/admin/alerts/${id}`, { method: "DELETE" })
      fetchAlerts()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })
      fetchAlerts()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const openModal = (alert?: Alert) => {
    if (alert) {
      setEditingAlert(alert)
      setFormData({
        title: alert.title,
        message: alert.message,
        type: alert.type,
        placement: alert.placement,
        startDate: alert.startDate.split("T")[0],
        endDate: alert.endDate.split("T")[0],
        isActive: alert.isActive,
      })
    } else {
      setEditingAlert(null)
      setFormData({
        title: "",
        message: "",
        type: "INFO",
        placement: "TOP_BANNER",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        isActive: true,
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingAlert(null)
  }

  const getAlertType = (type: string) => alertTypes.find((t) => t.value === type) || alertTypes[0]

  return (
    <AdminLayout title="Alert Management" breadcrumbs={[{ name: "Notifications" }, { name: "Alerts" }]}>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Site Alerts</h3>
              <p className="text-sm text-slate-500">{alerts.filter(a => a.isActive).length} active alerts</p>
            </div>
          </div>
          <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium">
            <Plus className="w-5 h-5" /> Create Alert
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">No Alerts</h3>
            <p className="text-slate-500 mb-4">Create alerts to notify users</p>
            <button onClick={() => openModal()} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
              <Plus className="w-4 h-4" /> Create Alert
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {alerts.map((alert) => {
              const alertType = getAlertType(alert.type)
              const Icon = alertType.icon
              return (
                <div key={alert.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alertType.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-800">{alert.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${alertType.color}`}>{alert.type}</span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{alert.message}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>Placement: {alert.placement.replace("_", " ")}</span>
                          <span>{new Date(alert.startDate).toLocaleDateString()} - {new Date(alert.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(alert.id, alert.isActive)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          alert.isActive
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {alert.isActive ? "Active" : "Inactive"}
                      </button>
                      <button onClick={() => openModal(alert)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(alert.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">{editingAlert ? "Edit Alert" : "Create Alert"}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message *</label>
                <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={3} className="w-full px-4 py-3 border border-slate-200 rounded-xl" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl">
                    {alertTypes.map((type) => (<option key={type.value} value={type.value}>{type.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Placement</label>
                  <select value={formData.placement} onChange={(e) => setFormData({ ...formData, placement: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl">
                    <option value="TOP_BANNER">Top Banner</option>
                    <option value="POPUP">Popup</option>
                    <option value="SIDEBAR">Sidebar</option>
                    <option value="FOOTER">Footer</option>
                  </select>
                </div>
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
                <button type="submit" className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl"><Save className="w-4 h-4" /> {editingAlert ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
