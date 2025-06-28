import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { pickup, dropoff } = await request.json()

    console.log("=== REAL RAPIDO SCRAPING STARTED ===")
    console.log("Pickup:", pickup)
    console.log("Dropoff:", dropoff)

    // Real Rapido scraping using their mobile API
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      "Content-Type": "application/json",
      Origin: "https://rapido.bike",
      Referer: "https://rapido.bike/",
      "X-Requested-With": "XMLHttpRequest",
    }

    // Try Rapido's fare estimation endpoints
    const rapidoApiEndpoints = [
      "https://rapido.bike/api/ride/estimate",
      "https://api.rapido.bike/api/otp/ride/search",
      "https://rapido.bike/api/otp/ride/fare-estimate",
    ]

    let rapidoResponse = null

    for (const endpoint of rapidoApiEndpoints) {
      try {
        console.log(`Trying Rapido endpoint: ${endpoint}`)

        const requestBody = {
          pickup: {
            latitude: pickup.lat,
            longitude: pickup.lng,
            address: pickup.address,
          },
          destination: {
            latitude: dropoff.lat,
            longitude: dropoff.lng,
            address: dropoff.address,
          },
          ride_type: "all",
          vehicle_type: "all",
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(requestBody),
        })

        if (response.ok) {
          const contentType = response.headers.get("content-type")

          if (contentType && contentType.includes("application/json")) {
            const data = await response.json()
            console.log("Rapido API response:", data)

            if (data.rides || data.estimates || data.fare_estimates) {
              rapidoResponse = data
              break
            }
          }
        }
      } catch (error) {
        console.log(`Rapido endpoint ${endpoint} failed:`, error.message)
        continue
      }
    }

    // If API failed, try scraping the booking page
    if (!rapidoResponse) {
      console.log("Trying Rapido booking page scraping...")
      rapidoResponse = await scrapeRapidoBookingPage(pickup, dropoff, headers)
    }

    if (rapidoResponse) {
      const fares = parseRapidoResponse(rapidoResponse)

      if (fares && fares.length > 0) {
        console.log("Successfully scraped Rapido fares:", fares)

        return NextResponse.json({
          success: true,
          fares,
          availability: "available",
          bookingUrl: `https://rapido.bike/ride?pickup_lat=${pickup.lat}&pickup_lng=${pickup.lng}&drop_lat=${dropoff.lat}&drop_lng=${dropoff.lng}`,
          source: "real_website_scraping",
          scrapedAt: new Date().toISOString(),
        })
      }
    }

    throw new Error("All Rapido scraping methods failed")
  } catch (error) {
    console.error("Real Rapido scraping error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      fares: [],
      source: "scraping_failed",
    })
  }
}

async function scrapeRapidoBookingPage(pickup: any, dropoff: any, headers: any) {
  try {
    const bookingUrl = `https://rapido.bike/ride?pickup_lat=${pickup.lat}&pickup_lng=${pickup.lng}&drop_lat=${dropoff.lat}&drop_lng=${dropoff.lng}`

    console.log("Scraping Rapido booking page:", bookingUrl)

    const response = await fetch(bookingUrl, {
      method: "GET",
      headers: {
        ...headers,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
    })

    if (response.ok) {
      const html = await response.text()
      console.log(`Rapido page response length: ${html.length}`)

      // Look for embedded JSON data or API calls
      const scriptMatches = html.match(/<script[^>]*>(.*?)<\/script>/gs)

      if (scriptMatches) {
        for (const script of scriptMatches) {
          if (script.includes("fare") || script.includes("estimate") || script.includes("ride")) {
            try {
              // Look for API endpoints or data
              const apiMatches = script.match(/fetch\(['"`]([^'"`]+)['"`]/g)

              if (apiMatches) {
                for (const apiMatch of apiMatches) {
                  const url = apiMatch.match(/fetch\(['"`]([^'"`]+)['"`]/)?.[1]

                  if (url && (url.includes("fare") || url.includes("estimate"))) {
                    console.log("Found Rapido API endpoint:", url)

                    try {
                      const apiResponse = await fetch(url, {
                        method: "GET",
                        headers,
                      })

                      if (apiResponse.ok) {
                        const apiData = await apiResponse.json()
                        if (apiData.rides || apiData.estimates) {
                          return apiData
                        }
                      }
                    } catch (apiError) {
                      continue
                    }
                  }
                }
              }

              // Extract JSON objects
              const jsonMatches = script.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g)

              if (jsonMatches) {
                for (const jsonStr of jsonMatches) {
                  try {
                    const data = JSON.parse(jsonStr)

                    if (data.rides || data.estimates || data.fare_estimates) {
                      console.log("Found Rapido fare data in page:", data)
                      return data
                    }
                  } catch (parseError) {
                    continue
                  }
                }
              }
            } catch (error) {
              continue
            }
          }
        }
      }
    }
  } catch (error) {
    console.log("Rapido booking page scraping failed:", error.message)
  }

  return null
}

function parseRapidoResponse(data: any): any[] {
  try {
    console.log("Parsing Rapido response...")

    const fares: any[] = []

    // Parse different response formats
    if (data.rides) {
      data.rides.forEach((ride: any) => {
        fares.push({
          vehicleType: ride.vehicle_type || ride.ride_type,
          minFare: ride.min_fare || ride.fare?.min_fare,
          maxFare: ride.max_fare || ride.fare?.max_fare,
          eta: ride.eta || ride.pickup_eta,
          surgeActive: ride.surge_active || false,
          surgeMultiplier: ride.surge_multiplier || 1.0,
          currency: "INR",
        })
      })
    }

    if (data.estimates) {
      data.estimates.forEach((estimate: any) => {
        fares.push({
          vehicleType: estimate.vehicle_type || estimate.ride_type,
          minFare: estimate.min_fare,
          maxFare: estimate.max_fare,
          eta: estimate.eta,
          surgeActive: estimate.surge_active,
          surgeMultiplier: estimate.surge_multiplier || 1.0,
          currency: "INR",
        })
      })
    }

    if (data.fare_estimates) {
      data.fare_estimates.forEach((fareEst: any) => {
        fares.push({
          vehicleType: fareEst.vehicle_type,
          minFare: fareEst.fare.min_fare,
          maxFare: fareEst.fare.max_fare,
          eta: fareEst.eta,
          surgeActive: fareEst.surge_active,
          surgeMultiplier: fareEst.surge_multiplier || 1.0,
          currency: "INR",
        })
      })
    }

    console.log(`Parsed ${fares.length} fares from Rapido response`)
    return fares
  } catch (error) {
    console.error("Error parsing Rapido response:", error)
    return []
  }
}
