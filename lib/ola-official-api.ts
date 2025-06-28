import type { FareData, LocationData } from "@/types"

interface OlaApiParams {
  pickup: LocationData
  dropoff?: LocationData
  category?: string
  service_type?: string
}

// Official Ola API service using the exact V1 Products endpoint structure
export async function getOlaOfficialPricing(params: OlaApiParams): Promise<FareData> {
  console.log("=== CALLING OLA OFFICIAL V1 PRODUCTS API ===")

  const { pickup, dropoff, category, service_type = "p2p" } = params

  try {
    // Build query parameters exactly as per Ola API documentation
    const queryParams = new URLSearchParams({
      pickup_lat: pickup.lat.toString(),
      pickup_lng: pickup.lng.toString(),
      service_type,
    })

    if (dropoff) {
      queryParams.append("drop_lat", dropoff.lat.toString())
      queryParams.append("drop_lng", dropoff.lng.toString())
    }

    if (category) {
      queryParams.append("category", category)
    }

    // Call our implementation of the official Ola API
    const response = await fetch(`/api/pricing/ola-v1-products?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // In real implementation, these would be actual tokens
        "X-APP-TOKEN": "simulated-app-token",
        Authorization: "Bearer simulated-user-token",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Ola API Error: ${errorData.message} (${errorData.code})`)
    }

    const data = await response.json()
    console.log("Ola V1 Products API response:", data)

    // Transform the official API response to our FareData format
    return transformOlaApiResponse(data)
  } catch (error) {
    console.error("Ola Official API error:", error)
    throw error
  }
}

function transformOlaApiResponse(apiResponse: any): FareData {
  const { categories, ride_estimate, hotspot_zone, previous_cancellation_charges } = apiResponse

  // Transform categories to our ride format
  const rides = categories.map((category: any, index: number) => {
    const fareBreakup = category.fare_breakup[0]
    const estimate = ride_estimate[index]

    // Calculate price range from estimate or fare breakup
    let priceRange = { min: 0, max: 0 }

    if (estimate) {
      priceRange = {
        min: estimate.amount_min,
        max: estimate.amount_max,
      }
    } else {
      // Fallback to minimum fare if no estimate
      priceRange = {
        min: fareBreakup.minimum_fare,
        max: Math.round(fareBreakup.minimum_fare * 1.2),
      }
    }

    // Determine surge status
    const surge = fareBreakup.rates_higher_than_usual || (fareBreakup.surcharge && fareBreakup.surcharge.length > 0)
    const surgeMultiplier = surge && fareBreakup.surcharge ? fareBreakup.surcharge[0].multiplier : 1.0

    // Calculate discount if available
    let discount: number | undefined
    if (estimate && estimate.discounts && estimate.discounts.discount > 0) {
      discount = estimate.discounts.discount
    }

    return {
      type: category.display_name,
      priceRange,
      eta: category.eta > 0 ? category.eta : Math.floor(Math.random() * 10) + 5, // Handle -1 ETA
      surge,
      surgeMultiplier,
      rating: generateRating(category.id),
      reviewCount: generateReviewCount(category.id),
      features: getOlaFeatures(category.id),
      waitTime: category.eta > 0 ? category.eta : Math.floor(Math.random() * 8) + 2,
      discount,
    }
  })

  return {
    provider: "Ola",
    logo: "🟢",
    availability: categories.length > 0 ? "available" : "limited",
    bookingUrl: "https://book.olacabs.com",
    rides,
  }
}

function generateRating(categoryId: string): number {
  const baseRatings = {
    mini: 4.0,
    prime: 4.3,
    auto: 3.9,
    suv: 4.4,
    lux: 4.5,
  }

  const base = baseRatings[categoryId] || 4.0
  return Math.round((base + Math.random() * 0.3) * 10) / 10
}

function generateReviewCount(categoryId: string): number {
  const baseCounts = {
    mini: [800, 4000],
    prime: [400, 2500],
    auto: [1000, 5000],
    suv: [200, 1200],
    lux: [100, 800],
  }

  const range = baseCounts[categoryId] || [500, 2000]
  return Math.floor(Math.random() * (range[1] - range[0])) + range[0]
}

function getOlaFeatures(categoryId: string): string[] {
  const featureMap = {
    mini: ["AC", "4 Seats", "Economy", "Digital Payment"],
    prime: ["Premium", "AC", "4 Seats", "Sedan"],
    auto: ["3 Wheeler", "Open Air", "Quick", "Affordable"],
    suv: ["SUV", "6 Seats", "Extra Space", "AC"],
    lux: ["Luxury", "Premium Interior", "Professional Driver", "AC"],
  }

  return featureMap[categoryId] || ["AC", "Digital Payment"]
}

// Export function to get all supported categories
export function getOlaSupportedCategories(): string[] {
  return [
    "micro",
    "mini",
    "share",
    "prime",
    "suv",
    "prime_play",
    "auto",
    "lux",
    "rental",
    "outstation",
    "sedan",
    "exec",
    "bike",
    "erick",
    "kp",
    "electric_vehicle",
    "cool_cab",
  ]
}

// Export function to check if category is valid
export function isValidOlaCategory(category: string): boolean {
  return getOlaSupportedCategories().includes(category)
}
