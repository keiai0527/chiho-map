"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";

/**
 * 応援金用の Stripe Checkout セッションを作成して、Stripe ホスト画面へリダイレクトする。
 *
 * 国会議員マップ（diet-map）と同じ Stripe アカウントを使うため、
 * metadata.kind を "donation_chiho" にして webhook 側で識別する。
 *
 * 重要：応援対象は「地方議員マップというサービスの運営」であり、
 * 特定議員への寄付ではない。文言はそれを明示する。
 */
export async function createDonationCheckout(input: {
  amount: number;
  donorName?: string;
  message?: string;
}) {
  const amount = Math.floor(input.amount);
  if (!Number.isFinite(amount) || amount < 100 || amount > 100_000) {
    throw new Error("応援金額は 100 〜 100,000 円の範囲でお願いします");
  }

  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    // payment_method_types を省略することで、Stripe ダッシュボードで有効化された
    // 支払い方法を自動的に表示する（カード / Apple Pay / Google Pay / Link 等）。
    // 明示すると other 方法が排除されるため、指定しないのが正解。
    line_items: [
      {
        price_data: {
          currency: "jpy",
          product_data: {
            name: "地方議員マップ 運営応援",
            description:
              "サーバー費用・データ整備費・運営継続のための任意の応援金です。特定の議員・政党への寄付ではありません。返礼品はありません。",
          },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      kind: "donation_chiho",
      donor_name: input.donorName?.slice(0, 100) ?? "",
      message: input.message?.slice(0, 480) ?? "",
    },
    success_url: `${origin}/support/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/support?canceled=1`,
    locale: "ja",
  });

  if (!session.url) {
    throw new Error("Stripe セッションの作成に失敗しました");
  }

  redirect(session.url);
}
