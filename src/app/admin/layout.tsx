import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard - PropEstate",
  description: "PropEstate Admin Dashboard - Manage properties, users, and settings",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Admin pages have their own header/sidebar, so we don't use the main layout's header/footer
  return <>{children}</>
}
