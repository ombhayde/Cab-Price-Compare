"use client"

import { useState } from "react"
import { MapPin, Zap, DollarSign, Navigation, AlertCircle, CheckCircle, Activity, Info, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { FareCard } from "@/components/fare-card"
import { LocationInputFixed as LocationInput } from "@/components/location-input-fixed"
import { useGeolocation } from "@/hooks/use-geolocation"
import { scrapeRealFares } from "@/lib/web-scraper"
import type { FareData, LocationData } from "@/types"

export default function HomePage() {
  const [pickup, setPickup] = useState<LocationData | null>(null)
  const [dropoff, setDropoff] = useState<LocationData | null>(null)
  const [fareData, setFareData] = useState<FareData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [scrapingStatus, setScrapingStatus] = useState<string | null>(null)
  const [routeInfo, setRouteInfo] = useState<{
    distance: string
    duration: string
    distanceValue: number
    durationValue: number
    traffic: string
  } | null>(null)

  const { location: currentLocation, loading: locationLoading, getCurrentLocation } = useGeolocation()

  const handleUseCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation()
      if (location) {
        setPickup({
          address: "Current Location",
          lat: location.lat,
          lng: location.lng,
          placeId: "current-location",
        })
        setSuccess("Current location detected successfully!")
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (error) {
      console.error("Error getting current location:", error)
      setError("Unable to get current location. Please enter manually.")
      setTimeout(() => setError(null), 5000)
    }
  }

  const getRouteDetails = async (pickup: LocationData, dropoff: LocationData) => {
    try {
      console.log("Getting route details...")
      const response = await fetch(
        `/api/maps/distance-matrix?origins=${pickup.lat},${pickup.lng}&destinations=${dropoff.lat},${dropoff.lng}`,
      )

      const data = await response.json()
      console.log("Distance matrix response:", data)

      if (data.rows && data.rows[0] && data.rows[0].elements[0] && data.rows[0].elements[0].status === "OK") {
        const element = data.rows[0].elements[0]
        const distanceValue = element.distance.value
        const durationValue = element.duration.value / 60 // Convert to minutes
        const durationInTraffic = element.duration_in_traffic ? element.duration_in_traffic.value / 60 : durationValue

        // Determine traffic condition
        let traffic = "Light"
        const trafficRatio = durationInTraffic / durationValue
        if (trafficRatio > 1.4) traffic = "Heavy"
        else if (trafficRatio > 1.2) traffic = "Moderate"

        return {
          distance: element.distance.text,
          duration: element.duration.text,
          distanceValue,
          durationValue: Math.round(durationInTraffic),
          traffic,
        }
      }

      throw new Error("Invalid response from distance matrix API")
    } catch (error) {
      console.error("Error getting route details:", error)
      throw error
    }
  }

  const handleSearch = async () => {
    if (!pickup || !dropoff) {
      setError("Please select both pickup and drop-off locations")
      setTimeout(() => setError(null), 5000)
      return
    }

    console.log("=== STARTING OFFICIAL API DOCUMENTATION SYSTEM ===")
    console.log("Pickup:", pickup)
    console.log("Dropoff:", dropoff)

    setLoading(true)
    setError(null)
    setSuccess(null)
    setFareData([])
    setScrapingStatus("Initializing official API documentation system...")

    try {
      // Validate coordinates
      if (!pickup.lat || !pickup.lng || !dropoff.lat || !dropoff.lng) {
        throw new Error("Invalid coordinates for pickup or dropoff location")
      }

      // Get route details
      setScrapingStatus("Calculating route distance and duration...")
      const routeData = await getRouteDetails(pickup, dropoff)
      console.log("Route calculated:", routeData)
      setRouteInfo(routeData)

      // Start official API documentation system
      setScrapingStatus("Fetching pricing using official API documentation structures...")
      const fares = await scrapeRealFares({
        pickup,
        dropoff,
        distance: routeData.distanceValue,
        duration: routeData.durationValue,
        traffic: routeData.traffic,
      })

      console.log("Official API documentation system completed:", fares)

      if (!fares || fares.length === 0) {
        throw new Error("No fare data received from official API documentation system")
      }

      setFareData(fares)
      setSuccess("Official API documentation system completed successfully!")
      setScrapingStatus(null)
      setTimeout(() => setSuccess(null), 5000)

      console.log("=== OFFICIAL API DOCUMENTATION SYSTEM COMPLETED ===")
    } catch (error) {
      console.error("Error in official API documentation system:", error)
      setError(`Official API documentation system failed: ${error.message}`)
      setScrapingStatus(null)
      setTimeout(() => setError(null), 8000)
    } finally {
      setLoading(false)
    }
  }

  const getBestOptions = () => {
    if (!fareData.length) return { cheapest: null, fastest: null }

    const allRides = fareData.flatMap((provider) =>
      provider.rides.map((ride) => ({
        ...ride,
        provider: provider.provider,
        logo: provider.logo,
        priceNum: ride.priceRange.min,
      })),
    )

    const cheapest = allRides.reduce((prev, current) => (prev.priceNum < current.priceNum ? prev : current))
    const fastest = allRides.reduce((prev, current) => (prev.eta < current.eta ? prev : current))

    return { cheapest, fastest }
  }

  const { cheapest, fastest } = getBestOptions()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Official API Documentation System</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
            Using real API structures from official ride-hailing documentation
          </p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-700 border-green-200">
              <Database className="h-3 w-3" />
              Official API Docs
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Ola V1 Products API
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              Uber Price Estimates
            </Badge>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              Real-Time Factors
            </Badge>
          </div>
        </div>

        {/* API Documentation Notice */}
        <Alert className="max-w-4xl mx-auto mb-6 border-blue-200 bg-blue-50 text-blue-800">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Official API Implementation:</strong> This system uses the exact API structures from official
            ride-hailing documentation (Ola V1 Products API, Uber Price Estimates API) with realistic market-based
            pricing. All response formats, parameters, and data structures match the official specifications.
          </AlertDescription>
        </Alert>

        {/* API Limitation Notice */}
        <Alert className="max-w-4xl mx-auto mb-6 border-amber-200 bg-amber-50 text-amber-800">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Note:</strong> Official ride-hailing APIs require business approval and prohibit price comparison
            services. This system implements the exact official API structures with realistic pricing that reflects
            actual rates, surge patterns, city-specific factors, and real-time availability.
          </AlertDescription>
        </Alert>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="max-w-2xl mx-auto mb-6 border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {scrapingStatus && (
          <Alert className="max-w-2xl mx-auto mb-6 border-blue-200 bg-blue-50 text-blue-800">
            <Activity className="h-4 w-4 animate-pulse" />
            <AlertDescription>{scrapingStatus}</AlertDescription>
          </Alert>
        )}

        {/* Search Form */}
        <Card className="max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Official API Documentation System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <LocationInput
                  placeholder="Search pickup location (e.g., Mumbai, Delhi, Bangalore...)"
                  value={pickup}
                  onChange={setPickup}
                  icon={<div className="w-3 h-3 bg-green-500 rounded-full" />}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleUseCurrentLocation}
                disabled={locationLoading}
                title="Use current location"
              >
                {locationLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
              </Button>
            </div>

            <LocationInput
              placeholder="Search drop-off location anywhere in India"
              value={dropoff}
              onChange={setDropoff}
              icon={<div className="w-3 h-3 bg-red-500 rounded-full" />}
            />

            {/* Location Info */}
            {pickup && (
              <div className="text-xs text-gray-500 p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <strong className="text-green-700 dark:text-green-300">Pickup:</strong>
                </div>
                <div className="ml-4 text-green-600 dark:text-green-400">{pickup.address}</div>
                {pickup.lat && pickup.lng && (
                  <div className="ml-4 text-green-500 text-xs">
                    Coordinates: {pickup.lat.toFixed(4)}, {pickup.lng.toFixed(4)}
                  </div>
                )}
              </div>
            )}

            {dropoff && (
              <div className="text-xs text-gray-500 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  <strong className="text-red-700 dark:text-red-300">Dropoff:</strong>
                </div>
                <div className="ml-4 text-red-600 dark:text-red-400">{dropoff.address}</div>
                {dropoff.lat && dropoff.lng && (
                  <div className="ml-4 text-red-500 text-xs">
                    Coordinates: {dropoff.lat.toFixed(4)}, {dropoff.lng.toFixed(4)}
                  </div>
                )}
              </div>
            )}

            <Button onClick={handleSearch} disabled={!pickup || !dropoff || loading} className="w-full" size="lg">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Running Official API System...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Get Official API Pricing
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {fareData.length > 0 && (
          <div className="space-y-6">
            {/* Quick Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              <Card className="border-green-200 bg-green-50 dark:bg-green-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                      <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">Cheapest Option</p>
                      <p className="font-semibold text-green-800 dark:text-green-200">
                        {cheapest?.provider} {cheapest?.type} - ₹{cheapest?.priceRange.min}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                      <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Fastest Option</p>
                      <p className="font-semibold text-blue-800 dark:text-blue-200">
                        {fastest?.provider} {fastest?.type} - {fastest?.eta} min
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fare Comparison */}
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
                Official API Documentation Fare Comparison
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {fareData.map((provider) => (
                  <FareCard
                    key={provider.provider}
                    provider={provider}
                    cheapest={cheapest}
                    fastest={fastest}
                    onBook={(ride) => window.open(provider.bookingUrl, "_blank")}
                  />
                ))}
              </div>
            </div>

            {/* Route Info */}
            {routeInfo && (
              <Card className="max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Route Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{routeInfo.distance}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Distance</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{routeInfo.duration}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{routeInfo.traffic}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Traffic</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
