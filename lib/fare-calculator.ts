import type { FareData, LocationData } from "@/types"

interface FareCalculationParams {
  pickup: LocationData
  dropoff: LocationData
  distance: number // in meters
  duration: number // in minutes
  traffic: string
}

export async function calculateFares(params: FareCalculationParams): Promise<FareData[]> {
  const { distance, duration, traffic } = params
  const distanceKm = distance / 1000

  // Base rates per km for different services
  const baseRates = {
    uber: { min: 12, max: 15 },
    ola: { min: 10, max: 13 },
    rapido: { min: 6, max: 8 },
  }

  // Surge pricing based on time and traffic
  const surgeMultiplier = calculateSurgeMultiplier(traffic)

  // Time-based pricing (peak hours)
  const currentHour = new Date().getHours()
  const isPeakHour = (currentHour >= 8 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 20)
  const peakMultiplier = isPeakHour ? 1.2 : 1.0

  const fareData: FareData[] = [
    {
      provider: "Uber",
      logo: "🚗",
      availability: "available",
      rides: [
        {
          type: "UberGo",
          priceRange: calculatePriceRange(distanceKm, baseRates.uber, 1.0, peakMultiplier),
          eta: Math.max(2, Math.round(duration * 0.8)),
          surge: surgeMultiplier.uber > 1.0,
          surgeMultiplier: surgeMultiplier.uber,
          rating: 4.2,
          reviewCount: 1250,
          features: ["AC", "4 Seats", "GPS Tracking"],
          waitTime: Math.round(Math.random() * 5) + 2,
          discount: Math.random() > 0.7 ? 10 : undefined,
        },
        {
          type: "UberX",
          priceRange: calculatePriceRange(distanceKm, baseRates.uber, 1.3, peakMultiplier),
          eta: Math.max(3, Math.round(duration * 0.9)),
          surge: surgeMultiplier.uber > 1.0,
          surgeMultiplier: surgeMultiplier.uber,
          rating: 4.5,
          reviewCount: 890,
          features: ["Premium", "AC", "4 Seats", "Professional Driver"],
          waitTime: Math.round(Math.random() * 7) + 3,
        },
        {
          type: "UberXL",
          priceRange: calculatePriceRange(distanceKm, baseRates.uber, 1.8, peakMultiplier),
          eta: Math.max(4, Math.round(duration * 1.1)),
          surge: surgeMultiplier.uber > 1.0,
          surgeMultiplier: surgeMultiplier.uber,
          rating: 4.4,
          reviewCount: 456,
          features: ["SUV", "6 Seats", "Extra Space", "AC"],
          waitTime: Math.round(Math.random() * 8) + 4,
        },
      ],
    },
    {
      provider: "Ola",
      logo: "🟢",
      availability: "available",
      rides: [
        {
          type: "Ola Mini",
          priceRange: calculatePriceRange(distanceKm, baseRates.ola, 0.9, peakMultiplier),
          eta: Math.max(3, Math.round(duration * 0.85)),
          surge: surgeMultiplier.ola > 1.0,
          surgeMultiplier: surgeMultiplier.ola,
          rating: 4.0,
          reviewCount: 2100,
          features: ["AC", "4 Seats", "Economy"],
          waitTime: Math.round(Math.random() * 6) + 2,
          discount: Math.random() > 0.6 ? 15 : undefined,
        },
        {
          type: "Ola Prime",
          priceRange: calculatePriceRange(distanceKm, baseRates.ola, 1.2, peakMultiplier),
          eta: Math.max(4, Math.round(duration * 0.95)),
          surge: surgeMultiplier.ola > 1.0,
          surgeMultiplier: surgeMultiplier.ola,
          rating: 4.3,
          reviewCount: 1680,
          features: ["Premium", "AC", "4 Seats", "Sedan"],
          waitTime: Math.round(Math.random() * 7) + 3,
        },
        {
          type: "Ola Auto",
          priceRange: calculatePriceRange(distanceKm, { min: 8, max: 10 }, 0.8, peakMultiplier),
          eta: Math.max(2, Math.round(duration * 0.7)),
          surge: surgeMultiplier.ola > 1.2,
          surgeMultiplier: surgeMultiplier.ola,
          rating: 3.9,
          reviewCount: 3200,
          features: ["3 Wheeler", "Open Air", "Quick"],
          waitTime: Math.round(Math.random() * 4) + 1,
        },
      ],
    },
    {
      provider: "Rapido",
      logo: "🏍️",
      availability: "available",
      rides: [
        {
          type: "Rapido Bike",
          priceRange: calculatePriceRange(distanceKm, baseRates.rapido, 0.7, peakMultiplier),
          eta: Math.max(1, Math.round(duration * 0.6)),
          surge: surgeMultiplier.rapido > 1.0,
          surgeMultiplier: surgeMultiplier.rapido,
          rating: 4.1,
          reviewCount: 5600,
          features: ["Fast", "Eco-friendly", "Beat Traffic"],
          waitTime: Math.round(Math.random() * 3) + 1,
          discount: Math.random() > 0.5 ? 20 : undefined,
        },
        {
          type: "Rapido Auto",
          priceRange: calculatePriceRange(distanceKm, { min: 9, max: 11 }, 0.85, peakMultiplier),
          eta: Math.max(2, Math.round(duration * 0.75)),
          surge: surgeMultiplier.rapido > 1.1,
          surgeMultiplier: surgeMultiplier.rapido,
          rating: 3.8,
          reviewCount: 2800,
          features: ["3 Wheeler", "Affordable", "Quick"],
          waitTime: Math.round(Math.random() * 5) + 2,
        },
      ],
    },
  ]

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return fareData
}

function calculatePriceRange(
  distanceKm: number,
  baseRate: { min: number; max: number },
  multiplier: number,
  peakMultiplier: number,
): { min: number; max: number } {
  const baseFare = 50 // Base fare in rupees
  const minPrice = Math.round((baseFare + distanceKm * baseRate.min) * multiplier * peakMultiplier)
  const maxPrice = Math.round((baseFare + distanceKm * baseRate.max) * multiplier * peakMultiplier)

  return { min: minPrice, max: maxPrice }
}

function calculateSurgeMultiplier(traffic: string): { uber: number; ola: number; rapido: number } {
  const currentHour = new Date().getHours()
  const isRushHour = (currentHour >= 8 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 20)

  let baseSurge = 1.0

  if (traffic === "Heavy") baseSurge = 1.4
  else if (traffic === "Moderate") baseSurge = 1.2

  if (isRushHour) baseSurge *= 1.1

  // Add some randomness and provider-specific variations
  return {
    uber: Math.round((baseSurge + (Math.random() * 0.2 - 0.1)) * 10) / 10,
    ola: Math.round((baseSurge * 0.95 + (Math.random() * 0.2 - 0.1)) * 10) / 10,
    rapido: Math.round((baseSurge * 0.9 + (Math.random() * 0.15 - 0.075)) * 10) / 10,
  }
}
