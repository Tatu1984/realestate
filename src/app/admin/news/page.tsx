"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import AdminLayout from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, Eye, Newspaper, Globe, EyeOff } from "lucide-react"

interface News {
  id: string
  title: string
  slug: string
  excerpt: string | null
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
}

export default function AdminNewsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (session?.user?.userType !== "ADMIN") {
      router.push("/admin")
    }
  }, [status, session, router])

  useEffect(() => {
    fetchNews()
  }, [session])

  const fetchNews = async () => {
    if (session?.user?.userType !== "ADMIN") return
    try {
      const response = await fetch("/api/admin/news")
      if (response.ok) {
        const data = await response.json()
        setNews(data.news || [])
      }
    } catch (error) {
      console.error("Error fetching news:", error)
    } finally {
      setLoading(false)
    }
  }

  const togglePublish = async (id: string, isPublished: boolean) => {
    try {
      const response = await fetch(`/api/admin/news/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isPublished: !isPublished,
          publishedAt: !isPublished ? new Date().toISOString() : null
        }),
      })
      if (response.ok) {
        setNews(news.map(n => n.id === id ? { ...n, isPublished: !isPublished } : n))
      }
    } catch (error) {
      console.error("Error updating news:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this article?")) return
    try {
      const response = await fetch(`/api/admin/news/${id}`, { method: "DELETE" })
      if (response.ok) {
        setNews(news.filter(n => n.id !== id))
      }
    } catch (error) {
      console.error("Error deleting news:", error)
    }
  }

  if (status === "loading" || loading) {
    return (
      <AdminLayout title="Manage News" breadcrumbs={[{ name: "News" }]}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Manage News" breadcrumbs={[{ name: "News" }]}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-600">Manage news articles and blog posts</p>
        <Link href="/admin/news/add">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Article
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-2xl font-bold">{news.length}</p>
          <p className="text-sm text-slate-500">Total Articles</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-2xl font-bold text-green-600">{news.filter(n => n.isPublished).length}</p>
          <p className="text-sm text-slate-500">Published</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-100">
          <p className="text-2xl font-bold text-amber-600">{news.filter(n => !n.isPublished).length}</p>
          <p className="text-sm text-slate-500">Drafts</p>
        </div>
      </div>

      {/* News List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="text-left py-4 px-6 font-semibold text-sm">Title</th>
              <th className="text-left py-4 px-6 font-semibold text-sm">Status</th>
              <th className="text-left py-4 px-6 font-semibold text-sm">Created</th>
              <th className="text-right py-4 px-6 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {news.map((article) => (
              <tr key={article.id} className="border-b hover:bg-slate-50">
                <td className="py-4 px-6">
                  <p className="font-medium">{article.title}</p>
                  {article.excerpt && (
                    <p className="text-sm text-slate-500 truncate max-w-md">{article.excerpt}</p>
                  )}
                </td>
                <td className="py-4 px-6">
                  <button
                    onClick={() => togglePublish(article.id, article.isPublished)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      article.isPublished ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {article.isPublished ? <Globe className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {article.isPublished ? "Published" : "Draft"}
                  </button>
                </td>
                <td className="py-4 px-6 text-sm text-slate-500">
                  {new Date(article.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-6">
                  <div className="flex justify-end gap-2">
                    <Link href={`/news/${article.slug}`} target="_blank">
                      <button className="p-2 hover:bg-blue-100 rounded-lg">
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                    </Link>
                    <Link href={`/admin/news/${article.id}/edit`}>
                      <button className="p-2 hover:bg-amber-100 rounded-lg">
                        <Edit2 className="w-4 h-4 text-amber-600" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="p-2 hover:bg-red-100 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {news.length === 0 && (
          <div className="text-center py-12">
            <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No articles yet</p>
            <Link href="/admin/news/add">
              <Button className="mt-4">Add First Article</Button>
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
