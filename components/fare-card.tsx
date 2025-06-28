"use client"

import { Clock, Star, TrendingUp, Crown, Zap, ExternalLink, MapPin, Moon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { FareData, RideOption } from "@/types"

interface FareCardProps {
  provider: FareData
  cheapest: any
  fastest: any
  onBook: (ride: RideOption) => void
}

export function FareCard({ provider, cheapest, fastest, onBook }: FareCardProps) {
  const isProviderCheapest = (ride: RideOption) =>
    cheapest && cheapest.provider === provider.provider && cheapest.type === ride.type

  const isProviderFastest = (ride: RideOption) =>
    fastest && fastest.provider === provider.provider && fastest.type === ride.type

  const formatPrice = (priceRange: { min: number; max: number }) => {
    return `₹${priceRange.min}-${priceRange.max}`
  }

  // Check if it's night time for Rapido
  const currentHour = new Date().getHours()
  const isNightTime = currentHour >= 22 || currentHour < 6

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{provider.logo}</span>
            <span>{provider.provider}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={provider.availability === "available" ? "default" : "secondary"}>
              {provider.availability}
            </Badge>
            {provider.provider === "Rapido" && isNightTime && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Moon className="h-3 w-3 mr-1" />
                Night Fare
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {provider.rides.map((ride, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">{ride.type}</h4>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{ride.rating.toFixed(1)}</span>
                  <span className="text-xs">({ride.reviewCount.toLocaleString()} reviews)</span>
                </div>
                {/* Show per km rate for Rapido */}
                {provider.provider === "Rapido" && ride.perKmRate && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />₹{ride.perKmRate}/km {isNightTime ? "(Night)" : "(Day)"}
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{formatPrice(ride.priceRange)}</p>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{ride.eta} min</span>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {ride.surge && (
                <Badge variant="destructive" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Surge {ride.surgeMultiplier}x
                </Badge>
              )}
              {isProviderCheapest(ride) && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                >
                  <Crown className="h-3 w-3 mr-1" />
                  Cheapest
                </Badge>
              )}
              {isProviderFastest(ride) && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Fastest
                </Badge>
              )}
              {ride.discount && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                >
                  {ride.discount}% OFF
                </Badge>
              )}
              {ride.nightFare && (
                <Badge
                  variant="outline"
                  className="text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-200"
                >
                  <Moon className="h-3 w-3 mr-1" />
                  Night Rate
                </Badge>
              )}
              {ride.availability && (
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    ride.availability === "high"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : ride.availability === "medium"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  {ride.availability} availability
                </Badge>
              )}
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-1">
              {ride.features.map((feature, featureIndex) => (
                <Badge key={featureIndex} variant="outline" className="text-xs">
                  {feature}
                </Badge>
              ))}
            </div>

            {/* Additional Info */}
            <div className="space-y-1">
              {ride.waitTime && (
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Wait time: {ride.waitTime} min
                </div>
              )}
              {ride.bookingFee && (
                <div className="text-xs text-gray-500 dark:text-gray-400">Booking fee: ₹{ride.bookingFee}</div>
              )}
            </div>

            {/* Book Button */}
            <Button
              className="w-full"
              variant={isProviderCheapest(ride) || isProviderFastest(ride) ? "default" : "outline"}
              onClick={() => onBook(ride)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Book on {provider.provider}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
