import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  devIndicators: false,
  output: 'standalone',
  experimental: {
    devtoolSegmentExplorer: false,
  },
  outputFileTracingRoot: path.resolve(__dirname, '../..'),
  transpilePackages: ['@crypto-tracker/shared'],
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    };

    return config;
  },
};

export default nextConfig;
