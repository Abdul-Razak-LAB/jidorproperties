const nextConfig = {
  reactStrictMode: true,
  onDemandEntries: {
    // Keep pages in memory longer to avoid intermittent module-missing races in dev.
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 20,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Avoid flaky filesystem cache writes that can corrupt chunks on Windows.
      config.cache = {
        type: 'memory',
      };
    }
    return config;
  },
};

export default nextConfig;
