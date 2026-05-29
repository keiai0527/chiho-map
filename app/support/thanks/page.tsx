import Link from "next/link";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "応援ありがとうございました",
  description: "地方議員マップへの応援、ありがとうございます。",
  robots: { index: false, follow: false },
};

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const sp = await searchParams;
  const sessionId = sp.session_id;

  let amount: number | null = null;
  let isPaid = false;
  let isTestMode = false;
  let donorName = "";

  if (sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      isPaid = session.payment_status === "paid";
      isTestMode = session.livemode === false;
      amount = session.amount_total ?? null;
      donorName = (session.metadata?.donor_name as string) ?? "";
    } catch (e) {
      console.warn("[thanks] failed to retrieve session:", e);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500 flex items-center justify-center text-3xl text-white">
        ♥
      </div>
      <h1 className="text-2xl font-bold text-primary mb-3">
        応援ありがとうございました
      </h1>
      {amount && isPaid && (
        <p className="text-base text-muted-foreground mb-2">
          <strong className="text-accent text-xl">
            ¥{amount.toLocaleString()}
          </strong>{" "}
          をご応援いただきました。
        </p>
      )}
      {donorName && (
        <p className="text-sm text-muted-foreground mb-4">
          {donorName} さん、ありがとうございます。
        </p>
      )}
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
        いただいた応援金は、地方議員マップの運営費（サーバー・データ整備・法務確認等）に大切に使わせていただきます。
      </p>
      {isTestMode && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2 max-w-sm mx-auto mb-6">
          ⚠️ テストモードでの決済です。実際のカードへの請求は発生していません。
        </p>
      )}
      <div className="flex justify-center gap-3">
        <Link
          href="/"
          className="bg-accent text-white px-5 py-2.5 rounded hover:bg-accent/90 text-sm"
        >
          トップに戻る
        </Link>
        <a
          href="https://kokkaimap.jp"
          target="_blank"
          rel="noopener"
          className="text-sm text-muted-foreground self-center hover:text-primary"
        >
          国会議員マップ →
        </a>
      </div>
    </div>
  );
}
