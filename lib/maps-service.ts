import type { LocationData } from "@/types"

// Google Maps API key - In production, this should be in environment variables
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY"

export async function searchPlaces(query: string): Promise<LocationData[]> {
  try {
    // For demo purposes, we'll simulate Google Places API
    // In production, you would use the actual Google Places API
    const mockPlaces: LocationData[] = [
      {
        address: `${query} - Connaught Place, New Delhi`,
        description: "Central Delhi, Delhi",
        lat: 28.6315 + Math.random() * 0.01,
        lng: 77.2167 + Math.random() * 0.01,
        placeId: `place_${Date.now()}_1`,
      },
      {
        address: `${query} - India Gate, New Delhi`,
        description: "Central Secretariat, Delhi",
        lat: 28.6129 + Math.random() * 0.01,
        lng: 77.2295 + Math.random() * 0.01,
        placeId: `place_${Date.now()}_2`,
      },
      {
        address: `${query} - Karol Bagh, New Delhi`,
        description: "West Delhi, Delhi",
        lat: 28.6519 + Math.random() * 0.01,
        lng: 77.1909 + Math.random() * 0.01,
        placeId: `place_${Date.now()}_3`,
      },
    ]

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    return mockPlaces.filter((place) => place.address.toLowerCase().includes(query.toLowerCase()))
  } catch (error) {
    console.error("Error searching places:", error)
    return []
  }
}

export async function getDistanceAndDuration(
  pickup: LocationData,
  dropoff: LocationData,
): Promise<{
  distance: string
  duration: string
  distanceValue: number
  durationValue: number
  traffic: string
}> {
  try {
    // Calculate actual distance using Haversine formula
    const distanceKm = calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng)
    const distanceValue = Math.round(distanceKm * 1000) // in meters

    // Estimate duration based on distance and traffic
    const baseSpeed = 25 // km/h average city speed
    const trafficMultiplier = 1 + Math.random() * 0.5 // 1.0 to 1.5x
    const durationHours = (distanceKm / baseSpeed) * trafficMultiplier
    const durationValue = Math.round(durationHours * 60) // in minutes

    // Determine traffic condition
    let traffic = "Light"
    if (trafficMultiplier > 1.3) traffic = "Heavy"
    else if (trafficMultiplier > 1.15) traffic = "Moderate"

    return {
      distance: `${distanceKm.toFixed(1)} km`,
      duration: `${durationValue} min`,
      distanceValue,
      durationValue,
      traffic,
    }
  } catch (error) {
    console.error("Error calculating distance:", error)
    throw error
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in kilometers
  return d
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}
