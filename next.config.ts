import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Supabase Storage public objects. Wildcard host covers any project ref,
    // scoped to the public object path so only published files are allowed.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async rewrites() {
    return [
      { source: "/wedding-invite", destination: "/wedding-invite/index.html" },
    ];
  },
};

export default nextConfig;
