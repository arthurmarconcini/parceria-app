import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.freepik.com",
      },
      {
        protocol: "https",
        hostname: "br.freepik.com",
      },
      {
        protocol: "https",
        hostname: "parceria-app-imagens-de-produtos.s3.us-east-2.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
