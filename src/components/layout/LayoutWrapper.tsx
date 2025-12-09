"use client"

import { usePathname } from "next/navigation"
import Header from "./Header"
import Footer from "./Footer"

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminPage = pathname?.startsWith("/admin")
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/forgot-password"

  if (isAdminPage) {
    // Admin pages have their own layout
    return <>{children}</>
  }

  if (isAuthPage) {
    // Auth pages - show header but no footer for cleaner look
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
