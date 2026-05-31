"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * グローバルエラーバウンダリ。
 * アクセス集中・API エラー・DB 障害時に真っ白画面を回避し、
 * ユーザーに「現在アクセスが集中しています」等のメッセージを表示する。
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Vercel ログに記録される
    console.error("[error-boundary]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h1 className="text-xl font-bold text-amber-900">
          一時的にエラーが発生しています
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-amber-900">
          現在アクセスが集中しているか、外部サービスとの通信に問題が発生している可能性があります。
          数分ほどお時間をおいて再度お試しください。
        </p>
        <p className="mt-3 text-sm leading-relaxed text-amber-900">
          解決しない場合は、お手数ですがしばらくお待ちいただくか、トップページから別のページをお試しください。
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded bg-amber-700 px-4 py-2 text-sm font-bold text-white hover:bg-amber-800"
          >
            再読み込み
          </button>
          <Link
            href="/"
            className="rounded border border-amber-400 bg-white px-4 py-2 text-sm font-bold text-amber-900 hover:bg-amber-100"
          >
            トップに戻る
          </Link>
        </div>

        {error?.digest && (
          <p className="mt-6 text-[11px] text-amber-700">
            エラーID: {error.digest}（運営者へのご報告にお使いください）
          </p>
        )}
      </div>

      <div className="mt-6 text-xs text-slate-500">
        <p>
          障害が継続する場合は、運営者（
          <a
            href="mailto:info@kokkaimap.jp"
            className="underline-offset-2 hover:underline"
          >
            info@kokkaimap.jp
          </a>
          ）または X{" "}
          <a
            href="https://x.com/kokkai_map"
            target="_blank"
            rel="noopener"
            className="underline-offset-2 hover:underline"
          >
            @kokkai_map
          </a>
          までお知らせください。
        </p>
      </div>
    </div>
  );
}
