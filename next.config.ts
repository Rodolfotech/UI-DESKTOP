import type { NextConfig } from "next"

const isProd = process.env.NODE_ENV === "production"
const internalHost = process.env.TAURI_DEV_HOST || "localhost"

const nextConfig: NextConfig = {
  // Static export — required for Tauri desktop builds
  output: "export",

  // Disable image optimization (no server needed for static export)
  images: {
    unoptimized: true,
  },

  // Asset prefix for Tauri dev mode
  assetPrefix: isProd ? undefined : `http://${internalHost}:3000`,

  // Disable ESLint during build (runs separately)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript errors during build (checked separately)
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
