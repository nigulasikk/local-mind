

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals.concat(['fs', 'path','cheerio','puppeteer', 'srt-parser-2', 'langchain', 'langchain/*', 'html-to-text', 'hnswlib-node', 'd3-dsv', 'mammoth', 'epub2']);
    } else {
      // config.externals = config.externals.concat(['axios']);
    }

    return config;
  },
}

module.exports = nextConfig
