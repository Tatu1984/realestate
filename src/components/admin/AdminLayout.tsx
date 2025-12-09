"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Users,
  Building2,
  MessageSquare,
  Settings,
  FileText,
  Image,
  HelpCircle,
  Mail,
  ChevronDown,
  ChevronRight,
  Search,
  Bell,
  LogOut,
  UserPlus,
  CreditCard,
  ArrowUpRight,
  Star,
  Landmark,
  Globe,
  Newspaper,
  MonitorPlay,
  ImageIcon,
  Calendar,
  Layers,
  PlusCircle,
  List,
  Receipt,
  Send,
  BadgeCheck,
  UserCheck,
  Briefcase,
  MapPin,
  Banknote,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut, useSession } from "next-auth/react"

interface MenuItem {
  name: string
  icon: React.ElementType
  href?: string
}

const menuSections: { title: string; items: MenuItem[] }[] = [
  {
    title: "MEMBER MANAGEMENT",
    items: [
      { name: "Manage Members", icon: Users, href: "/admin/users" },
      { name: "Add Member", icon: UserPlus, href: "/admin/users/add" },
      { name: "Membership Plans", icon: CreditCard, href: "/admin/membership" },
      { name: "Upgrade Requests", icon: ArrowUpRight, href: "/admin/membership/requests" },
    ],
  },
  {
    title: "FEATURED PROJECTS",
    items: [
      { name: "All Projects", icon: Building2, href: "/admin/projects" },
      { name: "New Projects", icon: PlusCircle, href: "/admin/projects/new" },
      { name: "Project Responses", icon: MessageSquare, href: "/admin/projects/responses" },
      { name: "Amenities", icon: Layers, href: "/admin/amenities" },
    ],
  },
  {
    title: "FEATURED MEMBERS",
    items: [
      { name: "Featured List", icon: Star, href: "/admin/featured" },
      { name: "Featured Buyers", icon: UserCheck, href: "/admin/featured/buyers" },
      { name: "Featured Sellers", icon: BadgeCheck, href: "/admin/featured/sellers" },
      { name: "Featured Agents", icon: Briefcase, href: "/admin/featured/agents" },
    ],
  },
  {
    title: "LISTING MANAGEMENT",
    items: [
      { name: "Listing Categories", icon: Layers, href: "/admin/categories" },
      { name: "Manage Listings", icon: List, href: "/admin/properties" },
      { name: "Add New Listing", icon: PlusCircle, href: "/admin/properties/add" },
      { name: "Listing Responses", icon: MessageSquare, href: "/admin/properties/responses" },
      { name: "Transactions", icon: Receipt, href: "/admin/transactions" },
    ],
  },
  {
    title: "NEWSLETTER",
    items: [
      { name: "Subscribers List", icon: Users, href: "/admin/newsletter" },
      { name: "Send Newsletter", icon: Send, href: "/admin/newsletter/send" },
    ],
  },
  {
    title: "PROPERTY REQUIREMENTS",
    items: [
      { name: "Requirements", icon: FileText, href: "/admin/requirements" },
    ],
  },
  {
    title: "LOAN MANAGEMENT",
    items: [
      { name: "Loan Policies", icon: Banknote, href: "/admin/loans" },
    ],
  },
  {
    title: "LOCATION SETTINGS",
    items: [
      { name: "Cities", icon: MapPin, href: "/admin/cities" },
      { name: "Localities", icon: Globe, href: "/admin/localities" },
    ],
  },
  {
    title: "GENERAL SETTINGS",
    items: [
      { name: "Site Settings", icon: Settings, href: "/admin/settings" },
      { name: "Admin Profile", icon: UserCheck, href: "/admin/profile" },
      { name: "Bank Details", icon: Landmark, href: "/admin/bank" },
    ],
  },
  {
    title: "NEWS & EVENTS",
    items: [
      { name: "Add News", icon: PlusCircle, href: "/admin/news/add" },
      { name: "Manage News", icon: Newspaper, href: "/admin/news" },
      { name: "Manage Events", icon: Calendar, href: "/admin/events" },
    ],
  },
  {
    title: "BANNER & ADS",
    items: [
      { name: "Advertisement", icon: MonitorPlay, href: "/admin/ads" },
      { name: "Banner Ads", icon: Image, href: "/admin/banners" },
    ],
  },
  {
    title: "ENQUIRY MANAGEMENT",
    items: [
      { name: "Enquiries", icon: MessageSquare, href: "/admin/enquiries" },
    ],
  },
  {
    title: "CMS MANAGEMENT",
    items: [
      { name: "Pages", icon: FileText, href: "/admin/pages" },
      { name: "FAQ", icon: HelpCircle, href: "/admin/faq" },
      { name: "Default Images", icon: ImageIcon, href: "/admin/images" },
    ],
  },
]

interface AdminLayoutProps {
  children: React.ReactNode
  title: string
  breadcrumbs?: { name: string; href?: string }[]
}

export default function AdminLayout({ children, title, breadcrumbs = [] }: AdminLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [expandedSections, setExpandedSections] = useState<string[]>(() => {
    // Auto-expand section that contains current page
    const currentSection = menuSections.find((section) =>
      section.items.some((item) => item.href === pathname)
    )
    return currentSection ? [currentSection.title] : ["MEMBER MANAGEMENT"]
  })
  const [searchQuery, setSearchQuery] = useState("")

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionTitle)
        ? prev.filter((s) => s !== sectionTitle)
        : [...prev, sectionTitle]
    )
  }

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 shadow-lg z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">PropEstate Admin</h1>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" target="_blank">
            <Button variant="outline" size="sm" className="bg-blue-600 border-blue-600 text-white hover:bg-blue-700 gap-2">
              <ExternalLink className="w-4 h-4" />
              View Site
            </Button>
          </Link>
          <button className="relative p-2 text-slate-300 hover:text-white transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-slate-600">
            <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {session?.user?.name?.charAt(0) || "A"}
            </div>
            <div className="hidden md:block">
              <p className="text-white text-sm font-medium">{session?.user?.name || "Admin"}</p>
              <p className="text-slate-400 text-xs">{session?.user?.email}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="w-72 bg-white shadow-xl h-[calc(100vh-4rem)] fixed left-0 top-16 overflow-y-auto overflow-x-hidden border-r border-slate-200 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          {/* Admin Info */}
          <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Admin</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Quick Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Dashboard Link */}
          <div className="p-3 border-b border-slate-100">
            <Link
              href="/admin"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                pathname === "/admin"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Dashboard</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="p-3">
            {menuSections.map((section) => {
              const isExpanded = expandedSections.includes(section.title)
              const filteredItems = searchQuery
                ? section.items.filter((item) =>
                    item.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                : section.items

              if (searchQuery && filteredItems.length === 0) return null

              return (
                <div key={section.title} className="mb-1">
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-all"
                  >
                    <span className="tracking-wider">{section.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-medium">
                        {section.items.length}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="mt-1 ml-2 space-y-0.5">
                      {filteredItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                          <Link
                            key={item.name}
                            href={item.href || "#"}
                            className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all group ${
                              isActive
                                ? "bg-blue-50 text-blue-600"
                                : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                            }`}
                          >
                            <item.icon className={`w-4 h-4 ${isActive ? "text-blue-500" : "text-slate-400 group-hover:text-blue-500"}`} />
                            <span>{item.name}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Logout */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center">Copyright &copy; 2025</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-72 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
              <Link href="/admin" className="hover:text-blue-600">Home</Link>
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.name} className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4" />
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-blue-600">{crumb.name}</Link>
                  ) : (
                    <span className="text-slate-800 font-medium">{crumb.name}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Page Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 mb-8 shadow-xl shadow-blue-500/20">
              <h2 className="text-2xl font-bold text-white">{title}</h2>
            </div>

            {/* Page Content */}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
