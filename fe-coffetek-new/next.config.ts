import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    buildActivity: false,
  },
  images: {
    domains: ["cdn.pixabay.com", "images.unsplash.com", "your-server.com"],
  },
};

export default nextConfig;
