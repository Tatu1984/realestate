"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, CreditCard, Check, X } from "lucide-react"

interface MembershipPlan {
  id: string
  name: string
  description: string | null
  price: number
  duration: number
  featuredListings: number
  premiumListings: number
  basicListings: number
  features: string | null
  isActive: boolean
}

export default function MembershipPlansPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "30",
    featuredListings: "0",
    premiumListings: "0",
    basicListings: "5",
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
    fetchPlans()
  }, [session])

  const fetchPlans = async () => {
    if (session?.user?.userType !== "ADMIN") return
    try {
      const response = await fetch("/api/admin/membership")
      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans || [])
      }
    } catch (error) {
      console.error("Error fetching plans:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingPlan ? "PATCH" : "POST"
      const url = editingPlan ? `/api/admin/membership/${editingPlan.id}` : "/api/admin/membership"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          duration: parseInt(formData.duration),
          featuredListings: parseInt(formData.featuredListings),
          premiumListings: parseInt(formData.premiumListings),
          basicListings: parseInt(formData.basicListings),
          isActive: formData.isActive,
        }),
      })

      if (response.ok) {
        fetchPlans()
        setShowModal(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error saving plan:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this plan?")) return
    try {
      const response = await fetch(`/api/admin/membership/${id}`, { method: "DELETE" })
      if (response.ok) {
        setPlans(plans.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error("Error deleting plan:", error)
    }
  }

  const openEditModal = (plan: MembershipPlan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      description: plan.description || "",
      price: plan.price.toString(),
      duration: plan.duration.toString(),
      featuredListings: plan.featuredListings.toString(),
      premiumListings: plan.premiumListings.toString(),
      basicListings: plan.basicListings.toString(),
      isActive: plan.isActive,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingPlan(null)
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "30",
      featuredListings: "0",
      premiumListings: "0",
      basicListings: "5",
      isActive: true,
    })
  }

  if (status === "loading" || loading) {
    return (
      <AdminLayout title="Membership Plans" breadcrumbs={[{ name: "Membership Plans" }]}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Membership Plans" breadcrumbs={[{ name: "Membership Plans" }]}>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{editingPlan ? "Edit Plan" : "Add New Plan"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (days) *</label>
                  <input
                    type="number"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Basic Listings</label>
                  <input
                    type="number"
                    value={formData.basicListings}
                    onChange={(e) => setFormData({ ...formData, basicListings: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Featured</label>
                  <input
                    type="number"
                    value={formData.featuredListings}
                    onChange={(e) => setFormData({ ...formData, featuredListings: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Premium</label>
                  <input
                    type="number"
                    value={formData.premiumListings}
                    onChange={(e) => setFormData({ ...formData, premiumListings: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
                  {editingPlan ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-600">Manage membership plans and pricing</p>
        <Button onClick={() => { resetForm(); setShowModal(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Plan
        </Button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className={`bg-white rounded-2xl p-6 border ${plan.isActive ? "border-slate-100" : "border-red-200 bg-red-50/30"}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p className="text-sm text-slate-500">{plan.duration} days</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEditModal(plan)} className="p-2 hover:bg-slate-100 rounded-lg">
                  <Edit2 className="w-4 h-4 text-slate-500" />
                </button>
                <button onClick={() => handleDelete(plan.id)} className="p-2 hover:bg-red-100 rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>

            <p className="text-3xl font-bold text-blue-600 mb-4">
              ₹{plan.price.toLocaleString()}
            </p>

            {plan.description && (
              <p className="text-sm text-slate-600 mb-4">{plan.description}</p>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>{plan.basicListings} Basic Listings</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>{plan.featuredListings} Featured Listings</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>{plan.premiumListings} Premium Listings</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${plan.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {plan.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        ))}

        {plans.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No membership plans yet</p>
            <Button onClick={() => setShowModal(true)} className="mt-4">
              Add First Plan
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
