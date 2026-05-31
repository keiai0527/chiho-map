import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercelコスト抑制: 画像最適化を完全無効化（議員写真は元サイズで配信）
  images: {
    unoptimized: true,
  },
  // ISRを使わない: データ更新は再デプロイで反映する運用
  experimental: {},

  // セキュリティヘッダ（公開前監査で追加）
  // - X-Frame-Options: クリックジャッキング対策
  // - X-Content-Type-Options: MIME sniffing 攻撃対策
  // - Referrer-Policy: Referer 漏洩制御
  // - Permissions-Policy: 不要なブラウザAPI（カメラ・マイク等）を遮断
  // - Strict-Transport-Security: HTTPS 強制（HSTS。Vercel側でも設定済みだが二重で安全）
  // - Content-Security-Policy は厳しすぎると Stripe・Vercel Analytics 等が壊れるため
  //   現時点では入れず、公開後にツール一覧を確定してから設定（運営方針）
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=(), payment=(self)",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
