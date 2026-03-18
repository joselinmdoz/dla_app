/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Deshabilitar optimizaciones de fuentes que causan problemas
    optimizeCss: false,
  },
}

export default nextConfig
