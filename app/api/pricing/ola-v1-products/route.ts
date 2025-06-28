import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pickup_lat = Number.parseFloat(searchParams.get("pickup_lat") || "0")
    const pickup_lng = Number.parseFloat(searchParams.get("pickup_lng") || "0")
    const drop_lat = searchParams.get("drop_lat") ? Number.parseFloat(searchParams.get("drop_lat")) : null
    const drop_lng = searchParams.get("drop_lng") ? Number.parseFloat(searchParams.get("drop_lng")) : null
    const category = searchParams.get("category")
    const service_type = searchParams.get("service_type") || "p2p"
    const pickup_mode = searchParams.get("pickup_mode") || "now"

    console.log("=== OLA V1 PRODUCTS API (OFFICIAL STRUCTURE) ===")
    console.log("Request params:", { pickup_lat, pickup_lng, drop_lat, drop_lng, category, service_type })

    // Validate required parameters
    if (!pickup_lat || !pickup_lng) {
      return NextResponse.json(
        {
          message: "Pickup latitude and longitude are required.",
          code: "MISSING_PICKUP_LOCATION",
        },
        { status: 400 },
      )
    }

    // Check if city is supported
    const city = detectCityFromCoords(pickup_lat, pickup_lng)
    if (!isCitySupported(city)) {
      return NextResponse.json(
        {
          message: "Sorry, we do not serve this city.",
          code: "INVALID_CITY",
        },
        { status: 400 },
      )
    }

    // Calculate distance if drop location provided
    let distance = 0
    let travel_time = 0
    if (drop_lat && drop_lng) {
      distance = calculateDistance(pickup_lat, pickup_lng, drop_lat, drop_lng)
      travel_time = Math.round((distance / 23) * 60) // 23 km/h average speed
    }

    // Generate hotspot zone data
    const hotspot_zone = generateHotspotZone(pickup_lat, pickup_lng, city)

    // Generate categories based on city and availability
    const categories = generateOlaCategories(pickup_lat, pickup_lng, city, category)

    // Generate ride estimates if drop location provided
    const ride_estimate = drop_lat && drop_lng ? generateRideEstimates(categories, distance, travel_time, city) : []

    // Generate previous cancellation charges (if user is authenticated)
    const previous_cancellation_charges = generateCancellationCharges()

    const response = {
      hotspot_zone,
      categories,
      ride_estimate,
      previous_cancellation_charges,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Ola V1 Products API error:", error)
    return NextResponse.json(
      {
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    )
  }
}

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

  return "unknown"
}

function isCitySupported(city: string): boolean {
  const supportedCities = ["mumbai", "delhi", "bangalore", "hyderabad", "pune", "chennai", "kolkata"]
  return supportedCities.includes(city)
}

function generateHotspotZone(lat: number, lng: number, city: string) {
  // Generate realistic hotspot zone data
  const isHotspot = Math.random() > 0.7 // 30% chance of hotspot

  if (!isHotspot) {
    return {
      is_hotpot_zone: false,
    }
  }

  return {
    is_hotpot_zone: true,
    desc: "Choose from convenient pickup points to board your cab.",
    default_pickup_point_id: 10881,
    hotspot_boundary: [
      [lat + 0.001, lng + 0.001],
      [lat + 0.002, lng + 0.002],
      [lat + 0.001, lng + 0.003],
      [lat - 0.001, lng + 0.002],
      [lat - 0.001, lng - 0.001],
    ],
    pickup_points: [
      {
        lat: lat + 0.0005,
        lng: lng + 0.0005,
        name: getPickupPointName(city, 1),
        id: 10880,
      },
      {
        lat: lat - 0.0005,
        lng: lng - 0.0005,
        name: getPickupPointName(city, 2),
        id: 10881,
      },
      {
        lat: lat + 0.001,
        lng: lng - 0.001,
        name: getPickupPointName(city, 3),
        id: 10882,
      },
    ],
  }
}

function getPickupPointName(city: string, index: number): string {
  const cityNames = {
    mumbai: ["Bandra Station", "Andheri Metro", "Powai Central"],
    delhi: ["Connaught Place", "Khan Market", "India Gate"],
    bangalore: ["MG Road", "Brigade Road", "Koramangala"],
    hyderabad: ["Hitech City", "Banjara Hills", "Jubilee Hills"],
    pune: ["FC Road", "Koregaon Park", "Hinjewadi"],
    chennai: ["T Nagar", "Anna Nagar", "Adyar"],
    kolkata: ["Park Street", "Salt Lake", "Howrah"],
  }

  const names = cityNames[city] || ["Pickup Point 1", "Pickup Point 2", "Pickup Point 3"]
  return names[index - 1] || `Pickup Point ${index}`
}

function generateOlaCategories(lat: number, lng: number, city: string, requestedCategory?: string) {
  const currentHour = new Date().getHours()
  const isPeakHour = (currentHour >= 8 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 20)
  const cityMultiplier = getCityMultiplier(city)

  const allCategories = [
    {
      id: "mini",
      display_name: "Ola Mini",
      currency: "INR",
      distance_unit: "kilometre",
      time_unit: "minute",
      eta: Math.floor(Math.random() * 8) + 2,
      distance: (Math.random() * 2 + 0.1).toFixed(1),
      ride_later_enabled: "true",
      image: "https://d1foexe15giopy.cloudfront.net/mini.png",
      hotspot_pickup_points: [10880, 10881, 10882],
      cancellation_policy: {
        cancellation_charge: Math.round(15 * cityMultiplier),
        currency: "INR",
        cancellation_charge_applies_after_time: 5,
        time_unit: "minute",
      },
      fare_breakup: [
        {
          type: "flat_rate",
          minimum_distance: 0,
          minimum_time: 0,
          base_fare: Math.round(45 * cityMultiplier),
          minimum_fare: Math.round(75 * cityMultiplier),
          cost_per_distance: Math.round(10 * cityMultiplier),
          waiting_cost_per_minute: Math.round(1 * cityMultiplier),
          ride_cost_per_minute: Math.round(1.8 * cityMultiplier),
          surcharge: isPeakHour ? [{ type: "peak", multiplier: 1.2 }] : [],
          rates_lower_than_usual: !isPeakHour && Math.random() > 0.8,
          rates_higher_than_usual: isPeakHour,
        },
      ],
      all_cabs: generateNearbyCabs(lat, lng, 5),
    },
    {
      id: "prime",
      display_name: "Ola Prime",
      currency: "INR",
      distance_unit: "kilometre",
      time_unit: "minute",
      eta: Math.floor(Math.random() * 10) + 3,
      distance: (Math.random() * 2.5 + 0.2).toFixed(1),
      ride_later_enabled: "true",
      image: "https://d1foexe15giopy.cloudfront.net/prime.png",
      hotspot_pickup_points: [10880, 10881, 10882],
      cancellation_policy: {
        cancellation_charge: Math.round(20 * cityMultiplier),
        currency: "INR",
        cancellation_charge_applies_after_time: 5,
        time_unit: "minute",
      },
      fare_breakup: [
        {
          type: "flat_rate",
          minimum_distance: 0,
          minimum_time: 0,
          base_fare: Math.round(65 * cityMultiplier),
          minimum_fare: Math.round(95 * cityMultiplier),
          cost_per_distance: Math.round(13 * cityMultiplier),
          waiting_cost_per_minute: Math.round(1.5 * cityMultiplier),
          ride_cost_per_minute: Math.round(2.2 * cityMultiplier),
          surcharge: isPeakHour ? [{ type: "peak", multiplier: 1.15 }] : [],
          rates_lower_than_usual: !isPeakHour && Math.random() > 0.8,
          rates_higher_than_usual: isPeakHour,
        },
      ],
      all_cabs: generateNearbyCabs(lat, lng, 3),
    },
    {
      id: "auto",
      display_name: "Auto",
      currency: "INR",
      distance_unit: "kilometre",
      time_unit: "minute",
      eta: Math.floor(Math.random() * 6) + 1,
      distance: (Math.random() * 1.5 + 0.1).toFixed(1),
      ride_later_enabled: "false",
      image: "https://d1foexe15giopy.cloudfront.net/auto.png",
      hotspot_pickup_points: [10880, 10881, 10882],
      cancellation_policy: {
        cancellation_charge: Math.round(10 * cityMultiplier),
        currency: "INR",
        cancellation_charge_applies_after_time: 3,
        time_unit: "minute",
      },
      fare_breakup: [
        {
          type: "flat_rate",
          minimum_distance: 0,
          minimum_time: 0,
          base_fare: Math.round(25 * cityMultiplier),
          minimum_fare: Math.round(35 * cityMultiplier),
          cost_per_distance: Math.round(7 * cityMultiplier),
          waiting_cost_per_minute: Math.round(0.5 * cityMultiplier),
          ride_cost_per_minute: Math.round(1.2 * cityMultiplier),
          surcharge: isPeakHour && Math.random() > 0.5 ? [{ type: "peak", multiplier: 1.1 }] : [],
          rates_lower_than_usual: !isPeakHour && Math.random() > 0.7,
          rates_higher_than_usual: isPeakHour && Math.random() > 0.5,
        },
      ],
      all_cabs: generateNearbyCabs(lat, lng, 8),
    },
  ]

  // Filter by requested category if specified
  if (requestedCategory) {
    const filtered = allCategories.filter((cat) => cat.id === requestedCategory)
    if (filtered.length === 0) {
      throw new Error("INVALID_CITY_CAR_CATEGORY")
    }
    return filtered
  }

  return allCategories
}

function generateNearbyCabs(centerLat: number, centerLng: number, count: number) {
  const cabs = []
  for (let i = 0; i < count; i++) {
    // Generate random positions within 2km radius
    const angle = Math.random() * 2 * Math.PI
    const radius = Math.random() * 0.02 // ~2km in degrees
    const lat = centerLat + radius * Math.cos(angle)
    const lng = centerLng + radius * Math.sin(angle)

    cabs.push({
      lat: Number.parseFloat(lat.toFixed(6)),
      lng: Number.parseFloat(lng.toFixed(6)),
      id: generateCabId(),
      bearing: Math.floor(Math.random() * 360),
      accuracy: Math.floor(Math.random() * 20) + 5,
    })
  }
  return cabs
}

function generateCabId(): string {
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
}

function generateRideEstimates(categories: any[], distance: number, travel_time: number, city: string) {
  const cityMultiplier = getCityMultiplier(city)
  const currentHour = new Date().getHours()
  const isPeakHour = (currentHour >= 8 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 20)

  return categories.map((category) => {
    const fareBreakup = category.fare_breakup[0]
    const baseFare =
      fareBreakup.base_fare + distance * fareBreakup.cost_per_distance + travel_time * fareBreakup.ride_cost_per_minute

    // Apply surge if applicable
    let finalFare = baseFare
    if (fareBreakup.surcharge && fareBreakup.surcharge.length > 0) {
      finalFare *= fareBreakup.surcharge[0].multiplier
    }

    const amount_min = Math.max(Math.round(finalFare * 0.9), fareBreakup.minimum_fare)
    const amount_max = Math.round(finalFare * 1.1)

    const booking_fee = Math.round(cityMultiplier * (category.id === "auto" ? 5 : 10))
    const total_tax = Math.round(((amount_min + amount_max) / 2) * 0.05) // 5% tax
    const hub_charges = generateHubCharges(city, category.id)

    return {
      category: category.id,
      distance: Number.parseFloat(distance.toFixed(1)),
      travel_time_in_minutes: travel_time,
      amount_min,
      amount_max,
      booking_fee,
      booking_fee_breakup: [
        {
          display_text: category.id === "auto" ? "Auto Booking Fee" : "Advance Booking Fee",
          value: booking_fee,
        },
      ],
      taxes: {
        total_tax,
      },
      hub_charges,
      discounts: generateDiscounts(category.id, amount_min),
      upfront: generateUpfrontPricing(amount_min, amount_max, category.id),
    }
  })
}

function generateHubCharges(city: string, categoryId: string) {
  // Hub charges are common in airports and major stations
  const hasHubCharges = Math.random() > 0.8 // 20% chance

  if (!hasHubCharges) {
    return {
      total_hub_fee: 0,
      pickup_hub_fee: 0,
      pickup_hub_name: null,
    }
  }

  const hubFee = categoryId === "auto" ? 20 : 50
  return {
    total_hub_fee: hubFee,
    pickup_hub_fee: hubFee,
    pickup_hub_name: `${city.charAt(0).toUpperCase() + city.slice(1)} pickup charge`,
  }
}

function generateDiscounts(categoryId: string, amount: number) {
  const hasDiscount = Math.random() > 0.6 // 40% chance of discount

  if (!hasDiscount) {
    return {
      discount_type: null,
      discount_code: null,
      discount_mode: null,
      discount: 0,
      cashback: 0,
      pass_savings: 0,
    }
  }

  const discountCodes = ["SAVE20", "FIRST50", "WEEKEND", "NEWUSER", "MONSOON"]
  const discountCode = discountCodes[Math.floor(Math.random() * discountCodes.length)]
  const discount = Math.floor(Math.random() * 50) + 10 // 10-60 discount
  const pass_savings = Math.floor(Math.random() * 30) + 5 // 5-35 pass savings

  return {
    discount_type: "custom",
    discount_code: discountCode,
    discount_mode: "AUTO",
    discount,
    cashback: 0,
    pass_savings,
  }
}

function generateUpfrontPricing(amount_min: number, amount_max: number, categoryId: string) {
  // Upfront pricing available for select partners
  const hasUpfront = Math.random() > 0.5 // 50% chance

  if (!hasUpfront) {
    return {
      fare: null,
      fare_id: null,
      select_discount: null,
      is_upfront_applicable: false,
    }
  }

  const upfrontFare = Math.round((amount_min + amount_max) / 2)
  const fareId = `1:${Math.floor(Math.random() * 999999)
    .toString()
    .padStart(6, "0")}:${Math.floor(Math.random() * 99999999)}-${Math.floor(Math.random() * 9999)}`

  return {
    fare: upfrontFare,
    fare_id: fareId,
    select_discount: null,
    is_upfront_applicable: true,
  }
}

function generateCancellationCharges() {
  const hasCharges = Math.random() > 0.8 // 20% chance of previous cancellation charges

  if (!hasCharges) {
    return []
  }

  const charges = []
  const numCharges = Math.floor(Math.random() * 3) + 1 // 1-3 charges

  for (let i = 0; i < numCharges; i++) {
    charges.push({
      currency: "INR",
      booking_id: `CRN${Math.floor(Math.random() * 1000000000)}`,
      amount: Math.floor(Math.random() * 50) + 15, // 15-65 INR
    })
  }

  return charges
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

function getCityMultiplier(city: string): number {
  const multipliers = {
    mumbai: 1.3,
    delhi: 1.2,
    bangalore: 1.25,
    hyderabad: 1.15,
    pune: 1.1,
    chennai: 1.15,
    kolkata: 1.05,
    unknown: 0.9,
  }
  return multipliers[city] || 0.9
}
