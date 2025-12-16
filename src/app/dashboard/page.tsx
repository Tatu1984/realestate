'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  Heart,
  MessageSquare,
  Eye,
  TrendingUp,
  Plus,
  Settings,
  CreditCard,
  Bell,
  User,
  Building,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'

interface DashboardStats {
  totalProperties: number
  activeListings: number
  totalViews: number
  totalInquiries: number
  totalFavorites: number
  viewsTrend: number
  inquiriesTrend: number
}

interface RecentProperty {
  id: string
  title: string
  price: number
  status: string
  views: number
  inquiries: number
  createdAt: string
}

interface RecentInquiry {
  id: string
  propertyTitle: string
  userName: string
  userEmail: string
  message: string
  createdAt: string
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentProperties, setRecentProperties] = useState<RecentProperty[]>([])
  const [recentInquiries, setRecentInquiries] = useState<RecentInquiry[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchDashboardData()
    }
  }, [status, router])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/users/dashboard')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setRecentProperties(data.recentProperties || [])
        setRecentInquiries(data.recentInquiries || [])
        setNotifications(data.notifications || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!session?.user) return null

  const quickActions = [
    {
      title: 'Post Property',
      description: 'List a new property for sale or rent',
      icon: Plus,
      href: '/dashboard/post-property',
      color: 'bg-blue-600',
    },
    {
      title: 'My Properties',
      description: 'Manage your listed properties',
      icon: Building,
      href: '/dashboard/properties',
      color: 'bg-green-600',
    },
    {
      title: 'Favorites',
      description: 'View your saved properties',
      icon: Heart,
      href: '/dashboard/favorites',
      color: 'bg-red-500',
    },
    {
      title: 'Settings',
      description: 'Update your profile and preferences',
      icon: Settings,
      href: '/dashboard/settings',
      color: 'bg-gray-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {session.user.name?.split(' ')[0]}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here&apos;s what&apos;s happening with your properties
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/post-property">
              <Plus className="w-4 h-4 mr-2" />
              Post Property
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Listings</p>
                  <p className="text-2xl font-bold">{stats?.activeListings || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Home className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Views</p>
                  <p className="text-2xl font-bold">{stats?.totalViews || 0}</p>
                  {stats?.viewsTrend !== undefined && (
                    <div className={`flex items-center text-sm ${stats.viewsTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.viewsTrend >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {Math.abs(stats.viewsTrend)}% this week
                    </div>
                  )}
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Inquiries</p>
                  <p className="text-2xl font-bold">{stats?.totalInquiries || 0}</p>
                  {stats?.inquiriesTrend !== undefined && (
                    <div className={`flex items-center text-sm ${stats.inquiriesTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.inquiriesTrend >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {Math.abs(stats.inquiriesTrend)}% this week
                    </div>
                  )}
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Favorites</p>
                  <p className="text-2xl font-bold">{stats?.totalFavorites || 0}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action) => (
                    <Link
                      key={action.title}
                      href={action.href}
                      className="flex items-start gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className={`${action.color} p-3 rounded-lg`}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Properties */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Properties</CardTitle>
                  <CardDescription>Recent listings and their performance</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/properties">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentProperties.length > 0 ? (
                  <div className="space-y-4">
                    {recentProperties.map((property) => (
                      <div
                        key={property.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <Link
                            href={`/property/${property.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600"
                          >
                            {property.title}
                          </Link>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span>{formatPrice(property.price)}</span>
                            <Badge
                              variant={property.status === 'ACTIVE' ? 'success' : 'secondary'}
                            >
                              {property.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="font-medium">{property.views}</p>
                            <p className="text-gray-500">Views</p>
                          </div>
                          <div className="text-center">
                            <p className="font-medium">{property.inquiries}</p>
                            <p className="text-gray-500">Inquiries</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No properties listed yet</p>
                    <Button className="mt-4" asChild>
                      <Link href="/dashboard/post-property">Post Your First Property</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Inquiries */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Inquiries</CardTitle>
                  <CardDescription>People interested in your properties</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/inquiries">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentInquiries.length > 0 ? (
                  <div className="space-y-4">
                    {recentInquiries.map((inquiry) => (
                      <div
                        key={inquiry.id}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{inquiry.userName}</p>
                            <p className="text-sm text-gray-500">{inquiry.userEmail}</p>
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {new Date(inquiry.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {inquiry.message}
                        </p>
                        <p className="mt-2 text-sm text-blue-600">
                          Re: {inquiry.propertyTitle}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No inquiries yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Profile Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
                    <User className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900">{session.user.name}</h3>
                  <p className="text-sm text-gray-500">{session.user.email}</p>
                  <Button variant="outline" className="mt-4 w-full" asChild>
                    <Link href="/dashboard/settings">Edit Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Notifications</CardTitle>
                <Bell className="w-5 h-5 text-gray-400" />
              </CardHeader>
              <CardContent>
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg text-sm ${
                          notification.read ? 'bg-gray-50' : 'bg-blue-50'
                        }`}
                      >
                        <p className="font-medium text-gray-900">{notification.title}</p>
                        <p className="text-gray-600 line-clamp-2">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No new notifications
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Upgrade CTA */}
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              <CardContent className="pt-6">
                <TrendingUp className="w-10 h-10 mb-4" />
                <h3 className="font-semibold text-lg">Boost Your Listings</h3>
                <p className="text-sm text-blue-100 mt-2">
                  Upgrade to Premium and get 10x more visibility for your properties.
                </p>
                <Button
                  className="mt-4 w-full bg-white text-blue-600 hover:bg-blue-50"
                  asChild
                >
                  <Link href="/dashboard/membership">Upgrade Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
