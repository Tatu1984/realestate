import Link from "next/link"
import Image from "next/image"
import { Building2, MapPin, Calendar, Home, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import prisma from "@/lib/prisma"

async function getProjects() {
  try {
    return await prisma.project.findMany({
      include: {
        builder: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
        _count: {
          select: { properties: true },
        },
      },
      orderBy: [
        { isFeatured: "desc" },
        { isPopular: "desc" },
        { createdAt: "desc" },
      ],
    })
  } catch {
    return []
  }
}

export default async function ProjectsPage() {
  const projects = await getProjects()

  const statusColors: Record<string, string> = {
    ONGOING: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    UPCOMING: "bg-yellow-100 text-yellow-700",
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Explore Builder Projects
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Discover residential and commercial projects from India&apos;s top builders. Find your perfect home in a new development.
          </p>
        </div>

        {/* Featured Projects */}
        {projects.filter(p => p.isFeatured).length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Featured Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.filter(p => p.isFeatured).slice(0, 2).map((project) => {
                const images = project.images ? JSON.parse(project.images) : []
                return (
                  <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-56">
                      <Image
                        src={images[0] || "/placeholder-project.jpg"}
                        alt={project.name}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <Badge variant="featured">Featured</Badge>
                        <Badge className={statusColors[project.status]}>
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-500">by {project.builder.companyName}</p>
                      <div className="flex items-center gap-1 text-gray-500 text-sm mt-2">
                        <MapPin className="w-4 h-4" />
                        {project.location}, {project.city}
                      </div>
                      {project.description && (
                        <p className="text-gray-600 text-sm mt-3 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex gap-6 mt-4 pt-4 border-t">
                        {project.totalUnits && (
                          <div>
                            <p className="text-lg font-bold text-gray-900">{project.totalUnits}</p>
                            <p className="text-xs text-gray-500">Total Units</p>
                          </div>
                        )}
                        {project.availableUnits && (
                          <div>
                            <p className="text-lg font-bold text-green-600">{project.availableUnits}</p>
                            <p className="text-xs text-gray-500">Available</p>
                          </div>
                        )}
                        {project.priceRange && (
                          <div>
                            <p className="text-lg font-bold text-blue-600">{project.priceRange}</p>
                            <p className="text-xs text-gray-500">Price Range</p>
                          </div>
                        )}
                      </div>
                      <Link href={`/projects/${project.id}`}>
                        <Button className="w-full mt-4 gap-2">
                          View Project <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Popular Projects */}
        {projects.filter(p => p.isPopular && !p.isFeatured).length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Popular Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.filter(p => p.isPopular && !p.isFeatured).map((project) => {
                const images = project.images ? JSON.parse(project.images) : []
                return (
                  <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-40">
                      <Image
                        src={images[0] || "/placeholder-project.jpg"}
                        alt={project.name}
                        fill
                        className="object-cover"
                      />
                      <Badge className={`absolute top-3 left-3 ${statusColors[project.status]}`}>
                        {project.status}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-500">by {project.builder.companyName}</p>
                      <div className="flex items-center gap-1 text-gray-500 text-sm mt-2">
                        <MapPin className="w-4 h-4" />
                        {project.city}
                      </div>
                      {project.priceRange && (
                        <p className="text-blue-600 font-semibold mt-2">{project.priceRange}</p>
                      )}
                      <Link href={`/projects/${project.id}`}>
                        <Button variant="outline" className="w-full mt-4" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* All Projects */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            All Projects ({projects.length})
          </h2>
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => {
                const images = project.images ? JSON.parse(project.images) : []
                return (
                  <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative h-40">
                      <Image
                        src={images[0] || "/placeholder-project.jpg"}
                        alt={project.name}
                        fill
                        className="object-cover"
                      />
                      <Badge className={`absolute top-3 left-3 ${statusColors[project.status]}`}>
                        {project.status}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <p className="text-sm text-gray-500">by {project.builder.companyName}</p>
                      <div className="flex items-center gap-1 text-gray-500 text-sm mt-2">
                        <MapPin className="w-4 h-4" />
                        {project.location}, {project.city}
                      </div>
                      <div className="flex gap-4 mt-3 text-sm text-gray-600">
                        {project._count.properties > 0 && (
                          <span className="flex items-center gap-1">
                            <Home className="w-4 h-4" />
                            {project._count.properties} Properties
                          </span>
                        )}
                      </div>
                      {project.priceRange && (
                        <p className="text-blue-600 font-semibold mt-2">{project.priceRange}</p>
                      )}
                      <Link href={`/projects/${project.id}`}>
                        <Button variant="outline" className="w-full mt-4" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600">Check back later for new projects!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
