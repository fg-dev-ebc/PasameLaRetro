import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  htmlLimitedBots: /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|Slackbot|Discordbot/i,
  experimental: {
    serverActions: {
      bodySizeLimit: "90mb",
    },
    proxyClientMaxBodySize: "90mb",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
