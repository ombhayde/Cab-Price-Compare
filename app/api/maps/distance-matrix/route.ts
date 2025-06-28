import { type NextRequest, NextResponse } from "next/server"

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const origins = searchParams.get("origins")
    const destinations = searchParams.get("destinations")

    if (!origins || !destinations) {
      return NextResponse.json({ error: "Origins and destinations are required" }, { status: 400 })
    }

    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "YOUR_API_KEY") {
      console.log("Google Maps API key not configured, using fallback calculation")

      // Parse coordinates
      const [originLat, originLng] = origins.split(",").map(Number)
      const [destLat, destLng] = destinations.split(",").map(Number)

      // Calculate distance using Haversine formula
      const distance = calculateDistance(originLat, originLng, destLat, destLng)
      const distanceValue = Math.round(distance * 1000) // in meters
      const durationValue = Math.round((distance / 25) * 3600) // assuming 25 km/h average speed, in seconds

      return NextResponse.json({
        rows: [
          {
            elements: [
              {
                status: "OK",
                distance: {
                  text: `${distance.toFixed(1)} km`,
                  value: distanceValue,
                },
                duration: {
                  text: `${Math.round(durationValue / 60)} mins`,
                  value: durationValue,
                },
                duration_in_traffic: {
                  text: `${Math.round((durationValue * 1.2) / 60)} mins`,
                  value: Math.round(durationValue * 1.2),
                },
              },
            ],
          },
        ],
      })
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?` +
        `origins=${encodeURIComponent(origins)}&` +
        `destinations=${encodeURIComponent(destinations)}&` +
        `departure_time=now&` +
        `traffic_model=best_guess&` +
        `key=${GOOGLE_MAPS_API_KEY}`,
    )

    const data = await response.json()

    if (data.status === "OK") {
      return NextResponse.json(data)
    } else {
      console.error("Google Distance Matrix API error:", data.status, data.error_message)
      return NextResponse.json({ error: "Failed to calculate distance" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in distance matrix:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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
  const d = R * c
  return d
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}
