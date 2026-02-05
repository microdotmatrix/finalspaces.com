import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  cacheComponents: true,
  experimental: {
    viewTransition: true,
    useLightningcss: true,
    authInterrupts: true,
    // Enable optimized package imports
    optimizePackageImports: [
      "lucide-react",
      "@phosphor-icons/react",
      "date-fns",
      "motion",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.ufs.sh",
        pathname: "/f/*",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
        pathname: "/image/*",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/*",
      },
      {
        protocol: "https",
        hostname: "open.spotify.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.spotify.com",
        pathname: "/v1/*",
      },
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.rawg.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.themealdb.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.artic.edu",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
