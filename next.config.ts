import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      // socket.io → agent-service (supports ws upgrade; works both direct and via gateway)
      {
        source: "/socket.io/:path*",
        destination: "http://127.0.0.1:3031/socket.io/:path*",
      },
    ];
  },
};

export default nextConfig;
