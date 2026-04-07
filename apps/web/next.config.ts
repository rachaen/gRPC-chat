import type { NextConfig } from 'next';

/** 브라우저는 /grpc-web 만 호출하고, Next 서버가 여기로 프록시 → CORS 없음 */
const GRPC_WEB_PROXY_TARGET =
  process.env.GRPC_WEB_PROXY_TARGET?.replace(/\/$/, '') ?? 'http://127.0.0.1:8080';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/grpc-web/:path*',
        destination: `${GRPC_WEB_PROXY_TARGET}/:path*`,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
