"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, HelpCircle, X, GripVertical } from "lucide-react"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string | null
  order: number
  isActive: boolean
}

export default function AdminFAQPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
    isActive: true,
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (session?.user?.userType !== "ADMIN") {
      router.push("/admin")
    }
  }, [status, session, router])

  useEffect(() => {
    fetchFaqs()
  }, [session])

  const fetchFaqs = async () => {
    if (session?.user?.userType !== "ADMIN") return
    try {
      const response = await fetch("/api/admin/faq")
      if (response.ok) {
        const data = await response.json()
        setFaqs(data.faqs || [])
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingFaq ? "PATCH" : "POST"
      const url = editingFaq ? `/api/admin/faq/${editingFaq.id}` : "/api/admin/faq"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchFaqs()
        setShowModal(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error saving FAQ:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return
    try {
      const response = await fetch(`/api/admin/faq/${id}`, { method: "DELETE" })
      if (response.ok) {
        setFaqs(faqs.filter(f => f.id !== id))
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error)
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/faq/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      })
      if (response.ok) {
        setFaqs(faqs.map(f => f.id === id ? { ...f, isActive: !isActive } : f))
      }
    } catch (error) {
      console.error("Error updating FAQ:", error)
    }
  }

  const openEditModal = (faq: FAQ) => {
    setEditingFaq(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "",
      isActive: faq.isActive,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingFaq(null)
    setFormData({ question: "", answer: "", category: "", isActive: true })
  }

  if (status === "loading" || loading) {
    return (
      <AdminLayout title="FAQ Management" breadcrumbs={[{ name: "FAQ" }]}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="FAQ Management" breadcrumbs={[{ name: "FAQ" }]}>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{editingFaq ? "Edit FAQ" : "Add FAQ"}</h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Question *</label>
                <input
                  type="text"
                  required
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter the question"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Answer *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter the answer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., General, Buying, Selling"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Active</span>
              </label>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowModal(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingFaq ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-600">Manage frequently asked questions</p>
        <Button onClick={() => { resetForm(); setShowModal(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Add FAQ
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-2xl font-bold">{faqs.length}</p>
          <p className="text-sm text-slate-500">Total FAQs</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-2xl font-bold text-green-600">{faqs.filter(f => f.isActive).length}</p>
          <p className="text-sm text-slate-500">Active</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-2xl font-bold text-red-600">{faqs.filter(f => !f.isActive).length}</p>
          <p className="text-sm text-slate-500">Inactive</p>
        </div>
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.id} className={`bg-white rounded-xl p-6 border ${faq.isActive ? "border-slate-100" : "border-red-200"}`}>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold">{faq.question}</h3>
                </div>
                <p className="text-slate-600 text-sm mb-3">{faq.answer}</p>
                <div className="flex items-center gap-4">
                  {faq.category && (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{faq.category}</span>
                  )}
                  <button
                    onClick={() => toggleActive(faq.id, faq.isActive)}
                    className={`text-xs font-medium ${faq.isActive ? "text-green-600" : "text-red-600"}`}
                  >
                    {faq.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditModal(faq)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <Edit2 className="w-4 h-4 text-slate-500" />
                </button>
                <button onClick={() => handleDelete(faq.id)} className="p-2 hover:bg-red-100 rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {faqs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl">
            <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No FAQs yet</p>
            <Button onClick={() => setShowModal(true)} className="mt-4">Add First FAQ</Button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
