import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { pickup, dropoff } = await request.json()

    console.log("=== RAPIDO OFFICIAL API SIMULATION ===")
    console.log("Note: Using realistic API structure for bike and auto rides")

    const distance = calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng)
    const bikeDuration = Math.round((distance / 30) * 60) // 30 km/h for bikes
    const autoDuration = Math.round((distance / 22) * 60) // 22 km/h for autos

    const city = detectCity(pickup.address)
    const cityMultiplier = getCityMultiplier(city)
    const surgeMultiplier = calculateSurgeMultiplier()

    // Rapido API response format
    const rapidoResponse = {
      rides: [
        {
          ride_type: "bike",
          vehicle_type: "Rapido Bike",
          display_name: "Bike",
          fare: {
            min_fare: Math.round((20 + distance * 4) * cityMultiplier * surgeMultiplier * 0.9),
            max_fare: Math.round((20 + distance * 4) * cityMultiplier * surgeMultiplier * 1.1),
            base_fare: Math.round(20 * cityMultiplier),
            per_km_rate: Math.round(4 * cityMultiplier),
            per_minute_rate: Math.round(1 * cityMultiplier),
          },
          eta: bikeDuration + Math.floor(Math.random() * 3) + 1,
          pickup_eta: Math.floor(Math.random() * 5) + 1,
          surge_active: surgeMultiplier > 1.1,
          surge_multiplier: surgeMultiplier * 0.85, // Rapido has lower surge
          currency: "INR",
          distance_km: Number.parseFloat(distance.toFixed(2)),
          duration_minutes: bikeDuration,
          features: ["Fast", "Eco-friendly", "Beat Traffic", "Helmet Provided"],
        },
        {
          ride_type: "auto",
          vehicle_type: "Rapido Auto",
          display_name: "Auto",
          fare: {
            min_fare: Math.round((30 + distance * 6) * cityMultiplier * surgeMultiplier * 0.9),
            max_fare: Math.round((30 + distance * 6) * cityMultiplier * surgeMultiplier * 1.1),
            base_fare: Math.round(30 * cityMultiplier),
            per_km_rate: Math.round(6 * cityMultiplier),
            per_minute_rate: Math.round(1.3 * cityMultiplier),
          },
          eta: autoDuration + Math.floor(Math.random() * 4) + 2,
          pickup_eta: Math.floor(Math.random() * 7) + 2,
          surge_active: surgeMultiplier > 1.1,
          surge_multiplier: surgeMultiplier * 0.85,
          currency: "INR",
          distance_km: Number.parseFloat(distance.toFixed(2)),
          duration_minutes: autoDuration,
          features: ["3 Wheeler", "Affordable", "Quick", "Digital Payment"],
        },
      ],
    }

    return NextResponse.json({
      success: true,
      data: rapidoResponse,
      metadata: {
        source: "official_api_simulation",
        note: "Simulated using realistic Rapido API structure with market pricing",
        city: city,
        surge_active: surgeMultiplier > 1.1,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Rapido official API simulation error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
    })
  }
}

// Helper functions (same as others)
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
    surge = 1.1 + Math.random() * 0.2 // Rapido has minimal surge
  } else if ((currentDay === 5 || currentDay === 6) && currentHour >= 20) {
    surge = 1.05 + Math.random() * 0.15
  } else {
    surge = 1.0 + Math.random() * 0.1
  }

  if (Math.random() > 0.85) {
    surge *= 1.2 // Weather factor (less impact than others)
  }

  return Math.round(surge * 10) / 10
}
