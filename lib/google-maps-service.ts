import type { LocationData } from "@/types"

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export async function getRouteDetails(
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
    const response = await fetch(
      `/api/maps/distance-matrix?origins=${pickup.lat},${pickup.lng}&destinations=${dropoff.lat},${dropoff.lng}`,
    )

    const data = await response.json()

    if (data.rows && data.rows[0] && data.rows[0].elements[0]) {
      const element = data.rows[0].elements[0]

      if (element.status === "OK") {
        const distanceValue = element.distance.value
        const durationValue = element.duration.value / 60 // Convert to minutes
        const durationInTraffic = element.duration_in_traffic ? element.duration_in_traffic.value / 60 : durationValue

        // Determine traffic condition based on duration difference
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
    }

    throw new Error("Invalid response from Google Maps API")
  } catch (error) {
    console.error("Error getting route details:", error)
    throw error
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`)
    const data = await response.json()
    return data.address || `${lat}, ${lng}`
  } catch (error) {
    console.error("Error reverse geocoding:", error)
    return `${lat}, ${lng}`
  }
}
