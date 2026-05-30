import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // allow phones / other devices on the LAN to load dev resources (HMR etc.)
  allowedDevOrigins: ["192.168.2.219", "*.local"],
};

export default nextConfig;
