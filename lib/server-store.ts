import "server-only";
import { sql } from "@/lib/db";
import type { ModerationFlag } from "./moderation";

/**
 * 地方議員マップの DB アクセス層。
 *
 * 国会議員マップ（diet-map）と同じ Neon プロジェクトを共有するが、
 * テーブル名に "_chiho" サフィックスを付けて完全分離する。
 * diet-map 側のテーブル (reviews, takedowns, ...) には一切書き込まない。
 *
 * スキーマは diet-map/lib/server-store.ts と同一。
 * migration SQL は scripts/migrate-chiho-db.sql を参照。
 */

// ===== 型定義（DB 行 → アプリ用オブジェクトへ正規化） =====

export type StoredReview = {
  id: string;
  memberId: string;
  rating: number;
  content: string;
  caseType: string;
  status: "pending_payment" | "published" | "under_review" | "removed";
  ipHash: string;
  createdAt: string;
  publishedAt?: string;
  flags: ModerationFlag[];
  stripeSessionId?: string;
};

export type ModerationQueueItem = {
  id: string;
  reviewId: string;
  memberId: string;
  content: string;
  rating: number;
  caseType: string;
  status: "pending" | "approved" | "rejected";
  autoFlags: ModerationFlag[];
  reviewerNote?: string;
  reviewer?: string;
  createdAt: string;
  reviewedAt?: string;
};

export type TakedownRequest = {
  id: string;
  receiptNumber: string;
  requesterName: string;
  requesterType: "self" | "lawyer" | "secretary" | "other";
  requesterEmail: string;
  targetReviewId?: string;
  targetMemberId?: string;
  violationCategories: string[];
  reason: string;
  evidence: string;
  status:
    | "received"
    | "under_review"
    | "consultation_started"
    | "approved"
    | "rejected"
    | "withdrawn";
  decisionReason?: string;
  operatorNote?: string;
  notifiedAt?: string;
  completedAt?: string;
  createdAt: string;
};

export type CorrectionRequest = {
  id: string;
  receiptNumber: string;
  requesterName: string;
  requesterEmail: string;
  target: string;
  memberRef?: string;
  speechRef?: string;
  whatIsWrong: string;
  shouldBe: string;
  evidenceUrl: string;
  status: "received" | "under_review" | "accepted" | "rejected";
  operatorNote?: string;
  completedAt?: string;
  createdAt: string;
};

export type ModerationLog = {
  id: string;
  relatedReviewId?: string;
  relatedTakedownId?: string;
  relatedCorrectionId?: string;
  actionType: string;
  decisionReason: string;
  operator: string;
  createdAt: string;
  snapshot: Record<string, unknown>;
};

// ===== 行 → オブジェクトのマッパー =====

type ReviewRow = {
  id: string;
  member_id: string;
  rating: number;
  content: string;
  case_type: string;
  status: StoredReview["status"];
  ip_hash: string;
  flags: unknown;
  stripe_session_id: string | null;
  created_at: string;
  published_at: string | null;
};

function mapReview(r: ReviewRow): StoredReview {
  return {
    id: r.id,
    memberId: r.member_id,
    rating: r.rating,
    content: r.content,
    caseType: r.case_type,
    status: r.status,
    ipHash: r.ip_hash,
    flags: (Array.isArray(r.flags) ? r.flags : []) as ModerationFlag[],
    stripeSessionId: r.stripe_session_id ?? undefined,
    createdAt: r.created_at,
    publishedAt: r.published_at ?? undefined,
  };
}

type QueueRow = {
  id: string;
  review_id: string;
  member_id: string;
  content: string;
  rating: number;
  case_type: string;
  status: ModerationQueueItem["status"];
  auto_flags: unknown;
  reviewer_note: string | null;
  reviewer: string | null;
  created_at: string;
  reviewed_at: string | null;
};

function mapQueue(q: QueueRow): ModerationQueueItem {
  return {
    id: q.id,
    reviewId: q.review_id,
    memberId: q.member_id,
    content: q.content,
    rating: q.rating,
    caseType: q.case_type,
    status: q.status,
    autoFlags: (Array.isArray(q.auto_flags) ? q.auto_flags : []) as ModerationFlag[],
    reviewerNote: q.reviewer_note ?? undefined,
    reviewer: q.reviewer ?? undefined,
    createdAt: q.created_at,
    reviewedAt: q.reviewed_at ?? undefined,
  };
}

type TakedownRow = {
  id: string;
  receipt_number: string;
  requester_name: string;
  requester_type: TakedownRequest["requesterType"];
  requester_email: string;
  target_review_id: string | null;
  target_member_id: string | null;
  violation_categories: unknown;
  reason: string;
  evidence: string;
  status: TakedownRequest["status"];
  decision_reason: string | null;
  operator_note: string | null;
  notified_at: string | null;
  completed_at: string | null;
  created_at: string;
};

function mapTakedown(t: TakedownRow): TakedownRequest {
  return {
    id: t.id,
    receiptNumber: t.receipt_number,
    requesterName: t.requester_name,
    requesterType: t.requester_type,
    requesterEmail: t.requester_email,
    targetReviewId: t.target_review_id ?? undefined,
    targetMemberId: t.target_member_id ?? undefined,
    violationCategories: (Array.isArray(t.violation_categories)
      ? t.violation_categories
      : []) as string[],
    reason: t.reason,
    evidence: t.evidence,
    status: t.status,
    decisionReason: t.decision_reason ?? undefined,
    operatorNote: t.operator_note ?? undefined,
    notifiedAt: t.notified_at ?? undefined,
    completedAt: t.completed_at ?? undefined,
    createdAt: t.created_at,
  };
}

type CorrectionRow = {
  id: string;
  receipt_number: string;
  requester_name: string;
  requester_email: string;
  target: string;
  member_ref: string | null;
  speech_ref: string | null;
  what_is_wrong: string;
  should_be: string;
  evidence_url: string;
  status: CorrectionRequest["status"];
  operator_note: string | null;
  completed_at: string | null;
  created_at: string;
};

function mapCorrection(c: CorrectionRow): CorrectionRequest {
  return {
    id: c.id,
    receiptNumber: c.receipt_number,
    requesterName: c.requester_name,
    requesterEmail: c.requester_email,
    target: c.target,
    memberRef: c.member_ref ?? undefined,
    speechRef: c.speech_ref ?? undefined,
    whatIsWrong: c.what_is_wrong,
    shouldBe: c.should_be,
    evidenceUrl: c.evidence_url,
    status: c.status,
    operatorNote: c.operator_note ?? undefined,
    completedAt: c.completed_at ?? undefined,
    createdAt: c.created_at,
  };
}

// ===== レビュー =====

export async function getPublishedReviewsForMember(
  memberId: string,
): Promise<StoredReview[]> {
  const rows = (await sql`
    SELECT * FROM reviews_chiho
    WHERE member_id = ${memberId} AND status = 'published'
    ORDER BY published_at DESC NULLS LAST, created_at DESC
  `) as ReviewRow[];
  return rows.map(mapReview);
}

export async function insertPendingReview(input: {
  id: string;
  memberId: string;
  rating: number;
  content: string;
  caseType: string;
  ipHash: string;
  flags: ModerationFlag[];
  stripeSessionId?: string;
}): Promise<void> {
  await sql`
    INSERT INTO reviews_chiho
      (id, member_id, rating, content, case_type, status, ip_hash, flags, stripe_session_id)
    VALUES
      (${input.id}, ${input.memberId}, ${input.rating}, ${input.content},
       ${input.caseType}, 'pending_payment', ${input.ipHash},
       ${JSON.stringify(input.flags)}::jsonb, ${input.stripeSessionId ?? null})
  `;
}

export async function findReviewByStripeSession(
  sessionId: string,
): Promise<StoredReview | null> {
  const rows = (await sql`
    SELECT * FROM reviews_chiho WHERE stripe_session_id = ${sessionId} LIMIT 1
  `) as ReviewRow[];
  return rows[0] ? mapReview(rows[0]) : null;
}

export async function promoteReviewAfterPayment(
  reviewId: string,
  newStatus: "published" | "under_review",
): Promise<void> {
  if (newStatus === "published") {
    await sql`
      UPDATE reviews_chiho
      SET status = 'published', published_at = NOW()
      WHERE id = ${reviewId} AND status = 'pending_payment'
    `;
  } else {
    await sql`
      UPDATE reviews_chiho
      SET status = 'under_review'
      WHERE id = ${reviewId} AND status = 'pending_payment'
    `;
  }
}

export async function setReviewStatus(
  reviewId: string,
  status: "published" | "removed",
): Promise<void> {
  if (status === "published") {
    await sql`
      UPDATE reviews_chiho
      SET status = 'published', published_at = COALESCE(published_at, NOW())
      WHERE id = ${reviewId}
    `;
  } else {
    await sql`UPDATE reviews_chiho SET status = 'removed' WHERE id = ${reviewId}`;
  }
}

export async function getAllReviews(): Promise<StoredReview[]> {
  const rows = (await sql`SELECT * FROM reviews_chiho ORDER BY created_at DESC`) as ReviewRow[];
  return rows.map(mapReview);
}

// ===== 事前審査キュー =====

export async function addToQueue(item: {
  id: string;
  reviewId: string;
  memberId: string;
  content: string;
  rating: number;
  caseType: string;
  autoFlags: ModerationFlag[];
}): Promise<void> {
  await sql`
    INSERT INTO moderation_queue_chiho
      (id, review_id, member_id, content, rating, case_type, auto_flags)
    VALUES
      (${item.id}, ${item.reviewId}, ${item.memberId}, ${item.content},
       ${item.rating}, ${item.caseType}, ${JSON.stringify(item.autoFlags)}::jsonb)
  `;
}

export async function getPendingQueue(): Promise<ModerationQueueItem[]> {
  const rows = (await sql`
    SELECT * FROM moderation_queue_chiho WHERE status = 'pending' ORDER BY created_at ASC
  `) as QueueRow[];
  return rows.map(mapQueue);
}

export async function getAllQueueItems(): Promise<ModerationQueueItem[]> {
  const rows = (await sql`
    SELECT * FROM moderation_queue_chiho ORDER BY created_at DESC
  `) as QueueRow[];
  return rows.map(mapQueue);
}

export async function updateQueueStatus(
  id: string,
  status: "approved" | "rejected",
  reviewer: string,
  reviewerNote?: string,
): Promise<void> {
  await sql`
    UPDATE moderation_queue_chiho
    SET status = ${status}, reviewer = ${reviewer},
        reviewer_note = ${reviewerNote ?? null}, reviewed_at = NOW()
    WHERE id = ${id}
  `;
}

// ===== 削除依頼 =====

export async function addTakedown(req: {
  id: string;
  receiptNumber: string;
  requesterName: string;
  requesterType: TakedownRequest["requesterType"];
  requesterEmail: string;
  ipHash: string;
  targetReviewId?: string;
  targetMemberId?: string;
  violationCategories: string[];
  reason: string;
  evidence: string;
}): Promise<void> {
  await sql`
    INSERT INTO takedowns_chiho
      (id, receipt_number, requester_name, requester_type, requester_email, ip_hash,
       target_review_id, target_member_id, violation_categories, reason, evidence)
    VALUES
      (${req.id}, ${req.receiptNumber}, ${req.requesterName}, ${req.requesterType},
       ${req.requesterEmail}, ${req.ipHash}, ${req.targetReviewId ?? null}, ${req.targetMemberId ?? null},
       ${JSON.stringify(req.violationCategories)}::jsonb, ${req.reason}, ${req.evidence})
  `;
}

export async function checkTakedownRateLimit(
  ipHash: string,
  windowHours: number,
  max: number,
): Promise<{ ok: boolean; remaining: number }> {
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();
  const rows = (await sql`
    SELECT COUNT(*)::text AS count FROM takedowns_chiho
    WHERE ip_hash = ${ipHash} AND created_at > ${since}
  `) as { count: string }[];
  const count = Number(rows[0]?.count ?? 0);
  return { ok: count < max, remaining: Math.max(0, max - count) };
}

export async function checkCorrectionRateLimit(
  ipHash: string,
  windowHours: number,
  max: number,
): Promise<{ ok: boolean; remaining: number }> {
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();
  const rows = (await sql`
    SELECT COUNT(*)::text AS count FROM corrections_chiho
    WHERE ip_hash = ${ipHash} AND created_at > ${since}
  `) as { count: string }[];
  const count = Number(rows[0]?.count ?? 0);
  return { ok: count < max, remaining: Math.max(0, max - count) };
}

export async function getTakedowns(): Promise<TakedownRequest[]> {
  const rows = (await sql`
    SELECT * FROM takedowns_chiho ORDER BY created_at DESC
  `) as TakedownRow[];
  return rows.map(mapTakedown);
}

export async function updateTakedown(
  id: string,
  patch: Partial<{
    status: TakedownRequest["status"];
    decisionReason: string;
    operatorNote: string;
    notifiedAt: string;
    completedAt: string;
  }>,
): Promise<void> {
  if (patch.status) {
    await sql`UPDATE takedowns_chiho SET status = ${patch.status} WHERE id = ${id}`;
  }
  if (patch.decisionReason !== undefined) {
    await sql`UPDATE takedowns_chiho SET decision_reason = ${patch.decisionReason} WHERE id = ${id}`;
  }
  if (patch.operatorNote !== undefined) {
    await sql`UPDATE takedowns_chiho SET operator_note = ${patch.operatorNote} WHERE id = ${id}`;
  }
  if (patch.notifiedAt) {
    await sql`UPDATE takedowns_chiho SET notified_at = ${patch.notifiedAt} WHERE id = ${id}`;
  }
  if (patch.completedAt) {
    await sql`UPDATE takedowns_chiho SET completed_at = ${patch.completedAt} WHERE id = ${id}`;
  }
}

// ===== 訂正依頼 =====

export async function addCorrection(req: {
  id: string;
  receiptNumber: string;
  requesterName: string;
  requesterEmail: string;
  ipHash: string;
  target: string;
  memberRef?: string;
  speechRef?: string;
  whatIsWrong: string;
  shouldBe: string;
  evidenceUrl: string;
}): Promise<void> {
  await sql`
    INSERT INTO corrections_chiho
      (id, receipt_number, requester_name, requester_email, ip_hash, target,
       member_ref, speech_ref, what_is_wrong, should_be, evidence_url)
    VALUES
      (${req.id}, ${req.receiptNumber}, ${req.requesterName}, ${req.requesterEmail},
       ${req.ipHash}, ${req.target}, ${req.memberRef ?? null}, ${req.speechRef ?? null},
       ${req.whatIsWrong}, ${req.shouldBe}, ${req.evidenceUrl})
  `;
}

export async function getCorrections(): Promise<CorrectionRequest[]> {
  const rows = (await sql`
    SELECT * FROM corrections_chiho ORDER BY created_at DESC
  `) as CorrectionRow[];
  return rows.map(mapCorrection);
}

// ===== 運営ログ =====

export async function addLog(log: {
  id: string;
  actionType: string;
  decisionReason: string;
  operator: string;
  relatedReviewId?: string;
  relatedTakedownId?: string;
  relatedCorrectionId?: string;
  snapshot?: Record<string, unknown>;
}): Promise<void> {
  await sql`
    INSERT INTO moderation_logs_chiho
      (id, action_type, decision_reason, operator,
       related_review_id, related_takedown_id, related_correction_id, snapshot)
    VALUES
      (${log.id}, ${log.actionType}, ${log.decisionReason}, ${log.operator},
       ${log.relatedReviewId ?? null}, ${log.relatedTakedownId ?? null},
       ${log.relatedCorrectionId ?? null},
       ${JSON.stringify(log.snapshot ?? {})}::jsonb)
  `;
}

export async function getLogs(): Promise<ModerationLog[]> {
  type LogRow = {
    id: string;
    related_review_id: string | null;
    related_takedown_id: string | null;
    related_correction_id: string | null;
    action_type: string;
    decision_reason: string;
    operator: string;
    snapshot: unknown;
    created_at: string;
  };
  const rows = (await sql`
    SELECT * FROM moderation_logs_chiho ORDER BY created_at DESC LIMIT 500
  `) as LogRow[];
  return rows.map((r) => ({
    id: r.id,
    relatedReviewId: r.related_review_id ?? undefined,
    relatedTakedownId: r.related_takedown_id ?? undefined,
    relatedCorrectionId: r.related_correction_id ?? undefined,
    actionType: r.action_type,
    decisionReason: r.decision_reason,
    operator: r.operator,
    snapshot: (typeof r.snapshot === "object" && r.snapshot !== null
      ? (r.snapshot as Record<string, unknown>)
      : {}) as Record<string, unknown>,
    createdAt: r.created_at,
  }));
}

// ===== 統計 =====

export async function getStats() {
  type CountRow = { count: string };
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    totalReviewsRes,
    publishedReviewsRes,
    removedReviewsRes,
    queuePendingRes,
    takedownsRes,
    last30NewReviewsRes,
    avgTatRes,
    totalLogsRes,
  ] = await Promise.all([
    sql`SELECT COUNT(*)::text AS count FROM reviews_chiho`,
    sql`SELECT COUNT(*)::text AS count FROM reviews_chiho WHERE status='published'`,
    sql`SELECT COUNT(*)::text AS count FROM reviews_chiho WHERE status='removed'`,
    sql`SELECT COUNT(*)::text AS count FROM moderation_queue_chiho WHERE status='pending'`,
    sql`SELECT status, COUNT(*)::text AS count FROM takedowns_chiho GROUP BY status`,
    sql`SELECT COUNT(*)::text AS count FROM reviews_chiho WHERE created_at > ${monthAgo}`,
    sql`
      SELECT COALESCE(ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) / 3600))::text, '0') AS hours
      FROM takedowns_chiho WHERE completed_at IS NOT NULL
    `,
    sql`SELECT COUNT(*)::text AS count FROM moderation_logs_chiho`,
  ]);

  const td = takedownsRes as { status: TakedownRequest["status"]; count: string }[];
  const tdMap = Object.fromEntries(td.map((r) => [r.status, Number(r.count)])) as Record<
    TakedownRequest["status"],
    number
  >;
  const cnt = (rs: unknown): number => {
    const arr = rs as CountRow[];
    return Number(arr[0]?.count ?? 0);
  };

  const avgArr = avgTatRes as { hours: string }[];
  return {
    totalReviews: cnt(totalReviewsRes),
    publishedReviews: cnt(publishedReviewsRes),
    removedReviews: cnt(removedReviewsRes),
    queuePending: cnt(queuePendingRes),
    takedownsByStatus: {
      received: tdMap.received ?? 0,
      under_review: tdMap.under_review ?? 0,
      consultation_started: tdMap.consultation_started ?? 0,
      approved: tdMap.approved ?? 0,
      rejected: tdMap.rejected ?? 0,
    },
    last30Days: {
      newReviews: cnt(last30NewReviewsRes),
    },
    avgTurnaroundHours: Number(avgArr[0]?.hours ?? 0),
    totalLogs: cnt(totalLogsRes),
  };
}

// ===== レートリミット =====

export async function checkRateLimit(
  ipHash: string,
  windowHours: number,
  max: number,
): Promise<{ ok: boolean; remaining: number }> {
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000).toISOString();
  const rows = (await sql`
    SELECT COUNT(*)::text AS count FROM reviews_chiho
    WHERE ip_hash = ${ipHash} AND created_at > ${since}
  `) as { count: string }[];
  const count = Number(rows[0]?.count ?? 0);
  return { ok: count < max, remaining: Math.max(0, max - count) };
}

// ===== Stripe Webhook 冪等性 =====

export async function recordStripeEvent(
  eventId: string,
  type: string,
  payload: unknown,
): Promise<boolean> {
  const rows = (await sql`
    INSERT INTO stripe_events_chiho (id, type, payload)
    VALUES (${eventId}, ${type}, ${JSON.stringify(payload)}::jsonb)
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `) as { id: string }[];
  return rows.length > 0;
}

export async function findQueueByReviewId(
  reviewId: string,
): Promise<ModerationQueueItem | null> {
  const rows = (await sql`
    SELECT * FROM moderation_queue_chiho WHERE review_id = ${reviewId} LIMIT 1
  `) as QueueRow[];
  return rows[0] ? mapQueue(rows[0]) : null;
}

// ===== 受付番号生成 =====

export function generateReceiptNumber(prefix: "TD" | "CR" = "TD"): string {
  const yymmdd = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  // CHIHO プレフィックスで国会議員マップと区別
  return `CH-${prefix}-${yymmdd}-${rand}`;
}
