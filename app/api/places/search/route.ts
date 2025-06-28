import { type NextRequest, NextResponse } from "next/server"
import { searchPlaces } from "@/lib/maps-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
    }

    const places = await searchPlaces(query)
    return NextResponse.json({ places })
  } catch (error) {
    console.error("Error searching places:", error)
    return NextResponse.json({ error: "Failed to search places" }, { status: 500 })
  }
}
