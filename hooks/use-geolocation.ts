"use client"

import { useState, useCallback } from "react"

interface GeolocationState {
  lat: number
  lng: number
}

export function useGeolocation() {
  const [location, setLocation] = useState<GeolocationState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser")
      return Promise.reject(new Error("Geolocation not supported"))
    }

    setLoading(true)
    setError(null)

    return new Promise<GeolocationState>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setLocation(newLocation)
          setLoading(false)
          resolve(newLocation)
        },
        (error) => {
          let errorMessage = "Unable to retrieve location"

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user"
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable"
              break
            case error.TIMEOUT:
              errorMessage = "Location request timed out"
              break
          }

          setError(errorMessage)
          setLoading(false)
          reject(new Error(errorMessage))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        },
      )
    })
  }, [])

  return {
    location,
    loading,
    error,
    getCurrentLocation,
  }
}
