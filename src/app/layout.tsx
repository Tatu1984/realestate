import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Providers from "@/components/Providers"
import LayoutWrapper from "@/components/layout/LayoutWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PropEstate - Find Your Dream Property",
  description: "India's leading real estate marketplace. Buy, sell, or rent properties across India. Find apartments, houses, villas, plots, and commercial spaces.",
  keywords: "real estate, property, buy, sell, rent, apartments, houses, villas, plots, India",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  )
}
