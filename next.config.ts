import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercelコスト抑制: 画像最適化を完全無効化（議員写真は元サイズで配信）
  images: {
    unoptimized: true,
  },
  // ISRを使わない: データ更新は再デプロイで反映する運用
  experimental: {},
};

export default nextConfig;
