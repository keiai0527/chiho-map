import Link from "next/link";
import crypto from "node:crypto";
import { stripe } from "@/lib/stripe";
import {
  findReviewByStripeSession,
  promoteReviewAfterPayment,
  addToQueue,
} from "@/lib/server-store";
import { sendOperatorMail } from "@/lib/mailer";
import { SITE_URL } from "@/lib/config";

export const dynamic = "force-dynamic";

/**
 * Stripe Checkout からのリダイレクト先。
 * session_id を Stripe で検証 → 支払い完了なら DB の pending レコードを公開状態へ昇格。
 */
export default async function ReviewSentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { id: memberId } = await params;
  const sp = await searchParams;
  const sessionId = sp.session_id;

  if (!sessionId) {
    return ErrorView({
      memberId,
      title: "投稿状態を取得できませんでした",
      message: "決済セッションの情報がありません。",
    });
  }

  let isPaid = false;
  let isTestMode = false;
  let memberName = "";
  let errorMsg: string | null = null;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    isPaid = session.payment_status === "paid";
    isTestMode = session.livemode === false;
    memberName = (session.metadata?.member_name as string) ?? "";
  } catch (e) {
    errorMsg = e instanceof Error ? e.message : "決済情報の取得に失敗しました";
  }

  if (errorMsg) {
    return ErrorView({
      memberId,
      title: "決済確認エラー",
      message: errorMsg,
      tone: "rose",
    });
  }

  if (!isPaid) {
    return ErrorView({
      memberId,
      title: "決済が完了していません",
      message: "支払いが完了していないため、投稿は受け付けられませんでした。",
    });
  }

  const review = await findReviewByStripeSession(sessionId);
  if (!review) {
    return ErrorView({
      memberId,
      title: "投稿データが見つかりません",
      message:
        "決済は完了していますが、投稿データを見つけられませんでした。お問い合わせ窓口までご連絡ください。",
      tone: "amber",
    });
  }

  let isQueued = review.status === "under_review";
  if (review.status === "pending_payment") {
    // β版の方針: 機微キーワードの有無にかかわらず全件を運営者事前審査キューへ。
    const hasFlags = review.flags && review.flags.length > 0;
    isQueued = true;
    await promoteReviewAfterPayment(review.id, "under_review");
    await addToQueue({
      id: `q-${crypto.randomUUID()}`,
      reviewId: review.id,
      memberId: review.memberId,
      content: review.content,
      rating: review.rating,
      caseType: review.caseType,
      autoFlags: review.flags || [],
    });

    try {
      const memberPageUrl = `${SITE_URL}/giin/${review.memberId}#review-${review.id}`;
      const contentExcerpt =
        review.content.length > 500
          ? review.content.slice(0, 500) + "…"
          : review.content;

      // β版: 全件審査キューに入るため、メールは常に「要審査」通知
      const flagsLabel = hasFlags
        ? review.flags.map((f) => `${f.category}:${f.matched}`).join(", ")
        : "（自動検出フラグなし）";
      await sendOperatorMail({
        subject: `【地方議員マップ】要審査の口コミ投稿（${review.id}）`,
        text: `モデレーションキューに新しい投稿が入りました。72時間以内のご対応をお願いします。
β版の方針により全件事前審査となっています。

議員名: ${memberName || "(不明)"}
議員ID: ${review.memberId}
評価: ${review.rating}★
カテゴリ: ${review.caseType}
投稿ID: ${review.id}
自動検出フラグ: ${flagsLabel}

本文:
${contentExcerpt}

議員ページ:
${memberPageUrl}
`,
      });
    } catch (e) {
      console.error("[review-sent] operator mail send failed:", e);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div
        className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl text-white ${
          isQueued ? "bg-amber-500" : "bg-emerald-500"
        }`}
      >
        ✓
      </div>
      <h1 className="text-xl font-bold text-primary mb-3">
        投稿を受け付けました（事前審査中）
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        β版の方針により、投稿は原則として全件、運営者による確認後に公開します。確認には最大72時間程度かかる場合があります。
        ご投稿ありがとうございました。
      </p>
      {isTestMode && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 max-w-sm mx-auto mb-6">
          ⚠️ テストモードでの決済です。実際のカードへの請求は発生していません。
        </p>
      )}
      <div className="flex justify-center gap-3 mb-10">
        <Link
          href={`/giin/${memberId}`}
          className="bg-accent text-white px-5 py-2.5 rounded hover:bg-accent/90 text-sm"
        >
          議員ページに戻る
        </Link>
        <Link
          href="/"
          className="text-sm text-muted-foreground self-center hover:text-primary"
        >
          トップへ
        </Link>
      </div>

      <div className="bg-rose-50 border border-rose-200 rounded-md p-5 text-left max-w-md mx-auto space-y-3">
        <p className="text-base font-bold text-rose-900">
          ❤️ サイトを応援してくれませんか？
        </p>
        <p className="text-xs text-rose-900 leading-relaxed">
          このサイトは個人で1人で運営しています。サーバー費用などをまかなうため、
          無理のない範囲でご応援いただけると、運営を続けられます。
        </p>
        <Link
          href="/support"
          className="inline-block bg-rose-600 text-white text-sm px-4 py-2 rounded hover:bg-rose-700"
        >
          ♥ 応援ページへ
        </Link>
      </div>
    </div>
  );
}

function ErrorView({
  memberId,
  title,
  message,
  tone = "muted",
}: {
  memberId: string;
  title: string;
  message: string;
  tone?: "muted" | "rose" | "amber";
}) {
  const styles =
    tone === "rose"
      ? "text-rose-700 bg-rose-50 border-rose-200"
      : tone === "amber"
        ? "text-amber-900 bg-amber-50 border-amber-200"
        : "text-muted-foreground";

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
      <h1 className={`text-xl font-bold ${tone === "rose" ? "text-rose-700" : "text-primary"}`}>
        {title}
      </h1>
      <p className={`text-sm leading-relaxed ${tone === "muted" ? "text-muted-foreground" : `${styles} border rounded p-3`}`}>
        {message}
      </p>
      <Link
        href={`/giin/${memberId}`}
        className="inline-block bg-accent text-white px-5 py-2.5 rounded hover:bg-accent/90 text-sm"
      >
        議員ページに戻る
      </Link>
    </div>
  );
}
