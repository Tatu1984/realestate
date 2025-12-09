"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signOut } from "next-auth/react"
import {
  Users,
  UserPlus,
  CreditCard,
  ArrowUpRight,
  FileText,
  Building2,
  PlusCircle,
  MessageSquare,
  Layers,
  Star,
  UserCheck,
  BadgeCheck,
  Briefcase,
  List,
  Receipt,
  Mail,
  Send,
  ClipboardList,
  Landmark,
  Globe,
  Settings,
  Lock,
  Newspaper,
  Calendar,
  MonitorPlay,
  Image as ImageIcon,
  HelpCircle,
  Bell,
  AlertTriangle,
  LogOut,
  Search,
  ChevronRight,
  Home,
  ExternalLink,
  TrendingUp,
  Activity,
  Eye,
  Clock,
  BarChart3,
  Sparkles,
  Menu,
  X,
} from "lucide-react"

interface AdminStats {
  totalUsers: number
  totalProperties: number
  pendingProperties: number
  activeProperties: number
  totalInquiries: number
  totalAgents: number
  totalBuilders: number
  totalMessages: number
}

interface MenuSection {
  title: string
  icon: React.ElementType
  color: string
  items: { name: string; icon: React.ElementType; href: string }[]
}

const menuSections: MenuSection[] = [
  {
    title: "Member Management",
    icon: Users,
    color: "from-blue-500 to-blue-600",
    items: [
      { name: "Manage Members", icon: Users, href: "/admin/users" },
      { name: "Add Member", icon: UserPlus, href: "/admin/users/add" },
      { name: "Membership", icon: CreditCard, href: "/admin/membership" },
      { name: "Membership Requests", icon: ArrowUpRight, href: "/admin/membership/requests" },
      { name: "User Requests", icon: FileText, href: "/admin/users/requests" },
    ],
  },
  {
    title: "Featured Projects",
    icon: Building2,
    color: "from-purple-500 to-purple-600",
    items: [
      { name: "Projects", icon: Building2, href: "/admin/projects" },
      { name: "New Projects", icon: PlusCircle, href: "/admin/projects/new" },
      { name: "Project Responses", icon: MessageSquare, href: "/admin/projects/responses" },
      { name: "Amenities", icon: Layers, href: "/admin/amenities" },
    ],
  },
  {
    title: "Featured Members",
    icon: Star,
    color: "from-amber-500 to-amber-600",
    items: [
      { name: "Featured List", icon: Star, href: "/admin/featured" },
      { name: "Featured Buyers", icon: UserCheck, href: "/admin/featured/buyers" },
      { name: "Featured Sellers", icon: BadgeCheck, href: "/admin/featured/sellers" },
      { name: "Featured Agents", icon: Briefcase, href: "/admin/featured/agents" },
    ],
  },
  {
    title: "Listing Management",
    icon: List,
    color: "from-emerald-500 to-emerald-600",
    items: [
      { name: "Listing Category", icon: Layers, href: "/admin/categories" },
      { name: "Manage Listings", icon: List, href: "/admin/properties" },
      { name: "Add New Listing", icon: PlusCircle, href: "/admin/properties/add" },
      { name: "Listing Responses", icon: MessageSquare, href: "/admin/properties/responses" },
      { name: "Transactions", icon: Receipt, href: "/admin/transactions" },
    ],
  },
  {
    title: "Newsletter",
    icon: Mail,
    color: "from-pink-500 to-pink-600",
    items: [
      { name: "Subscribers List", icon: Users, href: "/admin/newsletter" },
      { name: "Send Newsletter", icon: Send, href: "/admin/newsletter/send" },
    ],
  },
  {
    title: "Testimonials",
    icon: MessageSquare,
    color: "from-cyan-500 to-cyan-600",
    items: [
      { name: "Manage Testimonials", icon: MessageSquare, href: "/admin/testimonials" },
    ],
  },
  {
    title: "Property Requirements",
    icon: ClipboardList,
    color: "from-orange-500 to-orange-600",
    items: [
      { name: "Requirements", icon: ClipboardList, href: "/admin/requirements" },
    ],
  },
  {
    title: "Loan Management",
    icon: Landmark,
    color: "from-indigo-500 to-indigo-600",
    items: [
      { name: "Loan Policy", icon: Landmark, href: "/admin/loans" },
    ],
  },
  {
    title: "Location Settings",
    icon: Globe,
    color: "from-teal-500 to-teal-600",
    items: [
      { name: "Country List", icon: Globe, href: "/admin/countries" },
      { name: "Currency List", icon: CreditCard, href: "/admin/currencies" },
    ],
  },
  {
    title: "General Settings",
    icon: Settings,
    color: "from-slate-500 to-slate-600",
    items: [
      { name: "General Settings", icon: Settings, href: "/admin/settings" },
      { name: "Change Password", icon: Lock, href: "/admin/settings/password" },
      { name: "Bank Details", icon: Landmark, href: "/admin/bank" },
    ],
  },
  {
    title: "News & Events",
    icon: Newspaper,
    color: "from-rose-500 to-rose-600",
    items: [
      { name: "Add New", icon: PlusCircle, href: "/admin/news/add" },
      { name: "Manage News", icon: Newspaper, href: "/admin/news" },
      { name: "Manage Events", icon: Calendar, href: "/admin/events" },
    ],
  },
  {
    title: "Advertising",
    icon: MonitorPlay,
    color: "from-violet-500 to-violet-600",
    items: [
      { name: "Ad Management", icon: MonitorPlay, href: "/admin/ads" },
      { name: "Banner Ads", icon: ImageIcon, href: "/admin/banners" },
      { name: "Google Ads", icon: MonitorPlay, href: "/admin/google-ads" },
    ],
  },
  {
    title: "Enquiries",
    icon: Mail,
    color: "from-sky-500 to-sky-600",
    items: [
      { name: "All Enquiries", icon: Mail, href: "/admin/enquiries" },
    ],
  },
  {
    title: "CMS Management",
    icon: FileText,
    color: "from-fuchsia-500 to-fuchsia-600",
    items: [
      { name: "CMS Pages", icon: FileText, href: "/admin/pages" },
      { name: "FAQ", icon: HelpCircle, href: "/admin/faq" },
      { name: "Default Images", icon: ImageIcon, href: "/admin/images" },
    ],
  },
  {
    title: "Notifications",
    icon: Bell,
    color: "from-red-500 to-red-600",
    items: [
      { name: "All Reminders", icon: Bell, href: "/admin/reminders" },
      { name: "Alert Management", icon: AlertTriangle, href: "/admin/alerts" },
    ],
  },
]

const quickActions = [
  { name: "Manage Users", icon: Users, href: "/admin/users", color: "bg-blue-500", desc: "View all users" },
  { name: "Add User", icon: UserPlus, href: "/admin/users/add", color: "bg-blue-600", desc: "Create new user" },
  { name: "Properties", icon: Building2, href: "/admin/properties", color: "bg-emerald-500", desc: "Manage listings" },
  { name: "Add Property", icon: PlusCircle, href: "/admin/properties/add", color: "bg-emerald-600", desc: "New listing" },
  { name: "Settings", icon: Settings, href: "/admin/settings", color: "bg-slate-500", desc: "System config" },
  { name: "Password", icon: Lock, href: "/admin/settings/password", color: "bg-slate-600", desc: "Security" },
  { name: "News", icon: Newspaper, href: "/admin/news", color: "bg-rose-500", desc: "Manage news" },
  { name: "CMS", icon: FileText, href: "/admin/pages", color: "bg-fuchsia-500", desc: "Content pages" },
]

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<string[]>(["Member Management", "Listing Management"])
  const [searchQuery, setSearchQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (session?.user?.userType !== "ADMIN") {
      router.push("/admin")
    }
  }, [status, session, router])

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch("/api/admin/dashboard")
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        }
      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.userType === "ADMIN") {
      fetchAdminData()
    }
  }, [session])

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title]
    )
  }

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" })
  }

  const filteredSections = menuSections.map(section => ({
    ...section,
    items: searchQuery
      ? section.items.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : section.items
  })).filter(section => !searchQuery || section.items.length > 0)

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
          </div>
          <p className="text-slate-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (session?.user?.userType !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 h-16 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors lg:hidden"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg tracking-tight">PropEstate</h1>
              <p className="text-slate-400 text-xs">Admin Dashboard</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm px-4 py-2 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            <ExternalLink className="w-4 h-4" />
            View Site
          </Link>

          <div className="relative group">
            <button className="flex items-center gap-3 pl-4 border-l border-slate-700 cursor-pointer">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {session?.user?.name?.charAt(0) || "A"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-white text-sm font-medium">{session?.user?.name || "Admin"}</p>
                <p className="text-slate-400 text-xs">Administrator</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
              <Link href="/admin/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <Link href="/admin/settings/password" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                <Lock className="w-4 h-4" />
                Change Password
              </Link>
              <hr className="my-2" />
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Left Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-72 bg-white border-r border-slate-200 h-[calc(100vh-64px)] fixed left-0 top-16 overflow-y-auto overflow-x-hidden transition-transform duration-300 shadow-xl lg:shadow-none z-40 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent`}>
          {/* Search */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Menu Sections */}
          <nav className="p-3 space-y-1">
            {filteredSections.map((section) => {
              const isExpanded = expandedSections.includes(section.title)
              const Icon = section.icon

              return (
                <div key={section.title} className="rounded-xl overflow-hidden">
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.title)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all ${
                      isExpanded
                        ? 'bg-gradient-to-r ' + section.color + ' text-white shadow-md'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isExpanded ? 'bg-white/20' : 'bg-slate-100'
                    }`}>
                      <Icon className={`w-4 h-4 ${isExpanded ? 'text-white' : 'text-slate-500'}`} />
                    </div>
                    <span className="flex-1 text-left">{section.title}</span>
                    <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Section Items */}
                  {isExpanded && (
                    <div className="mt-1 ml-4 pl-4 border-l-2 border-slate-100 space-y-0.5">
                      {section.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all group"
                        >
                          <item.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all mt-4"
            >
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <LogOut className="w-4 h-4 text-red-500" />
              </div>
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-72 p-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6">
            <Link href="/admin" className="text-slate-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <span className="text-slate-800 font-medium">Dashboard</span>
          </div>

          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 mb-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-blue-100 text-sm font-medium">Welcome back</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">{session?.user?.name || "Admin"}</h2>
              <p className="text-blue-100 text-sm">{session?.user?.email}</p>
              <p className="text-blue-200 text-xs mt-2">Last login: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  +12%
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stats?.totalUsers || 0}</p>
              <p className="text-slate-500 text-sm">Total Users</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <Activity className="w-3 h-3" />
                  Active
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stats?.totalProperties || 0}</p>
              <p className="text-slate-500 text-sm">Total Listings</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                  Pending
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stats?.pendingProperties || 0}</p>
              <p className="text-slate-500 text-sm">Pending Review</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                  <BarChart3 className="w-3 h-3" />
                  Views
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{stats?.totalInquiries || 0}</p>
              <p className="text-slate-500 text-sm">Total Inquiries</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800">Quick Actions</h3>
              <span className="text-xs text-slate-400">Frequently used</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className="group text-center"
                >
                  <div className={`w-14 h-14 mx-auto ${action.color} rounded-2xl flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-xs font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{action.name}</p>
                  <p className="text-[10px] text-slate-400">{action.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Recent Users */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-800">Recent Users</h3>
                <Link href="/admin/users" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</Link>
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      U{i}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">User {i}</p>
                      <p className="text-xs text-slate-400">user{i}@example.com</p>
                    </div>
                    <span className="text-xs text-slate-400">Just now</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Listings */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-800">Recent Listings</h3>
                <Link href="/admin/properties" className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</Link>
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">Property Listing {i}</p>
                      <p className="text-xs text-slate-400">Mumbai, India</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${i % 2 === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {i % 2 === 0 ? 'Active' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
