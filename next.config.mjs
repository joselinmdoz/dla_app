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
  // Usar webpack en lugar de turbopack para evitar bugs de fuentes
  turbopack: false,
}

export default nextConfig
