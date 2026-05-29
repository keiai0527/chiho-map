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
