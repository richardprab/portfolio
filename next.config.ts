import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // PortfolioCard requests quality={90}; Next 16 rejects qualities that
    // are not allowlisted here, which would 400 the optimized images in prod.
    qualities: [75, 90],
  },
};

export default nextConfig;
