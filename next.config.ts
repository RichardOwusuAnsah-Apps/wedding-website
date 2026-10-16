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
      { source: "/trad-program", destination: "/trad-program/index.html" },
      // The white wedding program. Printed on the QR code, so this source
      // path is permanent — when the html program is ready, only the
      // destination changes (to /wedding-program/index.html) and every code
      // already in circulation keeps working.
      { source: "/wedding-program", destination: "/wedding-program/program.pdf" },
    ];
  },
};

export default nextConfig;
