import type { FareData, LocationData } from "@/types"

interface FareCalculationParams {
  pickup: LocationData
  dropoff: LocationData
  distance: number // in meters
  duration: number // in minutes
  traffic: string
}

// Enhanced pricing model based on real-world data (2024)
const ENHANCED_PRICING = {
  uber: {
    go: {
      baseFare: 50,
      perKm: 12,
      perMin: 2,
      minFare: 80,
      bookingFee: 5,
      serviceTax: 0.05, // 5%
    },
    x: {
      baseFare: 60,
      perKm: 15,
      perMin: 2.5,
      minFare: 100,
      bookingFee: 8,
      serviceTax: 0.05,
    },
    xl: {
      baseFare: 80,
      perKm: 18,
      perMin: 3,
      minFare: 150,
      bookingFee: 10,
      serviceTax: 0.05,
    },
  },
  ola: {
    mini: {
      baseFare: 45,
      perKm: 10,
      perMin: 1.8,
      minFare: 75,
      bookingFee: 4,
      serviceTax: 0.05,
    },
    prime: {
      baseFare: 55,
      perKm: 13,
      perMin: 2.2,
      minFare: 95,
      bookingFee: 6,
      serviceTax: 0.05,
    },
    auto: {
      baseFare: 20,
      perKm: 7,
      perMin: 1.2,
      minFare: 35,
      bookingFee: 2,
      serviceTax: 0.03,
    },
  },
  rapido: {
    bike: {
      baseFare: 15,
      perKm: 4,
      perMin: 1,
      minFare: 25,
      bookingFee: 2,
      serviceTax: 0.03,
    },
    auto: {
      baseFare: 22,
      perKm: 6,
      perMin: 1.3,
      minFare: 38,
      bookingFee: 3,
      serviceTax: 0.03,
    },
  },
}

export async function calculateRealTimeFares(params: FareCalculationParams): Promise<FareData[]> {
  console.log("Enhanced fare calculator started with params:", params)

  const { distance, duration, traffic } = params
  const distanceKm = distance / 1000

  // Ensure minimum distance for calculation
  const effectiveDistance = Math.max(distanceKm, 1)
  const effectiveDuration = Math.max(duration, 5)

  console.log("Effective distance:", effectiveDistance, "km")
  console.log("Effective duration:", effectiveDuration, "min")

  // Calculate dynamic surge based on multiple factors
  const surgeData = calculateDynamicSurge(traffic, effectiveDistance)
  console.log("Surge data:", surgeData)

  // Peak hour calculation
  const currentHour = new Date().getHours()
  const isPeakHour = (currentHour >= 8 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 20)
  const peakMultiplier = isPeakHour ? 1.15 : 1.0

  console.log("Peak hour:", isPeakHour, "Multiplier:", peakMultiplier)

  // Generate availability status
  const availability = generateAvailability()

  const fareData: FareData[] = [
    {
      provider: "Uber",
      logo: "🚗",
      availability: availability.uber,
      bookingUrl: "https://m.uber.com/looking",
      rides: [
        {
          type: "UberGo",
          priceRange: calculateEnhancedPrice(
            ENHANCED_PRICING.uber.go,
            effectiveDistance,
            effectiveDuration,
            surgeData.uber,
            peakMultiplier,
          ),
          eta: calculateETA(effectiveDuration, 0.8, 2, 5),
          surge: surgeData.uber > 1.0,
          surgeMultiplier: surgeData.uber,
          rating: generateRating(4.0, 4.5),
          reviewCount: generateReviewCount(500, 2500),
          features: ["AC", "4 Seats", "GPS Tracking", "Digital Payment"],
          waitTime: generateWaitTime(2, 7),
          discount: generateDiscount(0.3, 5, 15),
        },
        {
          type: "UberX",
          priceRange: calculateEnhancedPrice(
            ENHANCED_PRICING.uber.x,
            effectiveDistance,
            effectiveDuration,
            surgeData.uber,
            peakMultiplier,
          ),
          eta: calculateETA(effectiveDuration, 0.9, 3, 7),
          surge: surgeData.uber > 1.0,
          surgeMultiplier: surgeData.uber,
          rating: generateRating(4.3, 4.7),
          reviewCount: generateReviewCount(300, 1800),
          features: ["Premium", "AC", "4 Seats", "Professional Driver"],
          waitTime: generateWaitTime(3, 10),
        },
        {
          type: "UberXL",
          priceRange: calculateEnhancedPrice(
            ENHANCED_PRICING.uber.xl,
            effectiveDistance,
            effectiveDuration,
            surgeData.uber,
            peakMultiplier,
          ),
          eta: calculateETA(effectiveDuration, 1.1, 4, 10),
          surge: surgeData.uber > 1.0,
          surgeMultiplier: surgeData.uber,
          rating: generateRating(4.2, 4.6),
          reviewCount: generateReviewCount(200, 1000),
          features: ["SUV", "6 Seats", "Extra Space", "AC"],
          waitTime: generateWaitTime(4, 12),
        },
      ],
    },
    {
      provider: "Ola",
      logo: "🟢",
      availability: availability.ola,
      bookingUrl: "https://book.olacabs.com",
      rides: [
        {
          type: "Ola Mini",
          priceRange: calculateEnhancedPrice(
            ENHANCED_PRICING.ola.mini,
            effectiveDistance,
            effectiveDuration,
            surgeData.ola,
            peakMultiplier,
          ),
          eta: calculateETA(effectiveDuration, 0.85, 3, 8),
          surge: surgeData.ola > 1.0,
          surgeMultiplier: surgeData.ola,
          rating: generateRating(3.8, 4.3),
          reviewCount: generateReviewCount(800, 4000),
          features: ["AC", "4 Seats", "Economy", "Digital Payment"],
          waitTime: generateWaitTime(2, 8),
          discount: generateDiscount(0.4, 10, 25),
        },
        {
          type: "Ola Prime",
          priceRange: calculateEnhancedPrice(
            ENHANCED_PRICING.ola.prime,
            effectiveDistance,
            effectiveDuration,
            surgeData.ola,
            peakMultiplier,
          ),
          eta: calculateETA(effectiveDuration, 0.95, 4, 9),
          surge: surgeData.ola > 1.0,
          surgeMultiplier: surgeData.ola,
          rating: generateRating(4.1, 4.5),
          reviewCount: generateReviewCount(400, 2500),
          features: ["Premium", "AC", "4 Seats", "Sedan"],
          waitTime: generateWaitTime(3, 10),
        },
        {
          type: "Ola Auto",
          priceRange: calculateEnhancedPrice(
            ENHANCED_PRICING.ola.auto,
            effectiveDistance,
            effectiveDuration,
            surgeData.ola * 0.9,
            peakMultiplier,
          ),
          eta: calculateETA(effectiveDuration, 0.7, 2, 6),
          surge: surgeData.ola > 1.2,
          surgeMultiplier: surgeData.ola * 0.9,
          rating: generateRating(3.6, 4.1),
          reviewCount: generateReviewCount(1000, 5000),
          features: ["3 Wheeler", "Open Air", "Quick", "Affordable"],
          waitTime: generateWaitTime(1, 5),
        },
      ],
    },
    {
      provider: "Rapido",
      logo: "🏍️",
      availability: availability.rapido,
      bookingUrl: "https://rapido.bike",
      rides: [
        {
          type: "Rapido Bike",
          priceRange: calculateEnhancedPrice(
            ENHANCED_PRICING.rapido.bike,
            effectiveDistance,
            effectiveDuration,
            surgeData.rapido,
            peakMultiplier,
          ),
          eta: calculateETA(effectiveDuration, 0.6, 1, 4),
          surge: surgeData.rapido > 1.0,
          surgeMultiplier: surgeData.rapido,
          rating: generateRating(3.9, 4.4),
          reviewCount: generateReviewCount(2000, 8000),
          features: ["Fast", "Eco-friendly", "Beat Traffic", "Helmet Provided"],
          waitTime: generateWaitTime(1, 4),
          discount: generateDiscount(0.5, 15, 30),
        },
        {
          type: "Rapido Auto",
          priceRange: calculateEnhancedPrice(
            ENHANCED_PRICING.rapido.auto,
            effectiveDistance,
            effectiveDuration,
            surgeData.rapido * 0.95,
            peakMultiplier,
          ),
          eta: calculateETA(effectiveDuration, 0.75, 2, 6),
          surge: surgeData.rapido > 1.1,
          surgeMultiplier: surgeData.rapido * 0.95,
          rating: generateRating(3.7, 4.2),
          reviewCount: generateReviewCount(800, 4000),
          features: ["3 Wheeler", "Affordable", "Quick", "Digital Payment"],
          waitTime: generateWaitTime(2, 6),
        },
      ],
    },
  ]

  console.log("Generated enhanced fare data:", fareData)

  // Simulate realistic API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  return fareData
}

function calculateEnhancedPrice(
  pricing: {
    baseFare: number
    perKm: number
    perMin: number
    minFare: number
    bookingFee: number
    serviceTax: number
  },
  distanceKm: number,
  durationMin: number,
  surgeMultiplier: number,
  peakMultiplier: number,
): { min: number; max: number } {
  // Base calculation
  const distanceCost = distanceKm * pricing.perKm
  const timeCost = durationMin * pricing.perMin
  const subtotal = pricing.baseFare + distanceCost + timeCost

  // Apply surge and peak multipliers
  const surgedSubtotal = subtotal * surgeMultiplier * peakMultiplier

  // Add fees
  const withBookingFee = surgedSubtotal + pricing.bookingFee
  const withTax = withBookingFee * (1 + pricing.serviceTax)

  // Ensure minimum fare
  const finalCost = Math.max(withTax, pricing.minFare)

  // Create realistic range (±8%)
  const variance = finalCost * 0.08
  const min = Math.round(Math.max(finalCost - variance, pricing.minFare))
  const max = Math.round(finalCost + variance)

  console.log(
    `Price calculation for ${pricing.baseFare} base: distance=${distanceCost}, time=${timeCost}, final=${finalCost}, range=${min}-${max}`,
  )

  return { min, max }
}

function calculateDynamicSurge(traffic: string, distanceKm: number): { uber: number; ola: number; rapido: number } {
  const currentHour = new Date().getHours()
  const currentDay = new Date().getDay()
  const currentMinute = new Date().getMinutes()

  // Base surge calculation
  let baseSurge = 1.0

  // Time-based surge
  if ((currentHour >= 7 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 20)) {
    baseSurge = 1.25
  } else if ((currentHour >= 11 && currentHour <= 14) || (currentHour >= 21 && currentHour <= 23)) {
    baseSurge = 1.1
  }

  // Weekend surge
  if (currentDay === 0 || currentDay === 6) {
    if (currentHour >= 10 && currentHour <= 14) baseSurge *= 1.15
    if (currentHour >= 19 && currentHour <= 2) baseSurge *= 1.3
  }

  // Traffic-based surge
  switch (traffic) {
    case "Heavy":
      baseSurge *= 1.25
      break
    case "Moderate":
      baseSurge *= 1.1
      break
  }

  // Distance-based adjustments (longer trips = less surge)
  if (distanceKm > 15) baseSurge *= 0.9
  else if (distanceKm > 25) baseSurge *= 0.8

  // Weather simulation (random events)
  const weatherFactor = Math.random()
  if (weatherFactor > 0.85) baseSurge *= 1.4 // Rain/bad weather

  // Add realistic randomness
  const randomFactor = 0.9 + Math.random() * 0.2 // 0.9 to 1.1

  return {
    uber: Math.round(baseSurge * randomFactor * 10) / 10,
    ola: Math.round(baseSurge * 0.95 * randomFactor * 10) / 10,
    rapido: Math.round(baseSurge * 0.85 * randomFactor * 10) / 10,
  }
}

function generateAvailability(): { uber: string; ola: string; rapido: string } {
  const random = Math.random()

  return {
    uber: random > 0.1 ? "available" : "limited",
    ola: random > 0.15 ? "available" : "limited",
    rapido: random > 0.05 ? "available" : "limited",
  }
}

function calculateETA(baseDuration: number, multiplier: number, minETA: number, maxVariance: number): number {
  const eta = Math.round(baseDuration * multiplier)
  const variance = Math.floor(Math.random() * maxVariance)
  return Math.max(minETA, eta + variance)
}

function generateRating(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10
}

function generateReviewCount(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min))
}

function generateWaitTime(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min))
}

function generateDiscount(probability: number, min: number, max: number): number | undefined {
  return Math.random() < probability ? Math.floor(min + Math.random() * (max - min)) : undefined
}
