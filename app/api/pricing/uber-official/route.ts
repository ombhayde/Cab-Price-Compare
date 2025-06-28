import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { pickup, dropoff } = await request.json()

    console.log("=== UBER OFFICIAL API SIMULATION ===")
    console.log("Note: Using official API structure with simulated data due to API restrictions")

    // Calculate distance and duration
    const distance = calculateDistance(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng)
    const duration = Math.round((distance / 25) * 3600) // 25 km/h average speed in seconds

    // Detect city for pricing
    const city = detectCity(pickup.address)
    const cityMultiplier = getCityMultiplier(city)

    // Calculate surge based on real-time factors
    const surgeMultiplier = calculateSurgeMultiplier()

    // Generate official API response format
    const officialResponse = {
      prices: [
        {
          localized_display_name: "UberGo",
          distance: Number.parseFloat(distance.toFixed(2)),
          display_name: "UberGo",
          product_id: generateProductId("ubergo", city),
          high_estimate: Math.round((50 + distance * 12) * cityMultiplier * surgeMultiplier * 1.2),
          low_estimate: Math.round((50 + distance * 12) * cityMultiplier * surgeMultiplier * 0.9),
          duration: duration,
          estimate: formatPriceEstimate(
            Math.round((50 + distance * 12) * cityMultiplier * surgeMultiplier * 0.9),
            Math.round((50 + distance * 12) * cityMultiplier * surgeMultiplier * 1.2),
          ),
          currency_code: "INR",
          surge_multiplier: surgeMultiplier,
          minimum: Math.round(80 * cityMultiplier),
        },
        {
          localized_display_name: "UberX",
          distance: Number.parseFloat(distance.toFixed(2)),
          display_name: "UberX",
          product_id: generateProductId("uberx", city),
          high_estimate: Math.round((70 + distance * 15) * cityMultiplier * surgeMultiplier * 1.2),
          low_estimate: Math.round((70 + distance * 15) * cityMultiplier * surgeMultiplier * 0.9),
          duration: duration,
          estimate: formatPriceEstimate(
            Math.round((70 + distance * 15) * cityMultiplier * surgeMultiplier * 0.9),
            Math.round((70 + distance * 15) * cityMultiplier * surgeMultiplier * 1.2),
          ),
          currency_code: "INR",
          surge_multiplier: surgeMultiplier,
          minimum: Math.round(100 * cityMultiplier),
        },
        {
          localized_display_name: "UberXL",
          distance: Number.parseFloat(distance.toFixed(2)),
          display_name: "UberXL",
          product_id: generateProductId("uberxl", city),
          high_estimate: Math.round((100 + distance * 18) * cityMultiplier * surgeMultiplier * 1.2),
          low_estimate: Math.round((100 + distance * 18) * cityMultiplier * surgeMultiplier * 0.9),
          duration: duration,
          estimate: formatPriceEstimate(
            Math.round((100 + distance * 18) * cityMultiplier * surgeMultiplier * 0.9),
            Math.round((100 + distance * 18) * cityMultiplier * surgeMultiplier * 1.2),
          ),
          currency_code: "INR",
          surge_multiplier: surgeMultiplier,
          minimum: Math.round(150 * cityMultiplier),
        },
      ],
    }

    return NextResponse.json({
      success: true,
      data: officialResponse,
      metadata: {
        source: "official_api_simulation",
        note: "Simulated using official Uber API structure due to access restrictions",
        city: city,
        surge_active: surgeMultiplier > 1.1,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Uber official API simulation error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
    })
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

  // Peak hours (8-10 AM, 5-8 PM)
  if ((currentHour >= 8 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 20)) {
    surge = 1.3 + Math.random() * 0.4
  }
  // Weekend nights
  else if ((currentDay === 5 || currentDay === 6) && currentHour >= 20) {
    surge = 1.2 + Math.random() * 0.3
  }
  // Regular hours
  else {
    surge = 1.0 + Math.random() * 0.2
  }

  // Weather factor (simulate rain/bad weather)
  if (Math.random() > 0.8) {
    surge *= 1.4
  }

  return Math.round(surge * 10) / 10
}

function generateProductId(productType: string, city: string): string {
  // Generate realistic product IDs similar to Uber's format
  const baseIds = {
    ubergo: "a1111c8c-c720-46c3-8534",
    uberx: "26546650-e557-4a7b-86e7",
    uberxl: "821415d8-3bd5-4e27-9604",
  }

  const cityCode = city.substring(0, 3).toUpperCase()
  const baseId = baseIds[productType] || "00000000-0000-0000-0000"

  return `${baseId}-${cityCode}${Math.random().toString(36).substring(2, 8)}`
}

function formatPriceEstimate(low: number, high: number): string {
  if (low === high) {
    return `₹${low}`
  }
  return `₹${low}-${high}`
}
