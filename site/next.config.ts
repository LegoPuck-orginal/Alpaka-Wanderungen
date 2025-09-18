import type { NextConfig } from "next";

function computeAllowedOrigins() {
  const origins = new Set<string>();
  // Immer localhost erlauben
  origins.add("localhost:3000");
  origins.add("127.0.0.1:3000");
  // Codespaces
  const csName = process.env.CODESPACE_NAME;
  const csDomain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;
  if (csName && csDomain) {
    origins.add(`${csName}-3000.${csDomain}`);
  }
  // Gitpod
  const gpUrl = process.env.GITPOD_WORKSPACE_URL;
  if (gpUrl) {
    try {
      const u = new URL(gpUrl);
      // Gitpod forwarded host ist meist 3000-<hostname>
      origins.add(`3000-${u.hostname}`);
    } catch {}
  }
  return ["*", ...origins];
}

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // In dev hinter Proxys (z. B. Codespaces) kann der Origin vom Forwarded-Host abweichen.
      // Wir erlauben hier alle Origins, um Server Actions nicht zu blockieren.
      allowedOrigins: computeAllowedOrigins(),
    },
  },
};

export default nextConfig;
