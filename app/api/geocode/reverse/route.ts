import { type NextRequest, NextResponse } from "next/server"

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")

    if (!lat || !lng) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`,
    )

    const data = await response.json()

    if (data.status === "OK" && data.results.length > 0) {
      const address = data.results[0].formatted_address
      return NextResponse.json({ address })
    } else {
      console.error("Google Geocoding API error:", data.status, data.error_message)
      return NextResponse.json({ error: "Failed to reverse geocode" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in reverse geocoding:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
