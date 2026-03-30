import type { NextConfig } from "next";
import withPWA from "next-pwa";

const withPWAConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?:\/\/[^/]+\/(?:admin(?:\/.*)?|api\/admin\/.*)$/i,
      handler: "NetworkOnly",
      options: {
        cacheName: "admin-network-only-v1",
      },
    },
    {
      urlPattern:
        /^https?:\/\/[^/]+\/(?:$|tours(?:\/.*)?|search(?:\/.*)?|profile(?:\/.*)?|offline(?:\/.*)?)$/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "public-pages-v2",
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 14,
        },
      },
    },
    {
      urlPattern:
        /^https?:\/\/[^/]+\/api\/(?:tours(?:\/.*)?|weather(?:\/.*)?)(?:\?.*)?$/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "public-api-v2",
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 14,
        },
      },
    },
    {
      urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "osm-tiles-v1",
        expiration: {
          maxEntries: 500,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
    {
      urlPattern: /^https:\/\/unpkg\.com\/maplibre-gl@.*$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "maplibre-assets-v1",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
  ],
  fallbacks: {
    document: "/offline",
  },
});

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default withPWAConfig(nextConfig);
