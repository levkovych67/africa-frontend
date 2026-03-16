import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "africa-shop-dev.s3.eu-north-1.amazonaws.com",
        pathname: "/products/**",
      },
    ],
  },
};

export default nextConfig;
