"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import crypto from "node:crypto";
import { stripe } from "@/lib/stripe";
import { moderateContent } from "@/lib/moderation";
import { insertPendingReview, checkRateLimit } from "@/lib/server-store";
import {
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_HOURS,
  MIN_CONTENT_LENGTH,
} from "@/lib/moderation";

const REVIEW_FEE_JPY = 100;
const MAX_CONTENT_LENGTH = 4000;

function hashIp(raw: string): string {
  return crypto
    .createHash("sha256")
    .update(raw + (process.env.IP_HASH_SALT ?? "chihomap"))
    .digest("hex")
    .slice(0, 32);
}

/**
 * 口コミ投稿料 ¥100 の Stripe Checkout を作成。
 *
 * 国会議員マップ（diet-map）と同じ仕組みだが、`kind: "review_fee_chiho"` で
 * Stripe webhook 側で識別する。投稿本文は事前に reviews_chiho テーブルへ
 * status='pending_payment' で保存。決済完了後、success_url のサーバーコンポーネントで
 * Stripe セッションを検証して状態を遷移させる。
 */
export async function createReviewCheckout(input: {
  memberId: string;
  memberName: string;
  rating: number;
  caseType: string;
  content: string;
}): Promise<{ ok: false; error: string } | void> {
  // ===== 入力検証 =====
  if (input.rating < 1 || input.rating > 5) {
    return { ok: false, error: "評価は 1〜5 で指定してください" };
  }
  if (!input.memberId) {
    return { ok: false, error: "議員IDが指定されていません" };
  }
  if (typeof input.content !== "string") {
    return { ok: false, error: "投稿内容が不正です" };
  }
  if (input.content.length < MIN_CONTENT_LENGTH) {
    return {
      ok: false,
      error: `投稿は ${MIN_CONTENT_LENGTH} 文字以上で入力してください（現在 ${input.content.length} 文字）`,
    };
  }
  if (input.content.length > MAX_CONTENT_LENGTH) {
    return {
      ok: false,
      error: `投稿は ${MAX_CONTENT_LENGTH} 文字以下で入力してください`,
    };
  }

  // ===== IP ハッシュ取得 =====
  const h = await headers();
  const fwd = h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "unknown";
  const ipRaw = fwd.split(",")[0]?.trim() ?? "unknown";
  const ipHash = hashIp(ipRaw);

  // ===== レート制限 =====
  const rl = await checkRateLimit(
    ipHash,
    RATE_LIMIT_WINDOW_HOURS,
    RATE_LIMIT_MAX,
  );
  if (!rl.ok) {
    return {
      ok: false,
      error: `投稿数の上限に達しました（${RATE_LIMIT_WINDOW_HOURS}時間あたり${RATE_LIMIT_MAX}件まで）`,
    };
  }

  // ===== モデレーション =====
  const moderation = moderateContent(input.content);
  if (moderation.status === "rejected") {
    return {
      ok: false,
      error: `投稿はガイドライン違反の可能性があります: ${moderation.reason}`,
    };
  }

  // ===== レビューIDと Stripe セッション作成 =====
  const reviewId = `review-chiho-${crypto.randomUUID()}`;
  const host = h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // payment_method_types を省略することで、Stripe ダッシュボードで有効化された
    // 支払い方法を自動的に表示する（カード / Apple Pay / Google Pay / Link 等）。
    line_items: [
      {
        price_data: {
          currency: "jpy",
          product_data: {
            name: "口コミ投稿料（事前審査・運営手数料）/ 地方議員マップ",
            description: `${input.memberName} 議員ページへの口コミ投稿。投稿はガイドライン違反でない場合に公開、機微キーワードを含む場合は運営者の事前審査（最大72時間）後に公開。`,
          },
          unit_amount: REVIEW_FEE_JPY,
        },
        quantity: 1,
      },
    ],
    metadata: {
      kind: "review_fee_chiho",
      review_id: reviewId,
      member_id: input.memberId,
      member_name: input.memberName.slice(0, 100),
      rating: String(input.rating),
      case_type: input.caseType.slice(0, 100),
    },
    success_url: `${origin}/giin/${input.memberId}/review/sent?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/giin/${input.memberId}/review/new?canceled=1`,
    locale: "ja",
  });

  if (!session.url) {
    throw new Error("Stripe セッションの作成に失敗しました");
  }

  // ===== DB に pending レコードを作成 =====
  await insertPendingReview({
    id: reviewId,
    memberId: input.memberId,
    rating: Math.round(input.rating),
    content: input.content,
    caseType: input.caseType,
    ipHash,
    flags: moderation.status === "queued" ? moderation.flags : [],
    stripeSessionId: session.id,
  });

  redirect(session.url);
}
