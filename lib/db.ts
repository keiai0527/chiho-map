import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url && process.env.NODE_ENV !== "production") {
  console.warn("[db] DATABASE_URL is not set");
}

/**
 * Neon serverless client（HTTP）
 *
 * DATABASE_URL が未設定の場合、`neon(placeholder)` が URL parse エラーで
 * モジュール load 時にクラッシュする → Vercel ビルド全体が失敗するため、
 * 未設定時はダミー sql 関数を export し、呼び出し時に reject させる。
 *
 * 呼び出し側は try/catch でこの reject を捕捉して、UI を「DB 未設定」状態で
 * graceful にフォールバックする想定。
 *
 * 地方議員マップは国会議員マップ（diet-map）と同じ Neon プロジェクトを共有するが、
 * テーブル名に "_chiho" サフィックスを付けることで完全分離する（lib/server-store.ts 参照）。
 */
function makeDummySql(): NeonQueryFunction<false, false> {
  const fn = () =>
    Promise.reject(
      new Error(
        "[db] DATABASE_URL is not set; database operations are disabled in this build.",
      ),
    );
  return fn as unknown as NeonQueryFunction<false, false>;
}

export const sql: NeonQueryFunction<false, false> = url
  ? neon(url)
  : makeDummySql();
