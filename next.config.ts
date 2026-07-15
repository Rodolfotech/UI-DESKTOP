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

  // ═══ Bundle optimization ═══════════════════════════════════════

  // Compress output for faster loading (production only)
  compress: isProd,

  // Generate source maps in production for debugging (only in analyzer mode)
  productionBrowserSourceMaps: process.env.ANALYZE === "true",

  // Optimize server-side chunks (even though we use static export)
  // This helps reduce the shared chunk size
  experimental: {
    // Optimize package imports for tree-shaking
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-avatar",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-tabs",
      "@radix-ui/react-select",
      "@radix-ui/react-toast",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-switch",
      "@radix-ui/react-radio-group",
      "@ant-design/icons",
      "@carbon/icons-react",
    ],
  },
}

export default nextConfig
