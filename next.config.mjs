// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },

  async rewrites() {
    return [
      // ya existente: proxy a tu auth-backend
      { source: "/api/:path*", destination: "https://auth-google-c.vercel.app/:path*" },
      // NUEVO: proxy al servidor EEG en Render
      { source: "/eeg-api/:path*", destination: "https://server-eeg.onrender.com/:path*" },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
        ],
      },
    ];
  },
};

export default nextConfig;
