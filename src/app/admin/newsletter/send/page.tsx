"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import { Send, Users, Mail, FileText, CheckCircle, AlertCircle } from "lucide-react"

export default function SendNewsletterPage() {
  const [loading, setLoading] = useState(false)
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [formData, setFormData] = useState({
    subject: "",
    content: "",
    sendTo: "ALL",
  })

  useEffect(() => {
    fetchSubscriberCount()
  }, [])

  const fetchSubscriberCount = async () => {
    try {
      const response = await fetch("/api/admin/newsletter")
      if (response.ok) {
        const data = await response.json()
        setSubscriberCount(data.subscribers?.length || 0)
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setResult({ type: "success", message: `Newsletter sent successfully to ${data.sentCount || subscriberCount} subscribers!` })
        setFormData({ subject: "", content: "", sendTo: "ALL" })
      } else {
        const data = await response.json()
        setResult({ type: "error", message: data.error || "Failed to send newsletter" })
      }
    } catch {
      setResult({ type: "error", message: "An error occurred while sending" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout title="Send Newsletter" breadcrumbs={[{ name: "Newsletter", href: "/admin/newsletter" }, { name: "Send" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Compose Newsletter</h3>
                  <p className="text-sm text-slate-500">Send to {subscriberCount} subscribers</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {result && (
                <div className={`p-4 rounded-xl flex items-start gap-3 ${result.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  {result.type === "success" ? <CheckCircle className="w-5 h-5 mt-0.5" /> : <AlertCircle className="w-5 h-5 mt-0.5" />}
                  <p>{result.message}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Send To</label>
                <select
                  value={formData.sendTo}
                  onChange={(e) => setFormData({ ...formData, sendTo: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Subscribers ({subscriberCount})</option>
                  <option value="ACTIVE">Active Subscribers Only</option>
                  <option value="NEW">New Subscribers (Last 30 days)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subject *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Enter email subject"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Content *</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your newsletter content here..."
                    rows={12}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">You can use HTML for formatting</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFormData({ subject: "", content: "", sendTo: "ALL" })}
                  className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={loading || subscriberCount === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                  {loading ? "Sending..." : "Send Newsletter"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h4 className="font-semibold text-slate-800 mb-4">Subscriber Stats</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm text-slate-600">Total Subscribers</span>
                </div>
                <span className="text-xl font-bold text-slate-800">{subscriberCount}</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
            <h4 className="font-semibold text-slate-800 mb-3">Tips for Better Newsletters</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></span>
                Keep subject lines under 50 characters
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></span>
                Personalize content when possible
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></span>
                Include a clear call-to-action
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></span>
                Test on multiple devices
              </li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
