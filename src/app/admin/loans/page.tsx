"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, Landmark, Percent, X } from "lucide-react"

interface Loan {
  id: string
  bankName: string
  interestRate: number
  maxAmount: number | null
  minAmount: number | null
  tenure: string | null
  processingFee: string | null
  isActive: boolean
}

export default function AdminLoansPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)
  const [formData, setFormData] = useState({
    bankName: "",
    interestRate: "",
    minAmount: "",
    maxAmount: "",
    tenure: "",
    processingFee: "",
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
    fetchLoans()
  }, [session])

  const fetchLoans = async () => {
    if (session?.user?.userType !== "ADMIN") return
    try {
      const response = await fetch("/api/admin/loans")
      if (response.ok) {
        const data = await response.json()
        setLoans(data.loans || [])
      }
    } catch (error) {
      console.error("Error fetching loans:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const method = editingLoan ? "PATCH" : "POST"
      const url = editingLoan ? `/api/admin/loans/${editingLoan.id}` : "/api/admin/loans"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName: formData.bankName,
          interestRate: parseFloat(formData.interestRate),
          minAmount: formData.minAmount ? parseFloat(formData.minAmount) : null,
          maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : null,
          tenure: formData.tenure || null,
          processingFee: formData.processingFee || null,
          isActive: formData.isActive,
        }),
      })

      if (response.ok) {
        fetchLoans()
        setShowModal(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error saving loan:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this loan provider?")) return
    try {
      const response = await fetch(`/api/admin/loans/${id}`, { method: "DELETE" })
      if (response.ok) {
        setLoans(loans.filter(l => l.id !== id))
      }
    } catch (error) {
      console.error("Error deleting loan:", error)
    }
  }

  const openEditModal = (loan: Loan) => {
    setEditingLoan(loan)
    setFormData({
      bankName: loan.bankName,
      interestRate: loan.interestRate.toString(),
      minAmount: loan.minAmount?.toString() || "",
      maxAmount: loan.maxAmount?.toString() || "",
      tenure: loan.tenure || "",
      processingFee: loan.processingFee || "",
      isActive: loan.isActive,
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setEditingLoan(null)
    setFormData({
      bankName: "",
      interestRate: "",
      minAmount: "",
      maxAmount: "",
      tenure: "",
      processingFee: "",
      isActive: true,
    })
  }

  if (status === "loading" || loading) {
    return (
      <AdminLayout title="Loan Policies" breadcrumbs={[{ name: "Loans" }]}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Loan Policies" breadcrumbs={[{ name: "Loans" }]}>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{editingLoan ? "Edit Loan" : "Add Loan Provider"}</h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bank Name *</label>
                <input
                  type="text"
                  required
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., State Bank of India"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Interest Rate (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.interestRate}
                  onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 8.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Min Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.minAmount}
                    onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="500000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Max Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.maxAmount}
                    onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="50000000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tenure</label>
                <input
                  type="text"
                  value={formData.tenure}
                  onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10-30 years"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Processing Fee</label>
                <input
                  type="text"
                  value={formData.processingFee}
                  onChange={(e) => setFormData({ ...formData, processingFee: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 0.5% of loan amount"
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
                  {editingLoan ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-600">Manage loan providers and interest rates</p>
        <Button onClick={() => { resetForm(); setShowModal(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Loan Provider
        </Button>
      </div>

      {/* Loans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loans.map((loan) => (
          <div key={loan.id} className={`bg-white rounded-xl p-5 border ${loan.isActive ? "border-slate-100" : "border-red-200"}`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <Landmark className="w-6 h-6 text-blue-600" />
                <h3 className="font-semibold">{loan.bankName}</h3>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${loan.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {loan.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="flex items-center gap-1 text-2xl font-bold text-blue-600 mb-3">
              {loan.interestRate}%
              <span className="text-sm font-normal text-slate-500">p.a.</span>
            </div>

            <div className="space-y-2 text-sm text-slate-600 mb-4">
              {(loan.minAmount || loan.maxAmount) && (
                <p>
                  Loan Amount: ₹{loan.minAmount?.toLocaleString() || "0"} - ₹{loan.maxAmount?.toLocaleString() || "∞"}
                </p>
              )}
              {loan.tenure && <p>Tenure: {loan.tenure}</p>}
              {loan.processingFee && <p>Processing Fee: {loan.processingFee}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button onClick={() => openEditModal(loan)} className="p-2 hover:bg-slate-100 rounded-lg">
                <Edit2 className="w-4 h-4 text-slate-500" />
              </button>
              <button onClick={() => handleDelete(loan.id)} className="p-2 hover:bg-red-100 rounded-lg">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        ))}

        {loans.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl">
            <Landmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No loan providers added yet</p>
            <Button onClick={() => setShowModal(true)} className="mt-4">Add First Provider</Button>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
