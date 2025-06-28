# RideWise - Cab Fare Comparison

RideWise is a sophisticated cab fare comparison application built with Next.js. It provides real-time, transparent price estimates for popular ride-hailing services in India, including Uber, Ola, and Rapido. The system is designed to emulate the official API structures of these services, using a detailed pricing model that accounts for distance, duration, traffic conditions, city-specific rates, and dynamic surge pricing.

## Key Features

- **Multi-Service Comparison:** Fetches and displays fares for Uber, Ola, and Rapido side-by-side.
- **Official API Emulation:** Implements accurate API response structures based on official documentation from services like Ola's V1 Products API and Uber's Price Estimates API.
- **Dynamic Pricing Model:** A robust fare calculation engine that considers:
    - Base fare, per-kilometer, and per-minute charges.
    - City-specific pricing multipliers for major Indian cities.
    - Real-time surge pricing based on peak hours, traffic, and simulated demand.
    - Nightly fare adjustments for services like Rapido.
- **Interactive Location Search:**
    - Autocomplete for pickup and drop-off locations using the Google Places API (with a built-in fallback for local Indian cities).
    - "Use Current Location" feature leveraging the browser's Geolocation API.
- **Detailed Route Information:** Calculates and displays estimated route distance, travel time, and current traffic conditions.
- **Smart Recommendations:** Highlights the cheapest and fastest ride options for quick decision-making.
- **Modern Tech Stack:** Built with Next.js (App Router), TypeScript, and styled with Tailwind CSS.
- **Component-Based UI:** Leverages shadcn/ui for a clean, accessible, and responsive user interface.

## How It Works

The application's core logic is designed to simulate a real-world fare aggregator:

1.  **User Input**: The user selects pickup and drop-off locations via the `LocationInput` component on the homepage.
2.  **Route Calculation**: A request is sent to the internal `/api/maps/distance-matrix` endpoint, which fetches the distance, duration, and traffic data.
3.  **Fare Estimation**: The frontend then calls the `scrapeRealFares` service. This orchestrates requests to backend endpoints that emulate the official APIs of Uber, Ola, and Rapido.
4.  **API Emulation**: Each provider-specific API endpoint (e.g., `/api/pricing/ola-v1-products`) uses a dedicated fare calculator (e.g., `lib/ola-official-api.ts`) to generate a realistic fare estimate. These calculators factor in base rates, city multipliers, surge pricing, and other dynamic variables.
5.  **Display Results**: The aggregated fare data is sent back to the frontend and rendered in `FareCard` components, providing a clear comparison for the user.

## Technology Stack

- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui, Radix UI, Lucide React
- **State Management:** React Hooks (useState, useGeolocation)
- **Forms:** React Hook Form
- **Maps & Geocoding:** Google Maps API (with local fallback)
- **Deployment:** Vercel (or any Node.js environment)

## Project Structure

The repository is organized following modern Next.js conventions:
- **`/app`**: Main application directory, containing pages, layouts, and API routes.
    - **`/app/api/pricing`**: Contains the backend endpoints that emulate the official pricing APIs for each ride-hailing service.
    - **`/app/api/maps`**: Proxies requests to mapping services.
    - **`/app/api/places`**: Handles location autocomplete and details lookups.
- **`/components`**: Reusable React components, including custom UI and shadcn/ui components.
- **`/lib`**: Core application logic.
    - `official-api-service.ts`: Orchestrates calls to the emulated provider APIs.
    - `*-fare-calculator.ts` & `*-official-api.ts`: Contain the detailed pricing models and logic for each service.
- **`/hooks`**: Custom React hooks, such as `use-geolocation`.
- **`/types`**: TypeScript type definitions for the application's data structures.

## Getting Started

### 1. Prerequisites
- Node.js (v18.17.0 or later)
- pnpm (or npm/yarn)

### 2. Clone the Repository
```bash
git clone https://github.com/ombhayde/cab-price-compare.git
cd cab-price-compare
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Set Up Environment Variables
This project uses the Google Maps API for location services.

1.  Create a `.env.local` file in the root of the project.
2.  Add your Google Maps API key to the file:
    ```env
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
    ```

> **Note:** The application includes a fallback mechanism for development. If the Google Maps API key is not provided, it will use a pre-defined list of Indian cities for location search and the Haversine formula for distance calculation. This allows you to run the app for testing purposes without an API key.

### 5. Run the Development Server
```bash
npm dev
```
The application will be available at `http://localhost:3000`.
