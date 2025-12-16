'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapPin, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Declare google maps types
declare global {
  interface Window {
    google: typeof google
    initGoogleMaps: () => void
  }
}

interface PropertyMapProps {
  latitude?: number
  longitude?: number
  address?: string
  title?: string
  onLocationSelect?: (lat: number, lng: number, address?: string) => void
  editable?: boolean
  zoom?: number
  height?: string
  showControls?: boolean
}

// Load Google Maps script
function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve()
      return
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`
    script.async = true
    script.defer = true

    window.initGoogleMaps = () => {
      resolve()
    }

    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })
}

export function PropertyMap({
  latitude,
  longitude,
  address,
  title = 'Property Location',
  onLocationSelect,
  editable = false,
  zoom = 15,
  height = '400px',
  showControls = true,
}: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  const initMap = useCallback(async () => {
    if (!apiKey) {
      setError('Google Maps API key not configured')
      setLoading(false)
      return
    }

    if (!mapRef.current) return

    try {
      await loadGoogleMapsScript(apiKey)

      // Default to India center if no coordinates
      const defaultCenter = { lat: 20.5937, lng: 78.9629 }
      const center = latitude && longitude
        ? { lat: latitude, lng: longitude }
        : defaultCenter

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: latitude && longitude ? zoom : 5,
        mapTypeControl: showControls,
        streetViewControl: showControls,
        fullscreenControl: false,
        zoomControl: showControls,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      })

      setMap(mapInstance)

      // Add marker if coordinates exist
      if (latitude && longitude) {
        const markerInstance = new window.google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: mapInstance,
          title,
          draggable: editable,
          animation: window.google.maps.Animation.DROP,
        })

        // Info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="font-weight: 600; margin-bottom: 4px;">${title}</h3>
              ${address ? `<p style="color: #666; font-size: 14px;">${address}</p>` : ''}
            </div>
          `,
        })

        markerInstance.addListener('click', () => {
          infoWindow.open(mapInstance, markerInstance)
        })

        if (editable) {
          markerInstance.addListener('dragend', () => {
            const position = markerInstance.getPosition()
            if (position && onLocationSelect) {
              onLocationSelect(position.lat(), position.lng())
            }
          })
        }

        setMarker(markerInstance)
      }

      // Allow click to place marker if editable
      if (editable) {
        mapInstance.addListener('click', async (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return

          const lat = e.latLng.lat()
          const lng = e.latLng.lng()

          // Update or create marker
          if (marker) {
            marker.setPosition(e.latLng)
          } else {
            const newMarker = new window.google.maps.Marker({
              position: e.latLng,
              map: mapInstance,
              draggable: true,
              animation: window.google.maps.Animation.DROP,
            })

            newMarker.addListener('dragend', () => {
              const position = newMarker.getPosition()
              if (position && onLocationSelect) {
                onLocationSelect(position.lat(), position.lng())
              }
            })

            setMarker(newMarker)
          }

          // Reverse geocode to get address
          try {
            const geocoder = new window.google.maps.Geocoder()
            const response = await geocoder.geocode({ location: e.latLng })
            const formattedAddress = response.results[0]?.formatted_address

            if (onLocationSelect) {
              onLocationSelect(lat, lng, formattedAddress)
            }
          } catch {
            if (onLocationSelect) {
              onLocationSelect(lat, lng)
            }
          }
        })
      }

      setLoading(false)
    } catch (err) {
      console.error('Error loading Google Maps:', err)
      setError('Failed to load map')
      setLoading(false)
    }
  }, [apiKey, latitude, longitude, address, title, onLocationSelect, editable, zoom, showControls, marker])

  useEffect(() => {
    initMap()
  }, [initMap])

  // Update marker when coordinates change
  useEffect(() => {
    if (map && marker && latitude && longitude) {
      marker.setPosition({ lat: latitude, lng: longitude })
      map.panTo({ lat: latitude, lng: longitude })
    }
  }, [map, marker, latitude, longitude])

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (error) {
    return (
      <div
        className="bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-500"
        style={{ height }}
      >
        <MapPin className="w-12 h-12 mb-2 text-gray-400" />
        <p className="text-sm">{error}</p>
        {address && (
          <p className="text-sm mt-2 text-center px-4">{address}</p>
        )}
      </div>
    )
  }

  return (
    <div
      className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {loading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {showControls && (
        <Button
          variant="outline"
          size="icon"
          className="absolute top-3 right-3 bg-white shadow-md z-10"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      )}

      {editable && !loading && (
        <div className="absolute bottom-3 left-3 right-3 bg-white/90 rounded-lg p-3 text-sm text-gray-600 z-10">
          Click on the map to set the property location, or drag the marker to adjust
        </div>
      )}
    </div>
  )
}

// Search box component for address autocomplete
interface AddressSearchProps {
  onSelect: (address: string, lat: number, lng: number) => void
  placeholder?: string
  defaultValue?: string
}

export function AddressSearch({
  onSelect,
  placeholder = 'Search for an address...',
  defaultValue = '',
}: AddressSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey || !inputRef.current) return

    loadGoogleMapsScript(apiKey).then(() => {
      if (!inputRef.current) return

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'in' },
        fields: ['formatted_address', 'geometry', 'name'],
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()

        if (place.geometry?.location) {
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          const address = place.formatted_address || place.name || ''

          setValue(address)
          onSelect(address, lat, lng)
        }
      })
    })
  }, [onSelect])

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  )
}

// Multiple properties map
interface MultiPropertyMapProps {
  properties: Array<{
    id: string
    title: string
    price: number
    latitude?: number
    longitude?: number
    address?: string
  }>
  height?: string
  onPropertyClick?: (propertyId: string) => void
}

export function MultiPropertyMap({
  properties,
  height = '500px',
  onPropertyClick,
}: MultiPropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setError('Google Maps API key not configured')
      setLoading(false)
      return
    }

    if (!mapRef.current) return

    loadGoogleMapsScript(apiKey).then(() => {
      if (!mapRef.current) return

      const validProperties = properties.filter((p) => p.latitude && p.longitude)

      if (validProperties.length === 0) {
        setError('No properties with location data')
        setLoading(false)
        return
      }

      // Calculate bounds
      const bounds = new window.google.maps.LatLngBounds()
      validProperties.forEach((p) => {
        if (p.latitude && p.longitude) {
          bounds.extend({ lat: p.latitude, lng: p.longitude })
        }
      })

      const map = new window.google.maps.Map(mapRef.current, {
        center: bounds.getCenter(),
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
      })

      map.fitBounds(bounds)

      // Add markers
      validProperties.forEach((property) => {
        if (!property.latitude || !property.longitude) return

        const marker = new window.google.maps.Marker({
          position: { lat: property.latitude, lng: property.longitude },
          map,
          title: property.title,
        })

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px; cursor: pointer;">
              <h3 style="font-weight: 600; margin-bottom: 4px;">${property.title}</h3>
              <p style="color: #2563eb; font-weight: 600;">₹${property.price.toLocaleString()}</p>
              ${property.address ? `<p style="color: #666; font-size: 12px; margin-top: 4px;">${property.address}</p>` : ''}
            </div>
          `,
        })

        marker.addListener('click', () => {
          infoWindow.open(map, marker)
        })

        if (onPropertyClick) {
          window.google.maps.event.addListener(infoWindow, 'domready', () => {
            const content = document.querySelector('.gm-style-iw-d')
            if (content) {
              content.addEventListener('click', () => {
                onPropertyClick(property.id)
              })
            }
          })
        }
      })

      setLoading(false)
    }).catch(() => {
      setError('Failed to load map')
      setLoading(false)
    })
  }, [properties, onPropertyClick])

  if (error) {
    return (
      <div
        className="bg-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-500"
        style={{ height }}
      >
        <MapPin className="w-12 h-12 mb-2 text-gray-400" />
        <p className="text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative" style={{ height }}>
      {loading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  )
}
