export interface LocationData {
  address: string
  description?: string
  lat: number
  lng: number
  placeId: string
}

export interface RideOption {
  type: string
  priceRange: {
    min: number
    max: number
  }
  eta: number
  surge: boolean
  surgeMultiplier: number
  rating: number
  reviewCount: number
  features: string[]
  waitTime?: number
  discount?: number
  // Rapido-specific fields
  nightFare?: boolean
  perKmRate?: number
  bookingFee?: number
  availability?: "high" | "medium" | "low"
}

export interface FareData {
  provider: string
  logo: string
  availability: "available" | "unavailable" | "limited"
  bookingUrl: string
  rides: RideOption[]
}

export interface SavedRoute {
  id: string
  name: string
  pickup: LocationData
  dropoff: LocationData
  createdAt: Date
  lastUsed: Date
  usageCount: number
}

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  preferences: {
    preferredProvider?: string
    maxPrice?: number
    preferredRideType?: string
  }
  savedRoutes: SavedRoute[]
}
