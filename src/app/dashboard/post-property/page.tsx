"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Home,
  MapPin,
  Bed,
  Bath,
  Maximize,
  IndianRupee,
  Camera,
  ChevronRight,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const propertyTypes = [
  "APARTMENT",
  "HOUSE",
  "VILLA",
  "PLOT",
  "COMMERCIAL",
  "PG",
]

const listingTypes = [
  { id: "SELL", label: "Sell" },
  { id: "RENT", label: "Rent" },
  { id: "PG", label: "PG/Roommate" },
]

const furnishingOptions = ["UNFURNISHED", "SEMI_FURNISHED", "FURNISHED"]

const facingOptions = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"]

const amenitiesList = [
  "Swimming Pool",
  "Gym",
  "Parking",
  "Security",
  "Garden",
  "Lift",
  "Power Backup",
  "Water Supply",
  "Club House",
  "Children Play Area",
  "Gas Pipeline",
  "CCTV",
]

export default function PostPropertyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Basic Info
    listingType: "SELL",
    propertyType: "APARTMENT",
    title: "",
    description: "",

    // Location
    address: "",
    locality: "",
    city: "",
    state: "",
    pincode: "",

    // Property Details
    bedrooms: "",
    bathrooms: "",
    balconies: "",
    floorNumber: "",
    totalFloors: "",
    facing: "",
    furnishing: "UNFURNISHED",

    // Area
    builtUpArea: "",
    carpetArea: "",
    plotArea: "",

    // Price
    price: "",
    pricePerSqft: "",
    maintenance: "",
    securityDeposit: "",

    // Additional
    amenities: [] as string[],
    images: [] as string[],
    videoUrl: "",
    availableFrom: "",
  })

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          balconies: formData.balconies ? parseInt(formData.balconies) : null,
          floorNumber: formData.floorNumber ? parseInt(formData.floorNumber) : null,
          totalFloors: formData.totalFloors ? parseInt(formData.totalFloors) : null,
          builtUpArea: formData.builtUpArea ? parseFloat(formData.builtUpArea) : null,
          carpetArea: formData.carpetArea ? parseFloat(formData.carpetArea) : null,
          plotArea: formData.plotArea ? parseFloat(formData.plotArea) : null,
          price: parseFloat(formData.price),
          pricePerSqft: formData.pricePerSqft ? parseFloat(formData.pricePerSqft) : null,
          maintenance: formData.maintenance ? parseFloat(formData.maintenance) : null,
          securityDeposit: formData.securityDeposit ? parseFloat(formData.securityDeposit) : null,
        }),
      })

      if (response.ok) {
        router.push("/dashboard/properties?created=true")
      } else {
        const data = await response.json()
        alert(data.error || "Failed to create property")
      }
    } catch (error) {
      console.error("Error creating property:", error)
      alert("Failed to create property")
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { id: 1, title: "Basic Info" },
    { id: 2, title: "Location" },
    { id: 3, title: "Details" },
    { id: 4, title: "Price & Photos" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Post Your Property</h1>
          <p className="text-gray-600 mt-1">
            Fill in the details to list your property on PropEstate
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, index) => (
            <div key={s.id} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  step >= s.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > s.id ? <Check className="w-5 h-5" /> : s.id}
              </div>
              <span
                className={`ml-2 text-sm hidden sm:inline ${
                  step >= s.id ? "text-blue-600 font-medium" : "text-gray-500"
                }`}
              >
                {s.title}
              </span>
              {index < steps.length - 1 && (
                <ChevronRight className="w-5 h-5 mx-4 text-gray-400" />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Listing Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I want to *
                </label>
                <div className="flex gap-3">
                  {listingTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, listingType: type.id }))
                      }
                      className={`flex-1 py-3 rounded-lg border-2 font-medium transition-colors ${
                        formData.listingType === type.id
                          ? "border-blue-600 bg-blue-50 text-blue-600"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Type *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {propertyTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, propertyType: type }))
                      }
                      className={`py-3 rounded-lg border-2 font-medium transition-colors ${
                        formData.propertyType === type
                          ? "border-blue-600 bg-blue-50 text-blue-600"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Title *
                </label>
                <Input
                  name="title"
                  placeholder="e.g., 3 BHK Apartment in Whitefield"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your property..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <Button
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!formData.title}
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <Input
                  name="address"
                  placeholder="Flat No, Building Name, Street"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Locality *
                </label>
                <Input
                  name="locality"
                  placeholder="e.g., Whitefield"
                  value={formData.locality}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <Input
                    name="city"
                    placeholder="e.g., Bangalore"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <Input
                    name="state"
                    placeholder="e.g., Karnataka"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode
                </label>
                <Input
                  name="pincode"
                  placeholder="e.g., 560066"
                  value={formData.pincode}
                  onChange={handleChange}
                />
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep(3)}
                  disabled={!formData.address || !formData.city || !formData.state}
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Property Details */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="w-5 h-5" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <Input
                    name="bedrooms"
                    type="number"
                    placeholder="0"
                    value={formData.bedrooms}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms
                  </label>
                  <Input
                    name="bathrooms"
                    type="number"
                    placeholder="0"
                    value={formData.bathrooms}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Balconies
                  </label>
                  <Input
                    name="balconies"
                    type="number"
                    placeholder="0"
                    value={formData.balconies}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Floor Number
                  </label>
                  <Input
                    name="floorNumber"
                    type="number"
                    placeholder="0"
                    value={formData.floorNumber}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Floors
                  </label>
                  <Input
                    name="totalFloors"
                    type="number"
                    placeholder="0"
                    value={formData.totalFloors}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facing
                  </label>
                  <select
                    name="facing"
                    value={formData.facing}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select</option>
                    {facingOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Furnishing
                  </label>
                  <select
                    name="furnishing"
                    value={formData.furnishing}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {furnishingOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Built-up Area (sq.ft)
                  </label>
                  <Input
                    name="builtUpArea"
                    type="number"
                    placeholder="0"
                    value={formData.builtUpArea}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carpet Area (sq.ft)
                  </label>
                  <Input
                    name="carpetArea"
                    type="number"
                    placeholder="0"
                    value={formData.carpetArea}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plot Area (sq.ft)
                  </label>
                  <Input
                    name="plotArea"
                    type="number"
                    placeholder="0"
                    value={formData.plotArea}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {amenitiesList.map((amenity) => (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                        formData.amenities.includes(amenity)
                          ? "border-blue-600 bg-blue-50 text-blue-600"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {amenity}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button className="flex-1" onClick={() => setStep(4)}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Price & Photos */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5" />
                Price & Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <Input
                  name="price"
                  type="number"
                  placeholder="e.g., 5000000"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>

              {formData.listingType === "RENT" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maintenance (₹/month)
                    </label>
                    <Input
                      name="maintenance"
                      type="number"
                      placeholder="0"
                      value={formData.maintenance}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security Deposit (₹)
                    </label>
                    <Input
                      name="securityDeposit"
                      type="number"
                      placeholder="0"
                      value={formData.securityDeposit}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available From
                </label>
                <Input
                  name="availableFrom"
                  type="date"
                  value={formData.availableFrom}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL (YouTube)
                </label>
                <Input
                  name="videoUrl"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.videoUrl}
                  onChange={handleChange}
                />
              </div>

              {/* Image Upload Placeholder */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property Photos
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop images here or click to upload
                  </p>
                  <p className="text-sm text-gray-500">
                    (Image upload will be available in production)
                  </p>
                  <Button variant="outline" className="mt-4">
                    Select Images
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmit}
                  disabled={loading || !formData.price}
                >
                  {loading ? "Submitting..." : "Submit Property"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
