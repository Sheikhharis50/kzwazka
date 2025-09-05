/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",   // when you call /api/*
        // eslint-disable-next-line no-undef
        destination: `http://localhost:${process.env.SERVER_PORT}/api/:path*`, // forward to your NestJS server
      },
    ];
  },
};

export default nextConfig;
