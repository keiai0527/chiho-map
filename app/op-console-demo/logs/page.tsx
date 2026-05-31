import { getLogs } from "@/lib/server-store";

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, { label: string; tone: string }> = {
  review_approved: { label: "口コミ承認・公開", tone: "bg-emerald-100 text-emerald-900" },
  review_rejected: { label: "口コミ却下", tone: "bg-rose-100 text-rose-900" },
  review_unpublished: { label: "口コミ取下げ", tone: "bg-orange-100 text-orange-900" },
  review_force_promoted: { label: "決済救出（強制公開）", tone: "bg-violet-100 text-violet-900" },
  takedown_approved: { label: "削除依頼：承認", tone: "bg-rose-100 text-rose-900" },
  takedown_rejected: { label: "削除依頼：却下", tone: "bg-blue-100 text-blue-900" },
};

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "決済待ち",
  under_review: "事前審査中",
  published: "公開",
  removed: "非公開",
};

function statusLabel(s: unknown): string {
  if (typeof s !== "string") return "";
  return STATUS_LABEL[s] ?? s;
}

export default async function LogsPage() {
  const logs = await getLogs();

  return (
    <div className="space-y-3">
      <h2 className="text-base font-bold text-primary">判断ログ（直近500件）</h2>
      <p className="text-xs text-muted-foreground">
        操作日時・対象・操作内容・操作者・変更前後ステータス・理由を全て記録します。
      </p>
      {logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">ログはまだありません。</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {logs.map((l) => {
            const action = ACTION_LABEL[l.actionType] ?? {
              label: l.actionType,
              tone: "bg-muted text-muted-foreground",
            };
            const snap = l.snapshot ?? {};
            const site = typeof snap.site === "string" ? snap.site : "kokkaimap";
            const prevStatus = statusLabel(snap.prevStatus);
            const newStatus = statusLabel(snap.newStatus);
            const memberId = typeof snap.memberId === "string" ? snap.memberId : null;
            const receiptNumber =
              typeof snap.receiptNumber === "string" ? snap.receiptNumber : null;

            return (
              <li
                key={l.id}
                className="bg-surface border border-border rounded p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        site === "chiho-map"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {site === "chiho-map" ? "🏛 地方議員マップ" : "🏛 国会議員マップ"}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${action.tone}`}>
                      {action.label}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(l.createdAt).toLocaleString("ja-JP")}
                  </span>
                </div>

                {(prevStatus || newStatus) && (
                  <p className="text-xs flex items-center gap-1 flex-wrap">
                    <span className="text-muted-foreground">ステータス変更:</span>
                    {prevStatus && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {prevStatus}
                      </span>
                    )}
                    <span className="text-muted-foreground">→</span>
                    {newStatus && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900">
                        {newStatus}
                      </span>
                    )}
                  </p>
                )}

                <p className="text-sm leading-relaxed">
                  <span className="text-xs text-muted-foreground">理由：</span>
                  {l.decisionReason}
                </p>

                <div className="text-[10px] text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5">
                  <span>操作者: {l.operator}</span>
                  {l.relatedReviewId && <span>口コミ: {l.relatedReviewId}</span>}
                  {memberId && <span>議員: {memberId}</span>}
                  {receiptNumber && <span>受付: {receiptNumber}</span>}
                  {l.relatedTakedownId && <span>削除依頼: {l.relatedTakedownId}</span>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
