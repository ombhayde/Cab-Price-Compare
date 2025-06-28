import { Shield, Zap, Users, Heart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"

const features = [
  {
    icon: <Zap className="h-8 w-8 text-yellow-500" />,
    title: "Real-time Comparison",
    description: "Compare fares from multiple cab services instantly with live pricing and availability.",
  },
  {
    icon: <Shield className="h-8 w-8 text-green-500" />,
    title: "Transparent Pricing",
    description: "No hidden fees. See surge pricing, taxes, and total costs upfront before booking.",
  },
  {
    icon: <Users className="h-8 w-8 text-blue-500" />,
    title: "User Reviews",
    description: "Make informed decisions with ratings and reviews from real passengers.",
  },
  {
    icon: <Heart className="h-8 w-8 text-red-500" />,
    title: "Save Favorites",
    description: "Save frequently used routes and get personalized recommendations.",
  },
]

const stats = [
  { number: "50K+", label: "Happy Users" },
  { number: "1M+", label: "Rides Compared" },
  { number: "₹2Cr+", label: "Money Saved" },
  { number: "3", label: "Cab Partners" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">About RideWise</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            We're on a mission to make urban transportation more transparent, affordable, and convenient for everyone in
            India.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Why Choose RideWise?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {feature.icon}
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Story Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Our Story</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 text-center max-w-4xl mx-auto">
              RideWise was born out of frustration with the lack of transparency in ride-hailing services. Our founders,
              frequent commuters in Delhi, noticed how surge pricing and varying fares across different platforms made
              it difficult to make informed decisions. We built RideWise to solve this problem by providing a single
              platform where users can compare real-time fares, see transparent pricing, and choose the best option for
              their needs.
            </p>
          </CardContent>
        </Card>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                To empower commuters with transparent, real-time information about ride options, helping them make
                informed decisions and save money on their daily travels.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                To become India's most trusted platform for ride comparison, expanding to all major cities and
                integrating with public transportation for comprehensive mobility solutions.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Get in Touch</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Have questions, suggestions, or want to partner with us?
            </p>
            <div className="space-y-2">
              <p>📧 hello@ridewise.in</p>
              <p>📱 +91 98765 43210</p>
              <p>📍 New Delhi, India</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
