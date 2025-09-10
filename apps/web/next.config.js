/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kzwazka.fra1.cdn.digitaloceanspaces.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*', // when you call /api/*
        // eslint-disable-next-line no-undef
        destination: `http://localhost:${process.env.SERVER_PORT}/api/:path*`, // forward to your NestJS server
      },
    ];
  },
};

export default nextConfig;
