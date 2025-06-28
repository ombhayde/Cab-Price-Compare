import { type NextRequest, NextResponse } from "next/server"
import { calculateFares } from "@/lib/fare-calculator"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pickup, dropoff, distance, duration, traffic } = body

    if (!pickup || !dropoff) {
      return NextResponse.json({ error: "Pickup and dropoff locations are required" }, { status: 400 })
    }

    const fares = await calculateFares({
      pickup,
      dropoff,
      distance,
      duration,
      traffic,
    })

    return NextResponse.json({ fares })
  } catch (error) {
    console.error("Error calculating fares:", error)
    return NextResponse.json({ error: "Failed to calculate fares" }, { status: 500 })
  }
}
