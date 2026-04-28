import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization settings
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year for static images
  },

  // Compression and optimization
  compress: true,

  // Configure headers for caching static assets
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=10, stale-while-revalidate=59',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Redirects for backward compatibility
  async redirects() {
    return [
      // Example redirect - add as needed
      // {
      //   source: '/old-path/:path*',
      //   destination: '/new-path/:path*',
      //   permanent: true,
      // },
    ];
  },

  // Rewrites for cleaner URLs
  async rewrites() {
    return {
      beforeFiles: [
        // Example rewrite
        // {
        //   source: '/api/:path*',
        //   destination: '/api/:path*',
        // },
      ],
    };
  },

  // TypeScript configuration
  typescript: {
    tsconfigPath: './tsconfig.json',
  },

  // Experimental features for Next.js 16
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'zustand',
    ],
  },

  // Production source maps (optional - helps with debugging)
  productionBrowserSourceMaps: false,

  // React strict mode for development
  reactStrictMode: true,

  // PoweredByHeader disabled for security
  poweredByHeader: false,

  // Generate ETags for static content
  generateEtags: true,

  // Trailing slash config
  trailingSlash: false,

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_NAME: 'iyiki',
  },
};

export default nextConfig;
