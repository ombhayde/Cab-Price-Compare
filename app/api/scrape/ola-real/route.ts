import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { pickup, dropoff } = await request.json()

    console.log("=== REAL OLA SCRAPING STARTED ===")
    console.log("Pickup:", pickup)
    console.log("Dropoff:", dropoff)

    // Real Ola scraping using their booking API
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 12; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Type": "application/json",
      Origin: "https://book.olacabs.com",
      Referer: "https://book.olacabs.com/",
      "X-Requested-With": "XMLHttpRequest",
    }

    // Try Ola's fare estimation API
    const olaApiEndpoints = [
      "https://book.olacabs.com/api/rideEstimate",
      "https://devapi.olacabs.com/v1/products",
      "https://api.olacabs.com/v1/estimates/fare",
    ]

    let olaResponse = null

    for (const endpoint of olaApiEndpoints) {
      try {
        console.log(`Trying Ola endpoint: ${endpoint}`)

        const requestBody = {
          pickup_lat: pickup.lat,
          pickup_lng: pickup.lng,
          drop_lat: dropoff.lat,
          drop_lng: dropoff.lng,
          pickup_address: pickup.address,
          drop_address: dropoff.address,
          category: "all",
          service_type: "p2p",
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
            console.log("Ola API response:", data)

            if (data.categories || data.estimates || data.products) {
              olaResponse = data
              break
            }
          }
        }
      } catch (error) {
        console.log(`Ola endpoint ${endpoint} failed:`, error.message)
        continue
      }
    }

    // If API failed, try scraping the booking page
    if (!olaResponse) {
      console.log("Trying Ola booking page scraping...")
      olaResponse = await scrapeOlaBookingPage(pickup, dropoff, headers)
    }

    if (olaResponse) {
      const fares = parseOlaResponse(olaResponse)

      if (fares && fares.length > 0) {
        console.log("Successfully scraped Ola fares:", fares)

        return NextResponse.json({
          success: true,
          fares,
          availability: "available",
          bookingUrl: `https://book.olacabs.com/?serviceType=p2p&pickup_lat=${pickup.lat}&pickup_lng=${pickup.lng}&drop_lat=${dropoff.lat}&drop_lng=${dropoff.lng}`,
          source: "real_website_scraping",
          scrapedAt: new Date().toISOString(),
        })
      }
    }

    throw new Error("All Ola scraping methods failed")
  } catch (error) {
    console.error("Real Ola scraping error:", error)
    return NextResponse.json({
      success: false,
      error: error.message,
      fares: [],
      source: "scraping_failed",
    })
  }
}

async function scrapeOlaBookingPage(pickup: any, dropoff: any, headers: any) {
  try {
    const bookingUrl = `https://book.olacabs.com/?serviceType=p2p&pickup_lat=${pickup.lat}&pickup_lng=${pickup.lng}&drop_lat=${dropoff.lat}&drop_lng=${dropoff.lng}`

    console.log("Scraping Ola booking page:", bookingUrl)

    const response = await fetch(bookingUrl, {
      method: "GET",
      headers: {
        ...headers,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
    })

    if (response.ok) {
      const html = await response.text()
      console.log(`Ola page response length: ${html.length}`)

      // Look for embedded JSON data
      const scriptMatches = html.match(/<script[^>]*>(.*?)<\/script>/gs)

      if (scriptMatches) {
        for (const script of scriptMatches) {
          if (script.includes("categories") || script.includes("fare") || script.includes("estimate")) {
            try {
              // Extract JSON objects
              const jsonMatches = script.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g)

              if (jsonMatches) {
                for (const jsonStr of jsonMatches) {
                  try {
                    const data = JSON.parse(jsonStr)

                    if (data.categories || data.estimates || data.fareEstimate) {
                      console.log("Found Ola fare data in page:", data)
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
    console.log("Ola booking page scraping failed:", error.message)
  }

  return null
}

function parseOlaResponse(data: any): any[] {
  try {
    console.log("Parsing Ola response...")

    const fares: any[] = []

    // Parse different response formats
    if (data.categories) {
      data.categories.forEach((category: any) => {
        fares.push({
          categoryDisplayName: category.display_name || category.category_display_name,
          minFare: category.min_fare || category.fare_breakup?.min_fare,
          maxFare: category.max_fare || category.fare_breakup?.max_fare,
          eta: category.eta || category.pickup_eta,
          surgeActive: category.surge_active || false,
          surgeMultiplier: category.surge_multiplier || 1.0,
          currency: "INR",
        })
      })
    }

    if (data.estimates) {
      data.estimates.forEach((estimate: any) => {
        fares.push({
          categoryDisplayName: estimate.display_name,
          minFare: estimate.min_fare,
          maxFare: estimate.max_fare,
          eta: estimate.eta,
          surgeActive: estimate.surge_active,
          surgeMultiplier: estimate.surge_multiplier || 1.0,
          currency: "INR",
        })
      })
    }

    if (data.products) {
      data.products.forEach((product: any) => {
        fares.push({
          categoryDisplayName: product.name || product.display_name,
          minFare: product.fare?.min_fare || product.min_fare,
          maxFare: product.fare?.max_fare || product.max_fare,
          eta: product.eta,
          surgeActive: product.surge_active,
          surgeMultiplier: product.surge_multiplier || 1.0,
          currency: "INR",
        })
      })
    }

    console.log(`Parsed ${fares.length} fares from Ola response`)
    return fares
  } catch (error) {
    console.error("Error parsing Ola response:", error)
    return []
  }
}
