import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Static files from /public. /_next/static is already immutable by default.
        // These are cached for a year, so RENAME a file whenever its content changes.
        source: "/:path*.(png|jpg|jpeg|svg|ico|webp|woff2)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
