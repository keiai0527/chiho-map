import {
  getAllReviews,
  getAllQueueItems,
  type StoredReview,
  type ModerationQueueItem,
} from "@/lib/server-store";
import { describeFlag } from "@/lib/moderation";
import { getMemberById, getPartyMap, getCity } from "@/lib/data";
import { forcePromotePendingReview } from "@/app/actions/moderate-review";
import { AIAssessment } from "@/components/AIAssessment";
import {
  ReviewDecisionPanel,
  UnpublishPanel,
} from "@/components/DecisionPanel";

export const dynamic = "force-dynamic";

async function buildMemberLabelMap(reviews: StoredReview[]): Promise<Map<string, string>> {
  const partyMap = await getPartyMap();
  const map = new Map<string, string>();
  const uniqueIds = [...new Set(reviews.map((r) => r.memberId))];
  await Promise.all(
    uniqueIds.map(async (id) => {
      const m = await getMemberById(id);
      if (!m) {
        map.set(id, id);
        return;
      }
      const party = partyMap.get(m.partyId);
      const city = await getCity(m.cityId);
      map.set(
        id,
        `${m.name}（${party?.name ?? m.partyId} / ${city?.name ?? m.cityId} / ${m.electoralDistrict ?? ""}）`,
      );
    }),
  );
  return map;
}

export default async function ModerationQueuePage() {
  const allReviews = await getAllReviews();
  const queueItems = await getAllQueueItems();
  const memberLabels = await buildMemberLabelMap(allReviews);

  const queueByReviewId = new Map<string, ModerationQueueItem>();
  queueItems.forEach((q) => queueByReviewId.set(q.reviewId, q));

  const pendingPayment = allReviews.filter((r) => r.status === "pending_payment");
  const underReview = allReviews.filter((r) => r.status === "under_review");
  const published = allReviews.filter((r) => r.status === "published");
  const removed = allReviews.filter((r) => r.status === "removed");

  return (
    <div className="space-y-6">
      <h2 className="text-base font-bold text-primary">口コミ審査・管理</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <StatBox label="決済完了・状態不明" count={pendingPayment.length} tone="rose" />
        <StatBox label="事前審査中" count={underReview.length} tone="amber" />
        <StatBox label="公開中" count={published.length} tone="emerald" />
        <StatBox label="非公開" count={removed.length} tone="slate" />
      </div>

      {/* ① 決済完了したが昇格していない */}
      <Section
        title="🚨 決済完了したが状態未昇格"
        description="Stripe 決済は完了したが pending_payment のまま。Webhook 不発などで止まっている。即時公開 or 要審査に強制移行する。"
        tone="rose"
      >
        {pendingPayment.length === 0 ? (
          <p className="text-sm text-muted-foreground">なし</p>
        ) : (
          <ul className="space-y-3">
            {pendingPayment.map((r) => (
              <li
                key={r.id}
                className="bg-surface border-2 border-rose-300 rounded p-4 space-y-2"
              >
                <ReviewHeader r={r} label={memberLabels.get(r.memberId) ?? r.memberId} />
                <ReviewBody r={r} />
                <AIAssessment reviewId={r.id} />
                <form
                  action={forcePromotePendingReview}
                  className="flex flex-wrap items-center gap-2 pt-2"
                >
                  <input type="hidden" name="reviewId" value={r.id} />
                  <input type="hidden" name="memberId" value={r.memberId} />
                  <button
                    type="submit"
                    name="target"
                    value="published"
                    className="text-xs px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    ✅ 即時公開（pending → published）
                  </button>
                  <button
                    type="submit"
                    name="target"
                    value="under_review"
                    className="text-xs px-3 py-1.5 rounded bg-amber-600 text-white hover:bg-amber-700"
                  >
                    ⚠️ 要審査に移動
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* ② 事前審査中 */}
      <Section
        title="⚠️ 事前審査中"
        description="自動検出フラグに該当した投稿。承認すれば公開、却下すれば非公開。"
        tone="amber"
      >
        {underReview.length === 0 ? (
          <p className="text-sm text-muted-foreground">なし</p>
        ) : (
          <ul className="space-y-3">
            {underReview.map((r) => {
              const q = queueByReviewId.get(r.id);
              return (
                <li
                  key={r.id}
                  className="bg-surface border-2 border-amber-300 rounded p-4 space-y-2"
                >
                  <ReviewHeader r={r} label={memberLabels.get(r.memberId) ?? r.memberId} />
                  <ReviewBody r={r} />
                  <AIAssessment reviewId={r.id} />
                  {r.flags && r.flags.length > 0 && (
                    <div className="text-xs space-y-0.5">
                      <p className="text-muted-foreground">検出フラグ:</p>
                      <ul className="list-disc pl-5 text-muted-foreground">
                        {r.flags.map((f, i) => (
                          <li key={i}>{describeFlag(f)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {!q && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                      ℹ️ キュー情報なし（過去のフローで取りこぼされた口コミ）。下の判定パネルから直接処理できます。
                    </p>
                  )}
                  <ReviewDecisionPanel
                    queueId={q?.id ?? ""}
                    reviewId={r.id}
                    memberId={r.memberId}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      {/* ③ 公開中 */}
      <Section
        title="✅ 公開中"
        description="現在公開されている投稿。問題があれば取り下げ可能。"
        tone="emerald"
      >
        {published.length === 0 ? (
          <p className="text-sm text-muted-foreground">なし</p>
        ) : (
          <ul className="space-y-3">
            {published.map((r) => (
              <li
                key={r.id}
                className="bg-surface border border-emerald-200 rounded p-4 space-y-2"
              >
                <ReviewHeader r={r} label={memberLabels.get(r.memberId) ?? r.memberId} />
                <ReviewBody r={r} />
                <UnpublishPanel reviewId={r.id} memberId={r.memberId} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* ④ 非公開（履歴） */}
      <Section
        title="🗑 非公開（履歴）"
        description="削除・却下された投稿の履歴。"
        tone="slate"
      >
        {removed.length === 0 ? (
          <p className="text-sm text-muted-foreground">なし</p>
        ) : (
          <ul className="space-y-2">
            {removed.map((r) => (
              <li
                key={r.id}
                className="bg-muted/30 border border-border rounded p-3 text-sm opacity-70"
              >
                <ReviewHeader r={r} label={memberLabels.get(r.memberId) ?? r.memberId} />
                <p className="mt-1 text-xs text-muted-foreground line-through">
                  {r.content.slice(0, 80)}
                  {r.content.length > 80 && "…"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  description,
  tone,
  children,
}: {
  title: string;
  description: string;
  tone: "rose" | "amber" | "emerald" | "slate";
  children: React.ReactNode;
}) {
  const toneClass = {
    rose: "border-l-rose-500 bg-rose-50/50",
    amber: "border-l-amber-500 bg-amber-50/50",
    emerald: "border-l-emerald-500 bg-emerald-50/50",
    slate: "border-l-slate-400 bg-slate-50/50",
  }[tone];

  return (
    <section className={`border-l-4 ${toneClass} pl-4 py-2 space-y-3`}>
      <div>
        <h3 className="text-sm font-bold text-primary">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function StatBox({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "rose" | "amber" | "emerald" | "slate";
}) {
  const colors = {
    rose: "bg-rose-100 text-rose-900 border-rose-300",
    amber: "bg-amber-100 text-amber-900 border-amber-300",
    emerald: "bg-emerald-100 text-emerald-900 border-emerald-300",
    slate: "bg-slate-100 text-slate-700 border-slate-300",
  }[tone];

  return (
    <div className={`border rounded p-3 ${colors}`}>
      <div className="text-xs">{label}</div>
      <div className="text-2xl font-bold tabular-nums">{count}</div>
    </div>
  );
}

function ReviewHeader({ r, label }: { r: StoredReview; label: string }) {
  return (
    <div className="flex items-start justify-between flex-wrap gap-2 text-xs">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-bold text-primary text-sm">{label}</span>
        <span className="text-accent">
          {"★".repeat(r.rating)}
          <span className="text-border">{"★".repeat(5 - r.rating)}</span>
        </span>
        <span className="px-2 py-0.5 rounded bg-muted">{r.caseType}</span>
      </div>
      <span className="text-muted-foreground">
        {new Date(r.createdAt).toLocaleString("ja-JP")}
      </span>
    </div>
  );
}

function ReviewBody({ r }: { r: StoredReview }) {
  return (
    <>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{r.content}</p>
      <p className="text-[10px] text-muted-foreground">
        review_id: {r.id} / member_id: {r.memberId}
        {r.stripeSessionId && (
          <> / session: {r.stripeSessionId.slice(0, 24)}…</>
        )}
      </p>
    </>
  );
}
