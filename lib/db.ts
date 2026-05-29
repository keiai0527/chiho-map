import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url && process.env.NODE_ENV !== "production") {
  console.warn("[db] DATABASE_URL is not set");
}

// Neon serverless client（HTTP）
// Vercel の Edge / Node ランタイム両方で動作する。
// 地方議員マップは国会議員マップ（diet-map）と同じ Neon プロジェクトを共有するが、
// テーブル名に "_chiho" サフィックスを付けることで完全分離する（lib/server-store.ts 参照）。
export const sql = neon(url ?? "postgresql://placeholder/placeholder");
