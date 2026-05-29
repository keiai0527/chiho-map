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
        削除依頼を受け付けました
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
        受付番号は{" "}
        <span className="font-mono font-bold text-primary">#{n}</span> です。
        本サイトの投稿ガイドラインに照らして判断の上、結果を通知します。
      </p>
      <div className="bg-amber-50 border border-amber-200 rounded p-4 text-xs text-amber-900 leading-relaxed mb-8 text-left">
        <p className="font-bold mb-1">⏳ 返信までの目安</p>
        <p>
          本サイトは個人で1人で運営しております。原則として5営業日以内のご返信を心がけておりますが、業務状況により<strong>1〜2週間お時間をいただく場合がございます</strong>。あらかじめご了承ください。
        </p>
        <p className="mt-1.5">
          判断にあたり、必要に応じて投稿者への意見照会を行うことがあります（情報流通プラットフォーム対処法（旧プロバイダ責任制限法）の趣旨に基づく手続き）。
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

export default function TakedownReceivedPage() {
  return (
    <Suspense>
      <ReceivedInner />
    </Suspense>
  );
}
