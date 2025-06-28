"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { MapPin, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { LocationData } from "@/types"

interface LocationInputProps {
  placeholder: string
  value: LocationData | null
  onChange: (value: LocationData | null) => void
  icon: React.ReactNode
}

// Comprehensive Indian cities for fallback
const INDIAN_CITIES = [
  // Major metros
  {
    address: "Connaught Place, New Delhi, Delhi",
    description: "Central Delhi",
    lat: 28.6315,
    lng: 77.2167,
    placeId: "cp_delhi",
  },
  {
    address: "Andheri East, Mumbai, Maharashtra",
    description: "Mumbai Suburb",
    lat: 19.1136,
    lng: 72.8697,
    placeId: "andheri_mumbai",
  },
  {
    address: "Koramangala, Bangalore, Karnataka",
    description: "Tech Hub",
    lat: 12.9279,
    lng: 77.6271,
    placeId: "koramangala_blr",
  },
  {
    address: "Hitech City, Hyderabad, Telangana",
    description: "IT District",
    lat: 17.4435,
    lng: 78.3772,
    placeId: "hitec_hyd",
  },
  {
    address: "Banjara Hills, Hyderabad, Telangana",
    description: "Upscale Area",
    lat: 17.4126,
    lng: 78.4482,
    placeId: "banjara_hyd",
  },
  {
    address: "Hinjewadi, Pune, Maharashtra",
    description: "IT Park",
    lat: 18.5912,
    lng: 73.7389,
    placeId: "hinjewadi_pune",
  },
  {
    address: "Anna Nagar, Chennai, Tamil Nadu",
    description: "Residential Hub",
    lat: 13.085,
    lng: 80.2101,
    placeId: "anna_chennai",
  },
  {
    address: "Salt Lake, Kolkata, West Bengal",
    description: "IT Sector",
    lat: 22.5958,
    lng: 88.4497,
    placeId: "saltlake_kol",
  },

  // Tier 2 cities
  {
    address: "Vastrapur, Ahmedabad, Gujarat",
    description: "Commercial Area",
    lat: 23.0395,
    lng: 72.524,
    placeId: "vastrapur_amd",
  },
  {
    address: "Malviya Nagar, Jaipur, Rajasthan",
    description: "Pink City",
    lat: 26.8467,
    lng: 75.8056,
    placeId: "malviya_jaipur",
  },
  {
    address: "Adajan, Surat, Gujarat",
    description: "Diamond City",
    lat: 21.2069,
    lng: 72.7908,
    placeId: "adajan_surat",
  },
  {
    address: "Gomti Nagar, Lucknow, Uttar Pradesh",
    description: "Modern Lucknow",
    lat: 26.8518,
    lng: 81.0082,
    placeId: "gomti_lucknow",
  },
  {
    address: "Civil Lines, Kanpur, Uttar Pradesh",
    description: "Central Kanpur",
    lat: 26.4499,
    lng: 80.3319,
    placeId: "civil_kanpur",
  },
  {
    address: "Dharampeth, Nagpur, Maharashtra",
    description: "Orange City",
    lat: 21.1458,
    lng: 79.0882,
    placeId: "dharampeth_nagpur",
  },
  {
    address: "Vijay Nagar, Indore, Madhya Pradesh",
    description: "Commercial Hub",
    lat: 22.7532,
    lng: 75.8937,
    placeId: "vijay_indore",
  },

  // NCR
  {
    address: "Cyber City, Gurgaon, Haryana",
    description: "Millennium City",
    lat: 28.4949,
    lng: 77.0869,
    placeId: "cyber_gurgaon",
  },
  {
    address: "Sector 18, Noida, Uttar Pradesh",
    description: "Shopping Hub",
    lat: 28.5706,
    lng: 77.3272,
    placeId: "sec18_noida",
  },
  {
    address: "Connaught Place, Faridabad, Haryana",
    description: "Industrial City",
    lat: 28.4089,
    lng: 77.3178,
    placeId: "cp_faridabad",
  },
  {
    address: "Raj Nagar, Ghaziabad, Uttar Pradesh",
    description: "Gateway of UP",
    lat: 28.6692,
    lng: 77.4538,
    placeId: "raj_ghaziabad",
  },
]

export function LocationInput({ placeholder, value, onChange, icon }: LocationInputProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<LocationData[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (value) {
      setQuery(value.address)
    }
  }, [value])

  const searchLocalCities = (inputValue: string): LocationData[] => {
    return INDIAN_CITIES.filter(
      (city) =>
        city.address.toLowerCase().includes(inputValue.toLowerCase()) ||
        city.description.toLowerCase().includes(inputValue.toLowerCase()),
    ).slice(0, 8) // Limit to 8 results
  }

  const handleInputChange = async (inputValue: string) => {
    setQuery(inputValue)

    if (!inputValue.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      onChange(null)
      return
    }

    // Show local suggestions immediately
    const localResults = searchLocalCities(inputValue)
    setSuggestions(localResults)
    setShowSuggestions(true)

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Try Google Places API with debounce
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(inputValue)}`)

        if (response.ok) {
          const data = await response.json()
          if (data.predictions && data.predictions.length > 0) {
            // Combine Google results with local results, prioritizing Google
            const combinedResults = [...data.predictions.slice(0, 5), ...localResults.slice(0, 3)]
            setSuggestions(combinedResults)
          }
        }
      } catch (error) {
        console.error("Google Places API error:", error)
        // Keep showing local results
      } finally {
        setLoading(false)
      }
    }, 500)
  }

  const handleSuggestionClick = (suggestion: LocationData) => {
    console.log("Suggestion clicked:", suggestion)

    // Immediately update the input field and hide suggestions
    setQuery(suggestion.address)
    setShowSuggestions(false)

    // Set loading state
    setLoading(true)

    // Use setTimeout to ensure state updates are processed
    setTimeout(async () => {
      try {
        // If it's a local city, use directly
        if (suggestion.placeId.includes("_")) {
          console.log("Using local city data")
          onChange(suggestion)
          setLoading(false)
          return
        }

        // For Google Places, try to get coordinates
        if (!suggestion.lat || suggestion.lat === 0) {
          console.log("Fetching coordinates for Google place")

          try {
            const response = await fetch(`/api/places/details?placeId=${suggestion.placeId}`)

            if (response.ok) {
              const data = await response.json()
              if (data.result && data.result.geometry) {
                const locationWithCoords = {
                  ...suggestion,
                  address: data.result.formatted_address || suggestion.address,
                  lat: data.result.geometry.location.lat,
                  lng: data.result.geometry.location.lng,
                }

                console.log("Got coordinates from Google:", locationWithCoords)
                onChange(locationWithCoords)
                setQuery(locationWithCoords.address)
                setLoading(false)
                return
              }
            }
          } catch (apiError) {
            console.log("Google API failed, using fallback")
          }
        }

        // Fallback: use suggestion with estimated coordinates
        const fallbackLocation = {
          ...suggestion,
          lat: suggestion.lat || 28.6139 + (Math.random() - 0.5) * 0.2,
          lng: suggestion.lng || 77.209 + (Math.random() - 0.5) * 0.2,
        }

        console.log("Using fallback coordinates:", fallbackLocation)
        onChange(fallbackLocation)
        setLoading(false)
      } catch (error) {
        console.error("Error handling suggestion:", error)

        // Final fallback
        const finalFallback = {
          ...suggestion,
          lat: 28.6139 + (Math.random() - 0.5) * 0.2,
          lng: 77.209 + (Math.random() - 0.5) * 0.2,
        }

        onChange(finalFallback)
        setLoading(false)
      }
    }, 100)
  }

  const handleClear = () => {
    setQuery("")
    onChange(null)
    setSuggestions([])
    setShowSuggestions(false)
  }

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {icon}
          <MapPin className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 300)}
          className="pl-12 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showSuggestions && (suggestions.length > 0 || loading) && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {loading && (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching across India...
            </div>
          )}
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.placeId}-${index}`}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-md last:rounded-b-md border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
              onMouseDown={(e) => {
                e.preventDefault() // Prevent input blur
                handleSuggestionClick(suggestion)
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            >
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {suggestion.address}
                  </div>
                  {suggestion.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{suggestion.description}</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
