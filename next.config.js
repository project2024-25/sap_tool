/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Skip ESLint during builds to focus on functionality
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
