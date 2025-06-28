import type { FareData, LocationData } from "@/types"
import { getOlaOfficialPricing } from "./ola-official-api"
import { getRapidoOfficialPricing } from "./rapido-official-api"

interface PricingParams {
  pickup: LocationData
  dropoff: LocationData
  distance: number
  duration: number
  traffic: string
}

// Enhanced official API service with real Rapido pricing
export async function getOfficialPricing(params: PricingParams): Promise<FareData[]> {
  console.log("=== ENHANCED OFFICIAL API SERVICE WITH REAL RAPIDO PRICING ===")
  console.log("Using official API structures with real night/day fares")

  const { pickup, dropoff } = params

  try {
    // Call all official API implementations in parallel
    const apiPromises = [
      fetch("/api/pricing/uber-official", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickup, dropoff }),
      }),
      getOlaOfficialPricing({ pickup, dropoff }), // Official Ola V1 Products API
      getRapidoOfficialPricing({ pickup, dropoff }), // Official Rapido V1 Estimate API with real pricing
    ]

    const responses = await Promise.allSettled(apiPromises)
    const fareData: FareData[] = []

    // Process Uber response
    if (responses[0].status === "fulfilled") {
      try {
        const uberResponse = await responses[0].value.json()
        if (uberResponse.success) {
          fareData.push(formatUberOfficialData(uberResponse.data))
        }
      } catch (error) {
        console.log("Uber API processing failed:", error)
      }
    }

    // Process Ola response (already formatted)
    if (responses[1].status === "fulfilled") {
      fareData.push(responses[1].value)
    } else {
      console.log("Ola Official API failed:", responses[1].reason)
    }

    // Process Rapido response (already formatted)
    if (responses[2].status === "fulfilled") {
      fareData.push(responses[2].value)
    } else {
      console.log("Rapido Official API failed:", responses[2].reason)
    }

    console.log("=== ENHANCED OFFICIAL API SERVICE COMPLETED ===")
    console.log(`Generated ${fareData.length} provider responses with real pricing`)

    return fareData
  } catch (error) {
    console.error("Enhanced official API service error:", error)
    throw error
  }
}

function formatUberOfficialData(data: any): FareData {
  return {
    provider: "Uber",
    logo: "🚗",
    availability: "available",
    bookingUrl: "https://m.uber.com/looking",
    rides: data.prices.map((price: any) => ({
      type: price.display_name,
      priceRange: {
        min: price.low_estimate,
        max: price.high_estimate,
      },
      eta: Math.round(price.duration / 60), // Convert seconds to minutes
      surge: price.surge_multiplier > 1.1,
      surgeMultiplier: price.surge_multiplier,
      rating: getProviderRating("uber", price.display_name),
      reviewCount: getProviderReviewCount("uber"),
      features: getUberFeatures(price.display_name),
      waitTime: Math.floor(Math.random() * 8) + 2,
      discount: Math.random() > 0.7 ? Math.floor(Math.random() * 15) + 5 : undefined,
    })),
  }
}

function getProviderRating(provider: string, vehicleType: string): number {
  const baseRatings = {
    uber: 4.2,
    ola: 4.0,
    rapido: 4.1,
  }

  const typeBonus = {
    uberx: 0.3,
    "ola prime": 0.3,
    "rapido bike": 0.1,
  }

  const base = baseRatings[provider] || 4.0
  const bonus = typeBonus[vehicleType?.toLowerCase()] || 0
  return Math.round((base + bonus + Math.random() * 0.2) * 10) / 10
}

function getProviderReviewCount(provider: string): number {
  const baseCounts = {
    uber: [500, 2500],
    ola: [800, 4000],
    rapido: [2000, 8000],
  }

  const range = baseCounts[provider] || [500, 2000]
  return Math.floor(Math.random() * (range[1] - range[0])) + range[0]
}

function getUberFeatures(vehicleType: string): string[] {
  const baseFeatures = ["AC", "GPS Tracking", "Digital Payment"]

  switch (vehicleType?.toLowerCase()) {
    case "ubergo":
      return [...baseFeatures, "4 Seats", "Economy"]
    case "uberx":
      return [...baseFeatures, "4 Seats", "Premium", "Professional Driver"]
    case "uberxl":
      return [...baseFeatures, "6 Seats", "SUV", "Extra Space"]
    default:
      return baseFeatures
  }
}
