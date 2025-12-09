"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import { Bell, Plus, Edit2, Trash2, Save, X, Calendar, Clock, Check } from "lucide-react"

interface Reminder {
  id: string
  title: string
  description: string
  dueDate: string
  priority: string
  status: string
  createdAt: string
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
    priority: "MEDIUM",
  })

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      const response = await fetch("/api/admin/reminders")
      if (response.ok) {
        const data = await response.json()
        setReminders(data.reminders || [])
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
      const url = editingReminder ? `/api/admin/reminders/${editingReminder.id}` : "/api/admin/reminders"
      const method = editingReminder ? "PATCH" : "POST"
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        fetchReminders()
        closeModal()
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleComplete = async (id: string) => {
    try {
      await fetch(`/api/admin/reminders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      })
      fetchReminders()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this reminder?")) return
    try {
      await fetch(`/api/admin/reminders/${id}`, { method: "DELETE" })
      fetchReminders()
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const openModal = (reminder?: Reminder) => {
    if (reminder) {
      setEditingReminder(reminder)
      setFormData({
        title: reminder.title,
        description: reminder.description,
        dueDate: reminder.dueDate.split("T")[0],
        priority: reminder.priority,
      })
    } else {
      setEditingReminder(null)
      setFormData({ title: "", description: "", dueDate: new Date().toISOString().split("T")[0], priority: "MEDIUM" })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingReminder(null)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH": return "bg-red-100 text-red-700 border-red-200"
      case "MEDIUM": return "bg-amber-100 text-amber-700 border-amber-200"
      case "LOW": return "bg-emerald-100 text-emerald-700 border-emerald-200"
      default: return "bg-slate-100 text-slate-600"
    }
  }

  const isOverdue = (date: string) => new Date(date) < new Date()
  const pendingReminders = reminders.filter(r => r.status !== "COMPLETED")
  const completedReminders = reminders.filter(r => r.status === "COMPLETED")

  return (
    <AdminLayout title="Reminders" breadcrumbs={[{ name: "Notifications" }, { name: "Reminders" }]}>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Admin Reminders</h3>
              <p className="text-sm text-slate-500">{pendingReminders.length} pending reminders</p>
            </div>
          </div>
          <button onClick={() => openModal()} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium">
            <Plus className="w-5 h-5" /> Add Reminder
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : reminders.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">No Reminders</h3>
            <p className="text-slate-500 mb-4">Create reminders to stay organized</p>
            <button onClick={() => openModal()} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
              <Plus className="w-4 h-4" /> Add Reminder
            </button>
          </div>
        ) : (
          <div className="p-6">
            {pendingReminders.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3">Pending</h4>
                <div className="space-y-3">
                  {pendingReminders.map((reminder) => (
                    <div key={reminder.id} className={`p-4 rounded-xl border ${isOverdue(reminder.dueDate) ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <button onClick={() => handleComplete(reminder.id)} className="mt-1 w-5 h-5 rounded border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center">
                          </button>
                          <div>
                            <h4 className="font-semibold text-slate-800">{reminder.title}</h4>
                            <p className="text-sm text-slate-500 mt-1">{reminder.description}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(reminder.priority)}`}>
                                {reminder.priority}
                              </span>
                              <span className={`text-xs flex items-center gap-1 ${isOverdue(reminder.dueDate) ? "text-red-600" : "text-slate-500"}`}>
                                <Calendar className="w-3 h-3" />
                                {new Date(reminder.dueDate).toLocaleDateString()}
                                {isOverdue(reminder.dueDate) && " (Overdue)"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => openModal(reminder)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(reminder.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {completedReminders.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-500 uppercase mb-3">Completed</h4>
                <div className="space-y-3">
                  {completedReminders.map((reminder) => (
                    <div key={reminder.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 opacity-60">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 w-5 h-5 rounded bg-emerald-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800 line-through">{reminder.title}</h4>
                            <p className="text-sm text-slate-500">{reminder.description}</p>
                          </div>
                        </div>
                        <button onClick={() => handleDelete(reminder.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">{editingReminder ? "Edit Reminder" : "Add Reminder"}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-4 py-3 border border-slate-200 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Due Date</label>
                  <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl"><X className="w-4 h-4" /> Cancel</button>
                <button type="submit" className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl"><Save className="w-4 h-4" /> {editingReminder ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
