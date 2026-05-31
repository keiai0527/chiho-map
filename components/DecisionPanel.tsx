"use client";

import { useState, useTransition } from "react";
import {
  approveQueuedReview,
  rejectQueuedReview,
  unpublishReview,
} from "@/app/actions/moderate-review";

// よくある却下・取り下げ理由（クリックで理由欄に挿入）
const COMMON_REASONS = [
  "公的活動への論評として問題なし",
  "事実根拠あり、批判の語気のみを理由に非公開にしない",
  "私生活への言及（家族・配偶者・恋愛など）",
  "事実無根の犯罪・スキャンダル断定",
  "出自・国籍・宗教への言及",
  "個人情報の暴露",
  "スパム・同文反復",
  "差別的表現・ヘイトスピーチ",
  "侮辱・人格攻撃",
  "選挙法・政治資金関連リスク",
] as const;

// 事前審査中の口コミ向け：「公開する／非公開にする」パネル
export function ReviewDecisionPanel({
  queueId,
  reviewId,
  memberId,
}: {
  queueId: string;
  reviewId: string;
  memberId: string;
}) {
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState<"approve" | "reject" | null>(null);

  const submit = (action: "approve" | "reject") => {
    const fd = new FormData();
    fd.set("queueId", queueId);
    fd.set("reviewId", reviewId);
    fd.set("memberId", memberId);
    fd.set("reviewerNote", reason);

    startTransition(async () => {
      if (action === "approve") {
        await approveQueuedReview(fd);
      } else {
        await rejectQueuedReview(fd);
      }
    });
  };

  return (
    <div className="border-t-2 border-amber-200 pt-3 mt-3 space-y-3 bg-amber-50/30 -mx-4 -mb-4 px-4 pb-4 rounded-b">
      <p className="text-sm font-bold text-amber-900">📝 判定する</p>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground block">
          判断理由（あとから「なぜこれを公開／却下したか」を見返すため）
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="例：街頭演説への正当な論評。事実根拠あり / 私生活への言及で却下 など"
          rows={2}
          className="w-full text-sm px-2 py-1.5 border border-border rounded resize-y"
        />
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-primary">
            ▼ よくある理由から選ぶ
          </summary>
          <div className="flex flex-wrap gap-1 mt-2">
            {COMMON_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className="text-[11px] px-2 py-1 rounded border border-border bg-white hover:bg-muted"
              >
                {r}
              </button>
            ))}
          </div>
        </details>
      </div>

      {confirming === null ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setConfirming("approve")}
            disabled={pending}
            className="flex flex-col items-center justify-center px-4 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            <span className="text-base font-bold">✅ 公開する</span>
            <span className="text-[11px] opacity-90 mt-0.5">
              この口コミをサイトに表示します
            </span>
          </button>
          <button
            type="button"
            onClick={() => setConfirming("reject")}
            disabled={pending}
            className="flex flex-col items-center justify-center px-4 py-3 rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
          >
            <span className="text-base font-bold">❌ 非公開にする</span>
            <span className="text-[11px] opacity-90 mt-0.5">
              却下してサイトに表示しません
            </span>
          </button>
        </div>
      ) : (
        <div
          className={`rounded-lg p-3 space-y-3 border-2 ${
            confirming === "approve"
              ? "bg-emerald-50 border-emerald-300"
              : "bg-rose-50 border-rose-300"
          }`}
        >
          <p className="text-sm font-bold">
            {confirming === "approve"
              ? "✅ この口コミをサイトに公開しますか？"
              : "❌ この口コミを非公開（却下）にしますか？"}
          </p>
          <p className="text-xs text-muted-foreground">
            {confirming === "approve"
              ? "公開後でも「公開中」セクションから取り下げできます。"
              : "却下後の口コミは「非公開（履歴）」に残り、後から復元はできません。"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setConfirming(null)}
              disabled={pending}
              className="px-3 py-2 rounded border border-border bg-white text-sm hover:bg-muted disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={() => submit(confirming)}
              disabled={pending}
              className={`px-3 py-2 rounded text-white text-sm font-bold disabled:opacity-50 ${
                confirming === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {pending
                ? "処理中…"
                : confirming === "approve"
                  ? "はい、公開する"
                  : "はい、非公開にする"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 公開中の口コミ向け：「取り下げる」パネル
export function UnpublishPanel({
  reviewId,
  memberId,
}: {
  reviewId: string;
  memberId: string;
}) {
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const submit = () => {
    const fd = new FormData();
    fd.set("reviewId", reviewId);
    fd.set("memberId", memberId);
    fd.set("reason", reason);
    startTransition(async () => {
      await unpublishReview(fd);
    });
  };

  if (!confirming) {
    return (
      <div className="border-t border-border pt-3 mt-3">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="text-sm px-3 py-2 rounded border border-rose-300 text-rose-700 hover:bg-rose-50"
        >
          🗑 この口コミを取り下げる（非公開にする）
        </button>
      </div>
    );
  }

  return (
    <div className="border-t-2 border-rose-200 pt-3 mt-3 space-y-3 bg-rose-50/30 -mx-4 -mb-4 px-4 pb-4 rounded-b">
      <p className="text-sm font-bold text-rose-900">🗑 取り下げる（非公開にする）</p>
      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground block">
          取り下げ理由
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="例：削除依頼を受けた / ガイドライン違反が後から判明 など"
          rows={2}
          className="w-full text-sm px-2 py-1.5 border border-border rounded resize-y"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            setConfirming(false);
            setReason("");
          }}
          disabled={pending}
          className="px-3 py-2 rounded border border-border bg-white text-sm hover:bg-muted disabled:opacity-50"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="px-3 py-2 rounded bg-rose-600 text-white text-sm font-bold hover:bg-rose-700 disabled:opacity-50"
        >
          {pending ? "処理中…" : "はい、取り下げる"}
        </button>
      </div>
    </div>
  );
}
