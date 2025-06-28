import { type NextRequest, NextResponse } from "next/server"

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const input = searchParams.get("input")

    if (!input) {
      return NextResponse.json({ error: "Input parameter is required" }, { status: 400 })
    }

    // Check if API key is available
    if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === "YOUR_API_KEY") {
      console.log("Google Maps API key not configured")
      return NextResponse.json({ predictions: [] }, { status: 200 })
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?` +
        `input=${encodeURIComponent(input)}&` +
        `key=${GOOGLE_MAPS_API_KEY}&` +
        `components=country:in&` +
        `types=establishment|geocode&` +
        `language=en`,
    )

    const data = await response.json()

    if (data.status === "OK") {
      const predictions = data.predictions.map((prediction: any) => ({
        address: prediction.description,
        description: prediction.structured_formatting.secondary_text || prediction.structured_formatting.main_text,
        placeId: prediction.place_id,
        lat: 0, // Will be filled when place details are fetched
        lng: 0,
        types: prediction.types,
      }))

      return NextResponse.json({ predictions })
    } else if (data.status === "ZERO_RESULTS") {
      return NextResponse.json({ predictions: [] })
    } else {
      console.error("Google Places API error:", data.status, data.error_message)
      return NextResponse.json({ error: "Places API error" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in places autocomplete:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
