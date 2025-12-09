"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Home, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const propertyTypes = [
  "All Types",
  "Apartment",
  "House",
  "Villa",
  "Plot",
  "Commercial",
  "PG",
]

const budgetRanges = [
  { label: "Any Budget", min: 0, max: 0 },
  { label: "Under ₹50 Lac", min: 0, max: 5000000 },
  { label: "₹50 Lac - ₹1 Cr", min: 5000000, max: 10000000 },
  { label: "₹1 Cr - ₹2 Cr", min: 10000000, max: 20000000 },
  { label: "₹2 Cr - ₹5 Cr", min: 20000000, max: 50000000 },
  { label: "Above ₹5 Cr", min: 50000000, max: 0 },
]

interface SearchBoxProps {
  variant?: "hero" | "compact"
}

export default function SearchBox({ variant = "hero" }: SearchBoxProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"SELL" | "RENT" | "PG">("SELL")
  const [location, setLocation] = useState("")
  const [propertyType, setPropertyType] = useState("All Types")
  const [budget, setBudget] = useState(budgetRanges[0])
  const [showPropertyTypes, setShowPropertyTypes] = useState(false)
  const [showBudget, setShowBudget] = useState(false)

  const handleSearch = () => {
    const params = new URLSearchParams()
    params.set("type", activeTab)
    if (location) params.set("location", location)
    if (propertyType !== "All Types") params.set("propertyType", propertyType)
    if (budget.min > 0) params.set("minPrice", budget.min.toString())
    if (budget.max > 0) params.set("maxPrice", budget.max.toString())

    router.push(`/search?${params.toString()}`)
  }

  if (variant === "compact") {
    return (
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search by location, project, or builder"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto">
      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-lg w-fit">
        {(["SELL", "RENT", "PG"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab === "SELL" ? "Buy" : tab === "RENT" ? "Rent" : "PG/Co-living"}
          </button>
        ))}
      </div>

      {/* Search Fields */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Location */}
        <div className="md:col-span-2">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Enter city, locality, or project"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Property Type Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowPropertyTypes(!showPropertyTypes)
              setShowBudget(false)
            }}
            className="w-full h-12 px-4 flex items-center justify-between border border-gray-300 rounded-lg text-left hover:border-gray-400 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-gray-400" />
              <span className={propertyType === "All Types" ? "text-gray-400" : "text-gray-900"}>
                {propertyType}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {showPropertyTypes && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {propertyTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setPropertyType(type)
                    setShowPropertyTypes(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Budget Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowBudget(!showBudget)
              setShowPropertyTypes(false)
            }}
            className="w-full h-12 px-4 flex items-center justify-between border border-gray-300 rounded-lg text-left hover:border-gray-400 transition-colors"
          >
            <span className={budget.label === "Any Budget" ? "text-gray-400" : "text-gray-900"}>
              {budget.label}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {showBudget && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {budgetRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => {
                    setBudget(range)
                    setShowBudget(false)
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Search Button */}
      <Button onClick={handleSearch} size="lg" className="w-full mt-4 h-12">
        <Search className="w-5 h-5 mr-2" />
        Search Properties
      </Button>
    </div>
  )
}
