/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["puppeteer", "sharp"],
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
