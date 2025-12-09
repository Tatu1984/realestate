"use client"

import { useState, useEffect } from "react"
import AdminLayout from "@/components/admin/AdminLayout"
import { Receipt, Search, Filter, Eye, Download, Calendar, User, Building2 } from "lucide-react"

interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  userId: string
  userName: string
  userEmail: string
  propertyId: string | null
  propertyTitle: string | null
  paymentMethod: string
  createdAt: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const response = await fetch("/api/admin/transactions")
      if (response.ok) {
        const data = await response.json()
        setTransactions(data.transactions || [])
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTransactions = transactions.filter((t) => {
    const matchesFilter = filter === "ALL" || t.status === filter
    const matchesSearch = t.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.includes(searchQuery)
    return matchesFilter && matchesSearch
  })

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      COMPLETED: "bg-emerald-100 text-emerald-700",
      PENDING: "bg-amber-100 text-amber-700",
      FAILED: "bg-red-100 text-red-700",
      REFUNDED: "bg-blue-100 text-blue-700",
    }
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-slate-100 text-slate-600"}`}>{status}</span>
  }

  const totalAmount = transactions.filter(t => t.status === "COMPLETED").reduce((sum, t) => sum + t.amount, 0)

  return (
    <AdminLayout title="Transactions" breadcrumbs={[{ name: "Listing Management" }, { name: "Transactions" }]}>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Total Transactions</p>
          <p className="text-2xl font-bold text-slate-800">{transactions.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Completed</p>
          <p className="text-2xl font-bold text-emerald-600">{transactions.filter(t => t.status === "COMPLETED").length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{transactions.filter(t => t.status === "PENDING").length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-blue-600">₹{totalAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Receipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Transaction History</h3>
                <p className="text-sm text-slate-500">{filteredTransactions.length} transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm"
              >
                <option value="ALL">All Status</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50">
                <Download className="w-4 h-4" /> Export
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">No Transactions Found</h3>
            <p className="text-slate-500">No transactions match your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Transaction ID</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">User</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Type</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Method</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-slate-600">#{transaction.id.slice(0, 8)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{transaction.userName}</p>
                          <p className="text-xs text-slate-500">{transaction.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-sm">{transaction.type}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">₹{transaction.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{transaction.paymentMethod}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(transaction.status)}</td>
                    <td className="px-6 py-4">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
