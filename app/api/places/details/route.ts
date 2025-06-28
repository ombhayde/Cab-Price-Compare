import { type NextRequest, NextResponse } from "next/server"

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const placeId = searchParams.get("placeId")

    if (!placeId) {
      return NextResponse.json({ error: "Place ID is required" }, { status: 400 })
    }

    // Check if API key is available
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "YOUR_API_KEY") {
      console.log("Google Maps API key not configured")
      return NextResponse.json({ result: null }, { status: 200 })
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?` +
        `place_id=${placeId}&` +
        `fields=geometry,formatted_address,name&` +
        `key=${GOOGLE_MAPS_API_KEY}`,
    )

    const data = await response.json()

    if (data.status === "OK") {
      return NextResponse.json({ result: data.result })
    } else {
      console.error("Google Places Details API error:", data.status, data.error_message)
      return NextResponse.json({ result: null }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in place details:", error)
    return NextResponse.json({ result: null }, { status: 500 })
  }
}
