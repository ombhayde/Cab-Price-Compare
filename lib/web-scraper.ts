import type { FareData, LocationData } from "@/types"
import { getOfficialPricing } from "./official-api-service"

interface ScrapingParams {
  pickup: LocationData
  dropoff: LocationData
  distance: number
  duration: number
  traffic: string
}

// Enhanced web scraping service with official API simulation
export async function scrapeRealFares(params: ScrapingParams): Promise<FareData[]> {
  console.log("=== STARTING ENHANCED PRICING SYSTEM ===")
  console.log("Using official API structures with realistic market data")

  try {
    // Use official API service (simulated with real structures)
    const fares = await getOfficialPricing(params)

    if (fares && fares.length > 0) {
      console.log("=== OFFICIAL API PRICING COMPLETED ===")
      return fares
    }

    throw new Error("Official API service failed")
  } catch (error) {
    console.error("Enhanced pricing system error:", error)

    // Fallback to previous system
    console.log("Using fallback market-based pricing")
    return generateEnhancedMarketData(params)
  }
}

// Enhanced market-based data generation (same as before)
function generateEnhancedMarketData(params: ScrapingParams): FareData[] {
  console.log("=== GENERATING ENHANCED MARKET-BASED DATA ===")

  const { pickup, dropoff, distance, duration, traffic } = params
  const distanceKm = Math.max(distance / 1000, 1)

  // Detect city for pricing
  const city = detectCityFromCoords(pickup.lat, pickup.lng)
  const cityMultiplier = getCityPriceMultiplier(city)

  // Calculate real-time factors
  const currentHour = new Date().getHours()
  const currentDay = new Date().getDay()
  const isPeakHour = (currentHour >= 8 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 20)
  const isWeekend = currentDay === 0 || currentDay === 6

  // Dynamic surge calculation
  let surgeMultiplier = 1.0

  if (isPeakHour) surgeMultiplier += 0.3
  if (isWeekend && currentHour >= 19) surgeMultiplier += 0.2
  if (traffic === "Heavy") surgeMultiplier += 0.2
  else if (traffic === "Moderate") surgeMultiplier += 0.1

  // Weather simulation (random events)
  const weatherFactor = Math.random()
  if (weatherFactor > 0.85) surgeMultiplier += 0.4 // Rain/bad weather

  // Add randomness
  surgeMultiplier += Math.random() * 0.1 - 0.05

  console.log("Market factors:", {
    city,
    cityMultiplier,
    distanceKm,
    duration,
    isPeakHour,
    isWeekend,
    traffic,
    surgeMultiplier: Math.round(surgeMultiplier * 10) / 10,
  })

  return [
    generateUberMarketData(distanceKm, duration, cityMultiplier, surgeMultiplier),
    generateOlaMarketData(distanceKm, duration, cityMultiplier, surgeMultiplier),
    generateRapidoMarketData(distanceKm, duration, cityMultiplier, surgeMultiplier),
  ]
}

function generateUberMarketData(
  distanceKm: number,
  duration: number,
  cityMultiplier: number,
  surgeMultiplier: number,
): FareData {
  const baseFare = (50 + distanceKm * 12 + duration * 2) * cityMultiplier

  return {
    provider: "Uber",
    logo: "🚗",
    availability: Math.random() > 0.05 ? "available" : "limited",
    bookingUrl: "https://m.uber.com/looking",
    rides: [
      {
        type: "UberGo",
        priceRange: {
          min: Math.round(baseFare * 0.9 * surgeMultiplier),
          max: Math.round(baseFare * 1.1 * surgeMultiplier),
        },
        eta: Math.max(3, Math.round(duration * 0.8) + Math.floor(Math.random() * 5) + 2),
        surge: surgeMultiplier > 1.1,
        surgeMultiplier: Math.round(surgeMultiplier * 10) / 10,
        rating: 4.2 + Math.random() * 0.3,
        reviewCount: Math.floor(Math.random() * 2000) + 500,
        features: ["AC", "4 Seats", "GPS Tracking", "Digital Payment"],
        waitTime: Math.floor(Math.random() * 8) + 2,
        discount: Math.random() > 0.7 ? Math.floor(Math.random() * 15) + 5 : undefined,
      },
      {
        type: "UberX",
        priceRange: {
          min: Math.round(baseFare * 1.2 * surgeMultiplier),
          max: Math.round(baseFare * 1.4 * surgeMultiplier),
        },
        eta: Math.max(4, Math.round(duration * 0.9) + Math.floor(Math.random() * 6) + 3),
        surge: surgeMultiplier > 1.1,
        surgeMultiplier: Math.round(surgeMultiplier * 10) / 10,
        rating: 4.5 + Math.random() * 0.2,
        reviewCount: Math.floor(Math.random() * 1500) + 300,
        features: ["Premium", "AC", "4 Seats", "Professional Driver"],
        waitTime: Math.floor(Math.random() * 10) + 3,
      },
      {
        type: "UberXL",
        priceRange: {
          min: Math.round(baseFare * 1.6 * surgeMultiplier),
          max: Math.round(baseFare * 1.8 * surgeMultiplier),
        },
        eta: Math.max(5, Math.round(duration * 1.1) + Math.floor(Math.random() * 7) + 4),
        surge: surgeMultiplier > 1.1,
        surgeMultiplier: Math.round(surgeMultiplier * 10) / 10,
        rating: 4.4 + Math.random() * 0.3,
        reviewCount: Math.floor(Math.random() * 800) + 200,
        features: ["SUV", "6 Seats", "Extra Space", "AC"],
        waitTime: Math.floor(Math.random() * 12) + 4,
      },
    ],
  }
}

function generateOlaMarketData(
  distanceKm: number,
  duration: number,
  cityMultiplier: number,
  surgeMultiplier: number,
): FareData {
  const baseFare = (45 + distanceKm * 10 + duration * 1.8) * cityMultiplier

  return {
    provider: "Ola",
    logo: "🟢",
    availability: Math.random() > 0.1 ? "available" : "limited",
    bookingUrl: "https://book.olacabs.com",
    rides: [
      {
        type: "Ola Mini",
        priceRange: {
          min: Math.round(baseFare * 0.85 * surgeMultiplier * 0.9),
          max: Math.round(baseFare * 1.05 * surgeMultiplier * 0.9),
        },
        eta: Math.max(3, Math.round(duration * 0.85) + Math.floor(Math.random() * 5) + 2),
        surge: surgeMultiplier > 1.1,
        surgeMultiplier: Math.round(surgeMultiplier * 0.9 * 10) / 10,
        rating: 4.0 + Math.random() * 0.4,
        reviewCount: Math.floor(Math.random() * 3000) + 800,
        features: ["AC", "4 Seats", "Economy", "Digital Payment"],
        waitTime: Math.floor(Math.random() * 10) + 2,
        discount: Math.random() > 0.6 ? Math.floor(Math.random() * 20) + 10 : undefined,
      },
      {
        type: "Ola Prime",
        priceRange: {
          min: Math.round(baseFare * 1.1 * surgeMultiplier * 0.9),
          max: Math.round(baseFare * 1.3 * surgeMultiplier * 0.9),
        },
        eta: Math.max(4, Math.round(duration * 0.95) + Math.floor(Math.random() * 6) + 3),
        surge: surgeMultiplier > 1.1,
        surgeMultiplier: Math.round(surgeMultiplier * 0.9 * 10) / 10,
        rating: 4.3 + Math.random() * 0.3,
        reviewCount: Math.floor(Math.random() * 2000) + 400,
        features: ["Premium", "AC", "4 Seats", "Sedan"],
        waitTime: Math.floor(Math.random() * 12) + 3,
      },
      {
        type: "Ola Auto",
        priceRange: {
          min: Math.round(baseFare * 0.6 * surgeMultiplier * 0.8),
          max: Math.round(baseFare * 0.8 * surgeMultiplier * 0.8),
        },
        eta: Math.max(2, Math.round(duration * 0.7) + Math.floor(Math.random() * 4) + 1),
        surge: surgeMultiplier > 1.2,
        surgeMultiplier: Math.round(surgeMultiplier * 0.8 * 10) / 10,
        rating: 3.9 + Math.random() * 0.4,
        reviewCount: Math.floor(Math.random() * 4000) + 1000,
        features: ["3 Wheeler", "Open Air", "Quick", "Affordable"],
        waitTime: Math.floor(Math.random() * 6) + 1,
      },
    ],
  }
}

function generateRapidoMarketData(
  distanceKm: number,
  duration: number,
  cityMultiplier: number,
  surgeMultiplier: number,
): FareData {
  const baseFare = (25 + distanceKm * 6 + duration * 1) * cityMultiplier

  return {
    provider: "Rapido",
    logo: "🏍️",
    availability: Math.random() > 0.03 ? "available" : "limited",
    bookingUrl: "https://rapido.bike",
    rides: [
      {
        type: "Rapido Bike",
        priceRange: {
          min: Math.round(baseFare * 0.7 * surgeMultiplier * 0.85),
          max: Math.round(baseFare * 0.9 * surgeMultiplier * 0.85),
        },
        eta: Math.max(1, Math.round(duration * 0.6) + Math.floor(Math.random() * 3) + 1),
        surge: surgeMultiplier > 1.1,
        surgeMultiplier: Math.round(surgeMultiplier * 0.85 * 10) / 10,
        rating: 4.1 + Math.random() * 0.3,
        reviewCount: Math.floor(Math.random() * 6000) + 2000,
        features: ["Fast", "Eco-friendly", "Beat Traffic", "Helmet Provided"],
        waitTime: Math.floor(Math.random() * 5) + 1,
        discount: Math.random() > 0.5 ? Math.floor(Math.random() * 25) + 15 : undefined,
      },
      {
        type: "Rapido Auto",
        priceRange: {
          min: Math.round(baseFare * 0.9 * surgeMultiplier * 0.85),
          max: Math.round(baseFare * 1.1 * surgeMultiplier * 0.85),
        },
        eta: Math.max(2, Math.round(duration * 0.75) + Math.floor(Math.random() * 4) + 2),
        surge: surgeMultiplier > 1.1,
        surgeMultiplier: Math.round(surgeMultiplier * 0.85 * 10) / 10,
        rating: 3.8 + Math.random() * 0.4,
        reviewCount: Math.floor(Math.random() * 4000) + 800,
        features: ["3 Wheeler", "Affordable", "Quick", "Digital Payment"],
        waitTime: Math.floor(Math.random() * 7) + 2,
      },
    ],
  }
}

// Helper functions
function detectCityFromCoords(lat: number, lng: number): string {
  const cities = [
    { name: "mumbai", lat: 19.076, lng: 72.8777, radius: 0.5 },
    { name: "delhi", lat: 28.6139, lng: 77.209, radius: 0.5 },
    { name: "bangalore", lat: 12.9716, lng: 77.5946, radius: 0.3 },
    { name: "hyderabad", lat: 17.385, lng: 78.4867, radius: 0.3 },
    { name: "pune", lat: 18.5204, lng: 73.8567, radius: 0.3 },
    { name: "chennai", lat: 13.0827, lng: 80.2707, radius: 0.3 },
    { name: "kolkata", lat: 22.5726, lng: 88.3639, radius: 0.3 },
  ]

  for (const city of cities) {
    const distance = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2))
    if (distance <= city.radius) {
      return city.name
    }
  }

  return "other"
}

function getCityPriceMultiplier(city: string): number {
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
