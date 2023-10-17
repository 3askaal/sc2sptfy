/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.sndcdn.com',
      },
    ],
  },
}

module.exports = nextConfig
