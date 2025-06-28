import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { pickup, dropoff } = await request.json()

    console.log("=== OLA OFFICIAL API SIMULATION ===")
    console.log("Note: Using realistic API structure with market-based pricing")

    const distance = calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng)
    const duration = Math.round((distance / 23) * 60) // 23 km/h average speed in minutes

    const city = detectCity(pickup.address)
    const cityMultiplier = getCityMultiplier(city)
    const surgeMultiplier = calculateSurgeMultiplier()

    // Ola API response format (based on their actual structure)
    const olaResponse = {
      categories: [
        {
          id: "mini",
          display_name: "Ola Mini",
          category_display_name: "Mini",
          min_fare: Math.round((45 + distance * 10) * cityMultiplier * surgeMultiplier * 0.9),
          max_fare: Math.round((45 + distance * 10) * cityMultiplier * surgeMultiplier * 1.1),
          fare_breakup: {
            base_fare: Math.round(45 * cityMultiplier),
            per_km: Math.round(10 * cityMultiplier),
            per_minute: Math.round(1.8 * cityMultiplier),
          },
          eta: duration + Math.floor(Math.random() * 5) + 2,
          pickup_eta: Math.floor(Math.random() * 8) + 2,
          surge_active: surgeMultiplier > 1.1,
          surge_multiplier: surgeMultiplier,
          currency: "INR",
          distance_km: Number.parseFloat(distance.toFixed(2)),
          duration_minutes: duration,
        },
        {
          id: "prime",
          display_name: "Ola Prime",
          category_display_name: "Prime",
          min_fare: Math.round((65 + distance * 13) * cityMultiplier * surgeMultiplier * 0.9),
          max_fare: Math.round((65 + distance * 13) * cityMultiplier * surgeMultiplier * 1.1),
          fare_breakup: {
            base_fare: Math.round(65 * cityMultiplier),
            per_km: Math.round(13 * cityMultiplier),
            per_minute: Math.round(2.2 * cityMultiplier),
          },
          eta: duration + Math.floor(Math.random() * 6) + 3,
          pickup_eta: Math.floor(Math.random() * 10) + 3,
          surge_active: surgeMultiplier > 1.1,
          surge_multiplier: surgeMultiplier,
          currency: "INR",
          distance_km: Number.parseFloat(distance.toFixed(2)),
          duration_minutes: duration,
        },
        {
          id: "auto",
          display_name: "Ola Auto",
          category_display_name: "Auto",
          min_fare: Math.round((25 + distance * 7) * cityMultiplier * surgeMultiplier * 0.8 * 0.9),
          max_fare: Math.round((25 + distance * 7) * cityMultiplier * surgeMultiplier * 0.8 * 1.1),
          fare_breakup: {
            base_fare: Math.round(25 * cityMultiplier),
            per_km: Math.round(7 * cityMultiplier),
            per_minute: Math.round(1.2 * cityMultiplier),
          },
          eta: Math.round(duration * 0.8) + Math.floor(Math.random() * 4) + 1,
          pickup_eta: Math.floor(Math.random() * 6) + 1,
          surge_active: surgeMultiplier > 1.2,
          surge_multiplier: surgeMultiplier * 0.8,
          currency: "INR",
          distance_km: Number.parseFloat(distance.toFixed(2)),
          duration_minutes: Math.round(duration * 0.8),
        },
      ],
    }

    return NextResponse.json({
      success: true,
      data: olaResponse,
      metadata: {
        source: "official_api_simulation",
        note: "Simulated using realistic Ola API structure with market pricing",
        city: city,
        surge_active: surgeMultiplier > 1.1,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Ola official API simulation error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
    })
  }
}

// Helper functions (same as Uber)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

function detectCity(address: string): string {
  const addressLower = address.toLowerCase()
  if (addressLower.includes("mumbai") || addressLower.includes("bombay")) return "mumbai"
  if (addressLower.includes("delhi") || addressLower.includes("gurgaon") || addressLower.includes("noida"))
    return "delhi"
  if (addressLower.includes("bangalore") || addressLower.includes("bengaluru")) return "bangalore"
  if (addressLower.includes("hyderabad")) return "hyderabad"
  if (addressLower.includes("pune")) return "pune"
  if (addressLower.includes("chennai")) return "chennai"
  if (addressLower.includes("kolkata")) return "kolkata"
  return "other"
}

function getCityMultiplier(city: string): number {
  const multipliers = {
    mumbai: 1.3,
    delhi: 1.2,
    bangalore: 1.25,
    hyderabad: 1.15,
    pune: 1.1,
    chennai: 1.15,
    kolkata: 1.05,
    other: 0.9,
  }
  return multipliers[city] || 0.9
}

function calculateSurgeMultiplier(): number {
  const currentHour = new Date().getHours()
  const currentDay = new Date().getDay()

  let surge = 1.0

  if ((currentHour >= 8 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 20)) {
    surge = 1.2 + Math.random() * 0.3 // Ola typically has lower surge than Uber
  } else if ((currentDay === 5 || currentDay === 6) && currentHour >= 20) {
    surge = 1.15 + Math.random() * 0.25
  } else {
    surge = 1.0 + Math.random() * 0.15
  }

  if (Math.random() > 0.8) {
    surge *= 1.3 // Weather factor
  }

  return Math.round(surge * 10) / 10
}
