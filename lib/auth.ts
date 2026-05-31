import "server-only";
import { headers } from "next/headers";
import crypto from "node:crypto";

// IP ハッシュ取得（個人特定不能、レート制限・ログ用）
export async function getClientIpHash(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "unknown";
  const ipRaw = fwd.split(",")[0]?.trim() ?? "unknown";
  return crypto
    .createHash("sha256")
    .update(ipRaw + (process.env.IP_HASH_SALT ?? "chihomap"))
    .digest("hex")
    .slice(0, 32);
}

// 管理者用サーバーアクションで使用：Basic Auth ヘッダーをサーバーアクション側でも検証する。
// proxy.ts で 1 段目を防いでいるが、サーバーアクションは別エンドポイントから直接叩かれる
// 可能性があるため、二重に防御する。
export async function requireAdminAuth(): Promise<void> {
  const expected = process.env.OP_CONSOLE_PASSWORD;
  if (!expected) {
    throw new Error("UNAUTHORIZED");
  }
  const auth = (await headers()).get("authorization");
  if (!auth?.startsWith("Basic ")) {
    throw new Error("UNAUTHORIZED");
  }
  let pass = "";
  try {
    const decoded = Buffer.from(auth.slice("Basic ".length), "base64").toString("utf-8");
    const idx = decoded.indexOf(":");
    pass = decoded.slice(idx + 1);
  } catch {
    throw new Error("UNAUTHORIZED");
  }
  if (pass !== expected) {
    throw new Error("UNAUTHORIZED");
  }
}
