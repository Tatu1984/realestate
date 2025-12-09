import Link from "next/link"
import Image from "next/image"
import { Building2, MapPin, Calendar, Briefcase, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import prisma from "@/lib/prisma"

async function getBuilders() {
  try {
    return await prisma.builderProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        projects: {
          take: 3,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: [
        { isFeatured: "desc" },
        { totalProjects: "desc" },
      ],
    })
  } catch {
    return []
  }
}

export default async function BuildersPage() {
  const builders = await getBuilders()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Top Builders & Developers
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore projects from India&apos;s most trusted builders and developers. Find your dream home with confidence.
          </p>
        </div>

        {/* Featured Builders */}
        {builders.filter(b => b.isFeatured).length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Featured Builders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {builders.filter(b => b.isFeatured).map((builder) => (
                <Card key={builder.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-white/50" />
                  </div>
                  <CardContent className="p-6">
                    <Badge variant="featured" className="mb-3">Featured</Badge>
                    <h3 className="font-bold text-xl text-gray-900">{builder.companyName}</h3>
                    {builder.city && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {builder.city}, {builder.state}
                      </p>
                    )}
                    {builder.description && (
                      <p className="text-sm text-gray-600 mt-3 line-clamp-2">{builder.description}</p>
                    )}
                    <div className="flex gap-6 mt-4 pt-4 border-t">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{builder.totalProjects}</p>
                        <p className="text-xs text-gray-500">Total Projects</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{builder.ongoingProjects}</p>
                        <p className="text-xs text-gray-500">Ongoing</p>
                      </div>
                      {builder.establishedYear && (
                        <div>
                          <p className="text-2xl font-bold text-gray-700">
                            {new Date().getFullYear() - builder.establishedYear}+
                          </p>
                          <p className="text-xs text-gray-500">Years</p>
                        </div>
                      )}
                    </div>
                    <Link href={`/builders/${builder.id}`}>
                      <Button className="w-full mt-4 gap-2">
                        View Projects <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Builders */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            All Builders ({builders.length})
          </h2>
          {builders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {builders.map((builder) => (
                <Card key={builder.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-7 h-7 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{builder.companyName}</h3>
                        {builder.city && (
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {builder.city}, {builder.state}
                          </p>
                        )}
                      </div>
                    </div>
                    {builder.description && (
                      <p className="text-sm text-gray-600 mt-4 line-clamp-2">{builder.description}</p>
                    )}
                    <div className="flex gap-4 mt-4 text-sm">
                      <span className="flex items-center gap-1 text-gray-600">
                        <Briefcase className="w-4 h-4" />
                        {builder.totalProjects} Projects
                      </span>
                      {builder.establishedYear && (
                        <span className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          Est. {builder.establishedYear}
                        </span>
                      )}
                    </div>

                    {/* Recent Projects */}
                    {builder.projects.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs font-medium text-gray-500 mb-2">Recent Projects</p>
                        <div className="space-y-2">
                          {builder.projects.slice(0, 2).map((project) => (
                            <Link
                              key={project.id}
                              href={`/projects/${project.id}`}
                              className="block text-sm text-gray-700 hover:text-blue-600"
                            >
                              {project.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    <Link href={`/builders/${builder.id}`}>
                      <Button variant="outline" className="w-full mt-4" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No builders found</h3>
              <p className="text-gray-600">Be the first to register as a builder!</p>
              <Link href="/register">
                <Button className="mt-4">Register as Builder</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
