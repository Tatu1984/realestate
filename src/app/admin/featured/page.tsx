"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import AdminLayout from "@/components/admin/AdminLayout"
import { Star, Users, UserCheck, BadgeCheck, Briefcase, Plus, Eye, Trash2 } from "lucide-react"

interface FeaturedMember {
  id: string
  userId: string
  user: {
    name: string
    email: string
    userType: string
  }
  featuredType: string
  startDate: string
  endDate: string
  isActive: boolean
}

const featuredTypes = [
  { type: "BUYER", label: "Featured Buyers", icon: UserCheck, color: "from-blue-500 to-blue-600", href: "/admin/featured/buyers" },
  { type: "SELLER", label: "Featured Sellers", icon: BadgeCheck, color: "from-purple-500 to-purple-600", href: "/admin/featured/sellers" },
  { type: "AGENT", label: "Featured Agents", icon: Briefcase, color: "from-emerald-500 to-emerald-600", href: "/admin/featured/agents" },
]

export default function FeaturedListPage() {
  const [featuredMembers, setFeaturedMembers] = useState<FeaturedMember[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ buyers: 0, sellers: 0, agents: 0 })

  useEffect(() => {
    fetchFeaturedMembers()
  }, [])

  const fetchFeaturedMembers = async () => {
    try {
      const response = await fetch("/api/admin/featured")
      if (response.ok) {
        const data = await response.json()
        setFeaturedMembers(data.featured || [])
        // Calculate stats
        const members = data.featured || []
        setStats({
          buyers: members.filter((m: FeaturedMember) => m.featuredType === "BUYER").length,
          sellers: members.filter((m: FeaturedMember) => m.featuredType === "SELLER").length,
          agents: members.filter((m: FeaturedMember) => m.featuredType === "AGENT").length,
        })
      }
    } catch (error) {
      console.error("Error fetching featured members:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this member from featured list?")) return
    try {
      const response = await fetch(`/api/admin/featured/${id}`, { method: "DELETE" })
      if (response.ok) {
        fetchFeaturedMembers()
      }
    } catch (error) {
      console.error("Error removing featured member:", error)
    }
  }

  return (
    <AdminLayout title="Featured Members" breadcrumbs={[{ name: "Featured Members" }]}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {featuredTypes.map((type) => {
          const Icon = type.icon
          const count = type.type === "BUYER" ? stats.buyers : type.type === "SELLER" ? stats.sellers : stats.agents
          return (
            <Link
              key={type.type}
              href={type.href}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${type.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold text-slate-800">{count}</span>
              </div>
              <h3 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{type.label}</h3>
              <p className="text-sm text-slate-500">Manage featured {type.type.toLowerCase()}s</p>
            </Link>
          )
        })}
      </div>

      {/* All Featured Members */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">All Featured Members</h3>
              <p className="text-sm text-slate-500">{featuredMembers.length} total featured</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : featuredMembers.length === 0 ? (
          <div className="p-12 text-center">
            <Star className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">No Featured Members</h3>
            <p className="text-slate-500 mb-4">Start featuring buyers, sellers, or agents</p>
            <div className="flex items-center justify-center gap-3">
              {featuredTypes.map((type) => (
                <Link
                  key={type.type}
                  href={type.href}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add {type.type.charAt(0) + type.type.slice(1).toLowerCase()}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Member</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Type</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Featured Category</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Period</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {featuredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {member.user?.name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{member.user?.name}</p>
                          <p className="text-sm text-slate-500">{member.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-sm">{member.user?.userType}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                        Featured {member.featuredType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(member.startDate).toLocaleDateString()} - {new Date(member.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${member.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {member.isActive ? "Active" : "Expired"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/users/${member.userId}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleRemove(member.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
