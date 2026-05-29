import Stripe from "stripe";

// サーバー側でのみ使用する Stripe クライアント
// 地方議員マップは国会議員マップ（diet-map）と同じ Stripe アカウントを共有する。
// 商品メタデータの `kind` フィールドで「kokkai」「chiho」を区別する設計。
const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey) {
  // ビルド時のみ通る経路（実行時は必ず env 設定済み前提）
  console.warn("[stripe] STRIPE_SECRET_KEY is not set");
}

// apiVersion を指定しないと SDK の既定（インストール時の最新版）が使われる。
export const stripe = new Stripe(apiKey ?? "sk_placeholder");

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// クライアント側で使う公開可能キー
export const STRIPE_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY ?? "";
