import { getTakedowns } from "@/lib/server-store";
import { decideTakedown } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  received: "受付",
  under_review: "審査中",
  consultation_started: "意見照会中",
  approved: "承認",
  rejected: "却下",
  withdrawn: "取り下げ",
};

export default async function TakedownsPage() {
  const all = await getTakedowns();
  const open = all.filter((t) =>
    ["received", "under_review", "consultation_started"].includes(t.status),
  );

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-primary">
        削除依頼一覧（対応中 {open.length}件 / 全 {all.length}件）
      </h2>

      {all.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          削除依頼はまだありません。
        </p>
      ) : (
        <ul className="space-y-3">
          {all.map((t) => {
            const isOpen = ["received", "under_review", "consultation_started"].includes(t.status);
            return (
              <li
                key={t.id}
                className="bg-surface border border-border rounded p-4 space-y-2"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono">{t.receiptNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded ${
                        t.status === "approved"
                          ? "bg-emerald-100 text-emerald-900"
                          : t.status === "rejected" || t.status === "withdrawn"
                            ? "bg-rose-100 text-rose-900"
                            : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {STATUS_LABELS[t.status] ?? t.status}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(t.createdAt).toLocaleString("ja-JP")}
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  <p className="break-all">
                    依頼者: {t.requesterName}（{t.requesterType}）/ {t.requesterEmail}
                  </p>
                  {t.targetMemberId && (
                    <p className="text-xs text-muted-foreground break-all">
                      対象: 議員 {t.targetMemberId}
                      {t.targetReviewId && <> / 投稿 {t.targetReviewId}</>}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    ガイドライン違反: {t.violationCategories.join(", ")}
                  </p>
                </div>

                <div className="text-sm bg-muted/50 rounded p-2">
                  <p className="text-xs font-bold text-muted-foreground mb-1">
                    削除理由:
                  </p>
                  <p className="leading-relaxed whitespace-pre-wrap break-all">
                    {t.reason}
                  </p>
                </div>

                {t.evidence && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground">
                      証拠・補足
                    </summary>
                    <p className="whitespace-pre-wrap break-all mt-1">{t.evidence}</p>
                  </details>
                )}

                {t.decisionReason && (
                  <div className="text-sm bg-blue-50 border border-blue-200 rounded p-2">
                    <p className="text-xs font-bold text-blue-900 mb-1">
                      判定理由（既登録）:
                    </p>
                    <p className="leading-relaxed whitespace-pre-wrap break-all text-blue-900">
                      {t.decisionReason}
                    </p>
                  </div>
                )}

                {isOpen && (
                  <form action={decideTakedown} className="space-y-2 border-t border-border pt-3 mt-3">
                    <input type="hidden" name="takedownId" value={t.id} />
                    <input type="hidden" name="reviewId" value={t.targetReviewId ?? ""} />
                    <input type="hidden" name="requesterEmail" value={t.requesterEmail} />
                    <input type="hidden" name="receiptNumber" value={t.receiptNumber} />
                    <label className="block text-xs text-muted-foreground">
                      判定理由（依頼者へのメール本文に入ります）
                    </label>
                    <textarea
                      name="reason"
                      rows={3}
                      placeholder="ガイドラインに基づき公人としての公務に対する論評と判断 ／ 私生活への言及で投稿は非公開 など"
                      className="w-full text-sm rounded border border-border bg-background p-2"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="submit"
                        name="decision"
                        value="approved"
                        className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700 text-sm"
                      >
                        承認して投稿を非公開
                      </button>
                      <button
                        type="submit"
                        name="decision"
                        value="rejected"
                        className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 text-sm"
                      >
                        却下（投稿は維持）
                      </button>
                    </div>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
