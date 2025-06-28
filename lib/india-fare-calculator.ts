import type { FareData, LocationData } from "@/types"

interface FareCalculationParams {
  pickup: LocationData
  dropoff: LocationData
  distance: number // in meters
  duration: number // in minutes
  traffic: string
}

// City-specific pricing adjustments for major Indian cities
const CITY_PRICING_MULTIPLIERS = {
  // Tier 1 cities (highest prices)
  mumbai: { multiplier: 1.3, surgeBase: 1.4 },
  delhi: { multiplier: 1.2, surgeBase: 1.3 },
  bangalore: { multiplier: 1.25, surgeBase: 1.35 },
  hyderabad: { multiplier: 1.15, surgeBase: 1.25 },
  pune: { multiplier: 1.1, surgeBase: 1.2 },
  chennai: { multiplier: 1.15, surgeBase: 1.25 },
  kolkata: { multiplier: 1.05, surgeBase: 1.15 },

  // Tier 2 cities
  ahmedabad: { multiplier: 1.0, surgeBase: 1.1 },
  jaipur: { multiplier: 0.95, surgeBase: 1.1 },
  surat: { multiplier: 0.9, surgeBase: 1.05 },
  lucknow: { multiplier: 0.9, surgeBase: 1.05 },
  kanpur: { multiplier: 0.85, surgeBase: 1.0 },
  nagpur: { multiplier: 0.9, surgeBase: 1.05 },
  indore: { multiplier: 0.9, surgeBase: 1.05 },
  thane: { multiplier: 1.2, surgeBase: 1.3 },
  bhopal: { multiplier: 0.85, surgeBase: 1.0 },
  visakhapatnam: { multiplier: 0.9, surgeBase: 1.05 },
  pimpri: { multiplier: 1.05, surgeBase: 1.15 },
  patna: { multiplier: 0.8, surgeBase: 0.95 },
  vadodara: { multiplier: 0.9, surgeBase: 1.05 },
  ghaziabad: { multiplier: 1.1, surgeBase: 1.2 },
  ludhiana: { multiplier: 0.85, surgeBase: 1.0 },
  agra: { multiplier: 0.8, surgeBase: 0.95 },
  nashik: { multiplier: 0.85, surgeBase: 1.0 },
  faridabad: { multiplier: 1.05, surgeBase: 1.15 },
  meerut: { multiplier: 0.8, surgeBase: 0.95 },
  rajkot: { multiplier: 0.85, surgeBase: 1.0 },

  // Default for other cities
  default: { multiplier: 0.8, surgeBase: 0.95 },
}

// Base pricing structure (realistic 2024 rates)
const BASE_PRICING = {
  uber: {
    go: { baseFare: 50, perKm: 12, perMin: 2, minFare: 80, bookingFee: 5, serviceTax: 0.05 },
    x: { baseFare: 60, perKm: 15, perMin: 2.5, minFare: 100, bookingFee: 8, serviceTax: 0.05 },
    xl: { baseFare: 80, perKm: 18, perMin: 3, minFare: 150, bookingFee: 10, serviceTax: 0.05 },
    premier: { baseFare: 100, perKm: 22, perMin: 3.5, minFare: 200, bookingFee: 15, serviceTax: 0.05 },
  },
  ola: {
    mini: { baseFare: 45, perKm: 10, perMin: 1.8, minFare: 75, bookingFee: 4, serviceTax: 0.05 },
    prime: { baseFare: 55, perKm: 13, perMin: 2.2, minFare: 95, bookingFee: 6, serviceTax: 0.05 },
    auto: { baseFare: 20, perKm: 7, perMin: 1.2, minFare: 35, bookingFee: 2, serviceTax: 0.03 },
    lux: { baseFare: 90, perKm: 20, perMin: 3.2, minFare: 180, bookingFee: 12, serviceTax: 0.05 },
  },
  rapido: {
    bike: { baseFare: 15, perKm: 4, perMin: 1, minFare: 25, bookingFee: 2, serviceTax: 0.03 },
    auto: { baseFare: 22, perKm: 6, perMin: 1.3, minFare: 38, bookingFee: 3, serviceTax: 0.03 },
    cab: { baseFare: 40, perKm: 9, perMin: 1.5, minFare: 65, bookingFee: 4, serviceTax: 0.05 },
  },
}

export async function calculateIndiaFares(params: FareCalculationParams): Promise<FareData[]> {
  console.log("=== INDIA FARE CALCULATOR STARTED ===")
  console.log("Params:", params)

  const { pickup, dropoff, distance, duration, traffic } = params
  const distanceKm = Math.max(distance / 1000, 0.5) // Minimum 0.5km
  const durationMin = Math.max(duration, 3) // Minimum 3 minutes

  // Detect city from pickup location
  const city = detectCity(pickup.address)
  const cityPricing = CITY_PRICING_MULTIPLIERS[city] || CITY_PRICING_MULTIPLIERS.default

  console.log("Detected city:", city, "Pricing multiplier:", cityPricing.multiplier)

  // Calculate surge based on multiple factors
  const surgeData = calculateRealTimeSurge(traffic, distanceKm, city, cityPricing.surgeBase)
  console.log("Surge data:", surgeData)

  // Peak hour calculation
  const currentHour = new Date().getHours()
  const isPeakHour = (currentHour >= 8 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 20)
  const peakMultiplier = isPeakHour ? 1.15 : 1.0

  // Generate realistic availability
  const availability = generateCityAvailability(city)

  const fareData: FareData[] = [
    {
      provider: "Uber",
      logo: "🚗",
      availability: availability.uber,
      bookingUrl: "https://m.uber.com/looking",
      rides: [
        {
          type: "UberGo",
          priceRange: calculateCityPrice(
            BASE_PRICING.uber.go,
            distanceKm,
            durationMin,
            cityPricing.multiplier,
            surgeData.uber,
            peakMultiplier,
          ),
          eta: calculateRealisticETA(durationMin, 0.8, city),
          surge: surgeData.uber > 1.0,
          surgeMultiplier: surgeData.uber,
          rating: generateRating(4.0, 4.5),
          reviewCount: generateCityReviewCount(city, 500, 3000),
          features: ["AC", "4 Seats", "GPS Tracking", "Digital Payment"],
          waitTime: generateCityWaitTime(city, 2, 8),
          discount: generateDiscount(0.3, 5, 20),
        },
        {
          type: "UberX",
          priceRange: calculateCityPrice(
            BASE_PRICING.uber.x,
            distanceKm,
            durationMin,
            cityPricing.multiplier,
            surgeData.uber,
            peakMultiplier,
          ),
          eta: calculateRealisticETA(durationMin, 0.9, city),
          surge: surgeData.uber > 1.0,
          surgeMultiplier: surgeData.uber,
          rating: generateRating(4.3, 4.7),
          reviewCount: generateCityReviewCount(city, 300, 2000),
          features: ["Premium", "AC", "4 Seats", "Professional Driver"],
          waitTime: generateCityWaitTime(city, 3, 10),
        },
        ...(city === "mumbai" || city === "delhi" || city === "bangalore"
          ? [
              {
                type: "UberXL",
                priceRange: calculateCityPrice(
                  BASE_PRICING.uber.xl,
                  distanceKm,
                  durationMin,
                  cityPricing.multiplier,
                  surgeData.uber,
                  peakMultiplier,
                ),
                eta: calculateRealisticETA(durationMin, 1.1, city),
                surge: surgeData.uber > 1.0,
                surgeMultiplier: surgeData.uber,
                rating: generateRating(4.2, 4.6),
                reviewCount: generateCityReviewCount(city, 200, 1200),
                features: ["SUV", "6 Seats", "Extra Space", "AC"],
                waitTime: generateCityWaitTime(city, 4, 12),
              },
            ]
          : []),
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
          priceRange: calculateCityPrice(
            BASE_PRICING.ola.mini,
            distanceKm,
            durationMin,
            cityPricing.multiplier,
            surgeData.ola,
            peakMultiplier,
          ),
          eta: calculateRealisticETA(durationMin, 0.85, city),
          surge: surgeData.ola > 1.0,
          surgeMultiplier: surgeData.ola,
          rating: generateRating(3.8, 4.3),
          reviewCount: generateCityReviewCount(city, 800, 5000),
          features: ["AC", "4 Seats", "Economy", "Digital Payment"],
          waitTime: generateCityWaitTime(city, 2, 9),
          discount: generateDiscount(0.4, 10, 30),
        },
        {
          type: "Ola Prime",
          priceRange: calculateCityPrice(
            BASE_PRICING.ola.prime,
            distanceKm,
            durationMin,
            cityPricing.multiplier,
            surgeData.ola,
            peakMultiplier,
          ),
          eta: calculateRealisticETA(durationMin, 0.95, city),
          surge: surgeData.ola > 1.0,
          surgeMultiplier: surgeData.ola,
          rating: generateRating(4.1, 4.5),
          reviewCount: generateCityReviewCount(city, 400, 3000),
          features: ["Premium", "AC", "4 Seats", "Sedan"],
          waitTime: generateCityWaitTime(city, 3, 11),
        },
        {
          type: "Ola Auto",
          priceRange: calculateCityPrice(
            BASE_PRICING.ola.auto,
            distanceKm,
            durationMin,
            cityPricing.multiplier * 0.9, // Autos are cheaper
            surgeData.ola * 0.9,
            peakMultiplier,
          ),
          eta: calculateRealisticETA(durationMin, 0.7, city),
          surge: surgeData.ola > 1.2,
          surgeMultiplier: surgeData.ola * 0.9,
          rating: generateRating(3.6, 4.1),
          reviewCount: generateCityReviewCount(city, 1000, 6000),
          features: ["3 Wheeler", "Open Air", "Quick", "Affordable"],
          waitTime: generateCityWaitTime(city, 1, 6),
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
          priceRange: calculateCityPrice(
            BASE_PRICING.rapido.bike,
            distanceKm,
            durationMin,
            cityPricing.multiplier * 0.8, // Bikes are much cheaper
            surgeData.rapido,
            peakMultiplier,
          ),
          eta: calculateRealisticETA(durationMin, 0.6, city),
          surge: surgeData.rapido > 1.0,
          surgeMultiplier: surgeData.rapido,
          rating: generateRating(3.9, 4.4),
          reviewCount: generateCityReviewCount(city, 2000, 10000),
          features: ["Fast", "Eco-friendly", "Beat Traffic", "Helmet Provided"],
          waitTime: generateCityWaitTime(city, 1, 5),
          discount: generateDiscount(0.5, 15, 35),
        },
        {
          type: "Rapido Auto",
          priceRange: calculateCityPrice(
            BASE_PRICING.rapido.auto,
            distanceKm,
            durationMin,
            cityPricing.multiplier * 0.85,
            surgeData.rapido * 0.95,
            peakMultiplier,
          ),
          eta: calculateRealisticETA(durationMin, 0.75, city),
          surge: surgeData.rapido > 1.1,
          surgeMultiplier: surgeData.rapido * 0.95,
          rating: generateRating(3.7, 4.2),
          reviewCount: generateCityReviewCount(city, 800, 5000),
          features: ["3 Wheeler", "Affordable", "Quick", "Digital Payment"],
          waitTime: generateCityWaitTime(city, 2, 7),
        },
      ],
    },
  ]

  console.log("Generated India fare data:", fareData)

  // Simulate realistic API delay
  await new Promise((resolve) => setTimeout(resolve, 1200))

  return fareData
}

function detectCity(address: string): string {
  const addressLower = address.toLowerCase()

  // Check for major cities
  const cityKeywords = {
    mumbai: ["mumbai", "bombay", "andheri", "bandra", "juhu", "worli", "colaba", "powai"],
    delhi: [
      "delhi",
      "new delhi",
      "connaught",
      "karol bagh",
      "lajpat",
      "dwarka",
      "rohini",
      "gurgaon",
      "gurugram",
      "noida",
      "faridabad",
      "ghaziabad",
    ],
    bangalore: ["bangalore", "bengaluru", "koramangala", "whitefield", "electronic city", "indiranagar", "jayanagar"],
    hyderabad: ["hyderabad", "secunderabad", "hitech city", "gachibowli", "jubilee hills", "banjara hills"],
    pune: ["pune", "pimpri", "chinchwad", "hinjewadi", "kothrud", "viman nagar"],
    chennai: ["chennai", "madras", "anna nagar", "velachery", "tambaram", "adyar"],
    kolkata: ["kolkata", "calcutta", "salt lake", "park street", "howrah"],
    ahmedabad: ["ahmedabad", "gandhinagar"],
    jaipur: ["jaipur", "pink city"],
    surat: ["surat"],
    lucknow: ["lucknow"],
    kanpur: ["kanpur"],
    nagpur: ["nagpur"],
    indore: ["indore"],
    thane: ["thane"],
    bhopal: ["bhopal"],
    visakhapatnam: ["visakhapatnam", "vizag"],
    patna: ["patna"],
    vadodara: ["vadodara", "baroda"],
    ludhiana: ["ludhiana"],
    agra: ["agra"],
    nashik: ["nashik"],
    meerut: ["meerut"],
    rajkot: ["rajkot"],
  }

  for (const [city, keywords] of Object.entries(cityKeywords)) {
    if (keywords.some((keyword) => addressLower.includes(keyword))) {
      return city
    }
  }

  return "default"
}

function calculateCityPrice(
  pricing: any,
  distanceKm: number,
  durationMin: number,
  cityMultiplier: number,
  surgeMultiplier: number,
  peakMultiplier: number,
): { min: number; max: number } {
  // Base calculation
  const distanceCost = distanceKm * pricing.perKm
  const timeCost = durationMin * pricing.perMin
  const subtotal = pricing.baseFare + distanceCost + timeCost

  // Apply all multipliers
  const cityAdjusted = subtotal * cityMultiplier
  const surgeAdjusted = cityAdjusted * surgeMultiplier * peakMultiplier

  // Add fees
  const withBookingFee = surgeAdjusted + pricing.bookingFee
  const withTax = withBookingFee * (1 + pricing.serviceTax)

  // Ensure minimum fare
  const finalCost = Math.max(withTax, pricing.minFare * cityMultiplier)

  // Create realistic range (±10%)
  const variance = finalCost * 0.1
  const min = Math.round(Math.max(finalCost - variance, pricing.minFare * cityMultiplier))
  const max = Math.round(finalCost + variance)

  return { min, max }
}

function calculateRealTimeSurge(
  traffic: string,
  distanceKm: number,
  city: string,
  surgeBase: number,
): { uber: number; ola: number; rapido: number } {
  const currentHour = new Date().getHours()
  const currentDay = new Date().getDay()

  let baseSurge = surgeBase

  // Time-based surge
  if ((currentHour >= 7 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 20)) {
    baseSurge *= 1.3
  } else if ((currentHour >= 11 && currentHour <= 14) || (currentHour >= 21 && currentHour <= 23)) {
    baseSurge *= 1.1
  }

  // Weekend surge
  if (currentDay === 0 || currentDay === 6) {
    if (currentHour >= 10 && currentHour <= 14) baseSurge *= 1.15
    if (currentHour >= 19 && currentHour <= 2) baseSurge *= 1.25
  }

  // Traffic-based surge
  switch (traffic) {
    case "Heavy":
      baseSurge *= 1.2
      break
    case "Moderate":
      baseSurge *= 1.1
      break
  }

  // City-specific surge patterns
  if (["mumbai", "delhi", "bangalore"].includes(city)) {
    baseSurge *= 1.1 // Higher surge in tier 1 cities
  }

  // Weather simulation
  const weatherFactor = Math.random()
  if (weatherFactor > 0.8) baseSurge *= 1.3 // Rain/bad weather

  return {
    uber: Math.round(baseSurge * (0.95 + Math.random() * 0.1) * 10) / 10,
    ola: Math.round(baseSurge * 0.9 * (0.95 + Math.random() * 0.1) * 10) / 10,
    rapido: Math.round(baseSurge * 0.8 * (0.95 + Math.random() * 0.1) * 10) / 10,
  }
}

function generateCityAvailability(city: string): { uber: string; ola: string; rapido: string } {
  const tierOneAvailability = Math.random() > 0.05 ? "available" : "limited"
  const tierTwoAvailability = Math.random() > 0.1 ? "available" : "limited"
  const defaultAvailability = Math.random() > 0.15 ? "available" : "limited"

  const availability = ["mumbai", "delhi", "bangalore", "hyderabad", "pune", "chennai"].includes(city)
    ? tierOneAvailability
    : ["ahmedabad", "jaipur", "surat", "lucknow", "kanpur", "nagpur", "indore"].includes(city)
      ? tierTwoAvailability
      : defaultAvailability

  return {
    uber: availability,
    ola: availability,
    rapido: Math.random() > 0.03 ? "available" : "limited", // Rapido has better availability
  }
}

function calculateRealisticETA(baseDuration: number, multiplier: number, city: string): number {
  const cityTrafficMultiplier = ["mumbai", "delhi", "bangalore"].includes(city) ? 1.3 : 1.1
  const eta = Math.round(baseDuration * multiplier * cityTrafficMultiplier)
  const variance = Math.floor(Math.random() * 5)
  return Math.max(1, eta + variance)
}

function generateRating(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10
}

function generateCityReviewCount(city: string, min: number, max: number): number {
  const cityMultiplier = ["mumbai", "delhi", "bangalore"].includes(city) ? 2 : 1
  return Math.floor((min + Math.random() * (max - min)) * cityMultiplier)
}

function generateCityWaitTime(city: string, min: number, max: number): number {
  const cityMultiplier = ["mumbai", "delhi", "bangalore"].includes(city) ? 1.5 : 1
  return Math.floor((min + Math.random() * (max - min)) * cityMultiplier)
}

function generateDiscount(probability: number, min: number, max: number): number | undefined {
  return Math.random() < probability ? Math.floor(min + Math.random() * (max - min)) : undefined
}
