"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ReceivedInner() {
  const sp = useSearchParams();
  const n = sp.get("n");
  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl text-white bg-emerald-500">
        ✓
      </div>
      <h1 className="text-xl font-bold text-primary mb-3">
        訂正依頼を受け付けました
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
        受付番号は{" "}
        <span className="font-mono font-bold text-primary">#{n}</span> です。
        ご記載の根拠資料を確認の上、対応結果を通知します。
      </p>
      <div className="bg-amber-50 border border-amber-200 rounded p-4 text-xs text-amber-900 leading-relaxed mb-8 text-left">
        <p className="font-bold mb-1">⏳ 返信までの目安</p>
        <p>
          本サイトは個人で1人で運営しております。原則として5営業日以内のご返信を心がけておりますが、業務状況により<strong>1〜2週間お時間をいただく場合がございます</strong>。あらかじめご了承ください。
        </p>
        <p className="mt-1.5">
          確認が取れた誤りは速やかに修正します。判断結果はメールでお知らせします。
        </p>
      </div>
      <Link
        href="/"
        className="inline-block bg-accent text-white px-5 py-2.5 rounded hover:bg-accent/90 text-sm"
      >
        トップへ戻る
      </Link>
    </div>
  );
}

export default function CorrectionReceivedPage() {
  return (
    <Suspense>
      <ReceivedInner />
    </Suspense>
  );
}
