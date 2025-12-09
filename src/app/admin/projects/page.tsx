"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AdminLayout from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/button"
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Filter,
  Building2,
  MapPin,
  Calendar,
  Star,
  X,
} from "lucide-react"

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  location: string
  city: string
  state: string
  totalUnits: number | null
  availableUnits: number | null
  priceRange: string | null
  isFeatured: boolean
  createdAt: string
  builder: {
    companyName: string
  }
}

const statusColors: Record<string, string> = {
  ONGOING: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  UPCOMING: "bg-amber-100 text-amber-700",
}

export default function AdminProjectsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (session?.user?.userType !== "ADMIN") {
      router.push("/admin")
    }
  }, [status, session, router])

  useEffect(() => {
    fetchProjects()
  }, [session])

  const fetchProjects = async () => {
    if (session?.user?.userType !== "ADMIN") return
    try {
      const response = await fetch("/api/admin/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedProject) return
    try {
      const response = await fetch(`/api/admin/projects/${selectedProject.id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setProjects(projects.filter(p => p.id !== selectedProject.id))
        setShowDeleteModal(false)
        setSelectedProject(null)
      }
    } catch (error) {
      console.error("Error deleting project:", error)
    }
  }

  const toggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !isFeatured }),
      })
      if (response.ok) {
        setProjects(projects.map(p => p.id === id ? { ...p, isFeatured: !isFeatured } : p))
      }
    } catch (error) {
      console.error("Error updating project:", error)
    }
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "ALL" || project.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (status === "loading" || loading) {
    return (
      <AdminLayout title="All Projects" breadcrumbs={[{ name: "Projects" }]}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="All Projects" breadcrumbs={[{ name: "Projects" }]}>
      {/* Delete Modal */}
      {showDeleteModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-2">Delete Project</h3>
            <p className="text-slate-600 mb-4">
              Are you sure you want to delete <strong>{selectedProject.name}</strong>?
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
              <option value="UPCOMING">Upcoming</option>
            </select>
          </div>
          <Link href="/admin/projects/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Project
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-2xl font-bold">{projects.length}</p>
          <p className="text-sm text-slate-500">Total Projects</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-2xl font-bold">{projects.filter(p => p.status === "ONGOING").length}</p>
          <p className="text-sm text-slate-500">Ongoing</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-2xl font-bold">{projects.filter(p => p.status === "COMPLETED").length}</p>
          <p className="text-sm text-slate-500">Completed</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-2xl font-bold">{projects.filter(p => p.isFeatured).length}</p>
          <p className="text-sm text-slate-500">Featured</p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg">{project.name}</h3>
                <p className="text-sm text-slate-500">{project.builder.companyName}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                {project.status}
              </span>
            </div>

            <div className="flex items-center gap-1 text-slate-500 text-sm mb-3">
              <MapPin className="w-4 h-4" />
              <span>{project.location}, {project.city}</span>
            </div>

            {project.priceRange && (
              <p className="text-blue-600 font-semibold mb-3">{project.priceRange}</p>
            )}

            <div className="flex gap-4 text-sm text-slate-600 mb-4">
              {project.totalUnits && (
                <span>{project.totalUnits} Total Units</span>
              )}
              {project.availableUnits && (
                <span>{project.availableUnits} Available</span>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <button
                onClick={() => toggleFeatured(project.id, project.isFeatured)}
                className={`flex items-center gap-1 text-sm ${project.isFeatured ? "text-amber-600" : "text-slate-400"}`}
              >
                <Star className={`w-4 h-4 ${project.isFeatured ? "fill-amber-600" : ""}`} />
                {project.isFeatured ? "Featured" : "Feature"}
              </button>
              <div className="flex gap-2">
                <Link href={`/admin/projects/${project.id}/edit`}>
                  <button className="p-2 hover:bg-slate-100 rounded-lg">
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </button>
                </Link>
                <button
                  onClick={() => { setSelectedProject(project); setShowDeleteModal(true); }}
                  className="p-2 hover:bg-red-100 rounded-lg"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No projects found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
