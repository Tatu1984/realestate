import Link from "next/link"
import { Users, Star, MapPin, Phone, Mail, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import prisma from "@/lib/prisma"

async function getAgents() {
  try {
    return await prisma.agentProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: [
        { isFeatured: "desc" },
        { rating: "desc" },
      ],
    })
  } catch {
    return []
  }
}

export default async function AgentsPage() {
  const agents = await getAgents()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Find Real Estate Agents
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with verified real estate professionals who can help you buy, sell, or rent properties across India.
          </p>
        </div>

        {/* Featured Agents */}
        {agents.filter(a => a.isFeatured).length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Featured Agents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {agents.filter(a => a.isFeatured).map((agent) => (
                <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">{agent.user.name}</h3>
                    {agent.companyName && (
                      <p className="text-sm text-gray-500">{agent.companyName}</p>
                    )}
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium">{agent.rating.toFixed(1)}</span>
                      <span className="text-gray-500">({agent.totalDeals} deals)</span>
                    </div>
                    {agent.city && (
                      <p className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {agent.city}, {agent.state}
                      </p>
                    )}
                    {agent.specialization && (
                      <p className="text-sm text-blue-600 mt-2">{agent.specialization}</p>
                    )}
                    <Link href={`/agents/${agent.id}`}>
                      <Button className="w-full mt-4" size="sm">View Profile</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Agents */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            All Agents ({agents.length})
          </h2>
          {agents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{agent.user.name}</h3>
                        {agent.companyName && (
                          <p className="text-sm text-gray-500">{agent.companyName}</p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium">{agent.rating.toFixed(1)}</span>
                          <span className="text-sm text-gray-500">({agent.totalDeals} deals)</span>
                        </div>
                      </div>
                    </div>
                    {agent.description && (
                      <p className="text-sm text-gray-600 mt-4 line-clamp-2">{agent.description}</p>
                    )}
                    {agent.city && (
                      <p className="text-sm text-gray-500 mt-3 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {agent.city}, {agent.state}
                      </p>
                    )}
                    {agent.experience && (
                      <p className="text-sm text-gray-500 mt-1">
                        {agent.experience} years experience
                      </p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Link href={`/agents/${agent.id}`} className="flex-1">
                        <Button variant="outline" className="w-full" size="sm">
                          View Profile
                        </Button>
                      </Link>
                      {agent.user.phone && (
                        <Button size="sm" asChild>
                          <a href={`tel:${agent.user.phone}`}>
                            <Phone className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No agents found</h3>
              <p className="text-gray-600">Be the first to register as an agent!</p>
              <Link href="/register">
                <Button className="mt-4">Register as Agent</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
