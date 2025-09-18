import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // In dev hinter Proxys (z. B. Codespaces) kann der Origin vom Forwarded-Host abweichen.
      // Wir erlauben hier alle Origins, um Server Actions nicht zu blockieren.
      allowedOrigins: ["*"],
    },
  },
};

export default nextConfig;
