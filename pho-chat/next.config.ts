import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  images: {
    remotePatterns: [
      // Add domains as needed
      // { protocol: "https", hostname: "images.example.com" },
    ],
  },
  // Public env vars should be prefixed NEXT_PUBLIC_
  // Example: process.env.NEXT_PUBLIC_API_URL will be inlined at build-time
};

export default nextConfig;
