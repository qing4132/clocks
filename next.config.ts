import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig = (phase: string): NextConfig => ({
  output: "export",
  pageExtensions: phase === PHASE_DEVELOPMENT_SERVER
    ? ["dev.tsx", "dev.ts", "tsx", "ts", "jsx", "js"]
    : ["tsx", "ts", "jsx", "js"],
  images: { unoptimized: true },
  trailingSlash: true,
  // allow phones / other devices on the LAN to load dev resources (HMR etc.)
  allowedDevOrigins: ["192.168.2.170", "192.168.2.219", "192.168.2.*", "*.local"],
});

export default nextConfig;
