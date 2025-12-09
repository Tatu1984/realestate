"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import { MonitorPlay, Save, Code, Eye, Settings } from "lucide-react"

export default function GoogleAdsPage() {
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [formData, setFormData] = useState({
    publisherId: "",
    headerAdCode: "",
    sidebarAdCode: "",
    footerAdCode: "",
    inArticleAdCode: "",
    isEnabled: false,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/google-ads")
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setFormData(data.settings)
        }
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/admin/google-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Google Ads settings saved successfully" })
      } else {
        const data = await response.json()
        setMessage({ type: "error", text: data.error || "Failed to save settings" })
      }
    } catch {
      setMessage({ type: "error", text: "An error occurred" })
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <AdminLayout title="Google Ads" breadcrumbs={[{ name: "Advertising" }, { name: "Google Ads" }]}>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Google Ads Integration" breadcrumbs={[{ name: "Advertising" }, { name: "Google Ads" }]}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <MonitorPlay className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Google AdSense Settings</h3>
                  <p className="text-sm text-slate-500">Configure Google Ads for your site</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {message && (
                <div className={`p-4 rounded-xl ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  {message.text}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Publisher ID</label>
                <input
                  type="text"
                  value={formData.publisherId}
                  onChange={(e) => setFormData({ ...formData, publisherId: e.target.value })}
                  placeholder="ca-pub-xxxxxxxxxx"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">Your Google AdSense publisher ID</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Header Ad Code</label>
                <div className="relative">
                  <Code className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <textarea
                    value={formData.headerAdCode}
                    onChange={(e) => setFormData({ ...formData, headerAdCode: e.target.value })}
                    rows={4}
                    placeholder="<script>...</script>"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Sidebar Ad Code</label>
                <div className="relative">
                  <Code className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <textarea
                    value={formData.sidebarAdCode}
                    onChange={(e) => setFormData({ ...formData, sidebarAdCode: e.target.value })}
                    rows={4}
                    placeholder="<script>...</script>"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">In-Article Ad Code</label>
                <div className="relative">
                  <Code className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <textarea
                    value={formData.inArticleAdCode}
                    onChange={(e) => setFormData({ ...formData, inArticleAdCode: e.target.value })}
                    rows={4}
                    placeholder="<script>...</script>"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Footer Ad Code</label>
                <div className="relative">
                  <Code className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <textarea
                    value={formData.footerAdCode}
                    onChange={(e) => setFormData({ ...formData, footerAdCode: e.target.value })}
                    rows={4}
                    placeholder="<script>...</script>"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm font-medium text-slate-700">Enable Google Ads</span>
                    <p className="text-xs text-slate-500">Show ads on your website</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.isEnabled}
                      onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                      className="sr-only"
                    />
                    <div className={`w-14 h-8 rounded-full transition-colors ${formData.isEnabled ? "bg-blue-600" : "bg-slate-300"}`}>
                      <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform mt-1 ${formData.isEnabled ? "translate-x-7" : "translate-x-1"}`}></div>
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {loading ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Setup Guide
            </h4>
            <ol className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span>Sign up for Google AdSense</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span>Get your publisher ID (ca-pub-xxx)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span>Create ad units in AdSense</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
                <span>Paste the ad codes above</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">5</span>
                <span>Enable ads and save</span>
              </li>
            </ol>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-6">
            <h4 className="font-semibold text-slate-800 mb-2">Important Note</h4>
            <p className="text-sm text-slate-600">
              Make sure your website complies with Google AdSense policies before enabling ads. Non-compliant sites may be banned.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
