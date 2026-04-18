import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  headers() {
    return Promise.resolve([
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            // Using 'credentialless' instead of 'require-corp':
            // MediaPipe CDN (storage.googleapis.com) does not serve
            // Cross-Origin-Resource-Policy headers, so 'require-corp'
            // would block model loading. 'credentialless' enables
            // SharedArrayBuffer (needed by WASM workers) while allowing
            // anonymous cross-origin fetches — the correct choice for
            // apps loading third-party ML models from CDN.
            key: "Cross-Origin-Embedder-Policy",
            value: "credentialless",
          },
        ],
      },
    ]);
  },
};

export default nextConfig;
