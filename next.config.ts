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
      // The white wedding program. Printed on the qr code, so this source
      // path is permanent; only the destination behind it ever changes. It
      // served a placeholder pdf until the html was ready.
      { source: "/wedding-program", destination: "/wedding-program/index.html" },
      {
        source: "/reception-program-and-menu",
        destination: "/reception-program-and-menu/index.html",
      },
    ];
  },
  async redirects() {
    return [
      // "recpetion" is an easy slip, and the url goes on printed cards where a
      // typo cannot be taken back. Catch it rather than serve a 404.
      {
        source: "/recpetion-program-and-menu",
        destination: "/reception-program-and-menu",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
