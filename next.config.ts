import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: "https://eloquence-api.up.railway.app/:path*",
      },
    ];
  },
};

export default nextConfig;
