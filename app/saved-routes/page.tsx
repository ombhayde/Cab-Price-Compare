"use client"

import { useState, useEffect } from "react"
import { MapPin, Trash2, Plus, Clock, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import type { SavedRoute } from "@/types"

export default function SavedRoutesPage() {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load saved routes from localStorage or API
    loadSavedRoutes()
  }, [])

  const loadSavedRoutes = async () => {
    try {
      // In a real app, this would be an API call
      const stored = localStorage.getItem("ridewise-saved-routes")
      if (stored) {
        const routes = JSON.parse(stored)
        setSavedRoutes(routes)
      }
    } catch (error) {
      console.error("Error loading saved routes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRoute = async (id: string) => {
    try {
      const updatedRoutes = savedRoutes.filter((route) => route.id !== id)
      setSavedRoutes(updatedRoutes)
      localStorage.setItem("ridewise-saved-routes", JSON.stringify(updatedRoutes))
    } catch (error) {
      console.error("Error deleting route:", error)
    }
  }

  const handleUseRoute = (route: SavedRoute) => {
    // Update usage count and last used
    const updatedRoute = {
      ...route,
      lastUsed: new Date(),
      usageCount: route.usageCount + 1,
    }

    const updatedRoutes = savedRoutes.map((r) => (r.id === route.id ? updatedRoute : r))

    setSavedRoutes(updatedRoutes)
    localStorage.setItem("ridewise-saved-routes", JSON.stringify(updatedRoutes))

    // Navigate to home with pre-filled locations
    window.location.href = `/?pickup=${encodeURIComponent(route.pickup.address)}&dropoff=${encodeURIComponent(route.dropoff.address)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-48">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Saved Routes</h1>
              <p className="text-gray-600 dark:text-gray-300">Quick access to your frequently used routes</p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Route
            </Button>
          </div>

          {savedRoutes.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-semibold mb-2">No saved routes yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Save your frequently used routes for quick access and fare tracking
                </p>
                <Button onClick={() => (window.location.href = "/")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Comparing Fares
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {savedRoutes.map((route) => (
                <Card key={route.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        {route.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Used {route.usageCount} times</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRoute(route.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Route Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                          <span className="text-gray-600 dark:text-gray-400">From:</span>
                          <span className="font-medium">{route.pickup.address}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 bg-red-500 rounded-full" />
                          <span className="text-gray-600 dark:text-gray-400">To:</span>
                          <span className="font-medium">{route.dropoff.address}</span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <p className="text-sm font-medium text-blue-600">Last Used</p>
                          </div>
                          <p className="text-xs text-gray-500">{new Date(route.lastUsed).toLocaleDateString()}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <p className="text-sm font-medium text-green-600">Frequency</p>
                          </div>
                          <p className="text-xs text-gray-500">{route.usageCount} trips</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <MapPin className="h-4 w-4 text-purple-600" />
                            <p className="text-sm font-medium text-purple-600">Created</p>
                          </div>
                          <p className="text-xs text-gray-500">{new Date(route.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4">
                        <Button className="flex-1" onClick={() => handleUseRoute(route)}>
                          Compare Fares Now
                        </Button>
                        <Button variant="outline">Edit Route</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
