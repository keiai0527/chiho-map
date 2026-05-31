"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import {
  setReviewStatus,
  updateQueueStatus,
  addLog,
  promoteReviewAfterPayment,
} from "@/lib/server-store";
import { requireAdminAuth } from "@/lib/auth";

// 事前審査キューの投稿を「公開」する
export async function approveQueuedReview(formData: FormData) {
  await requireAdminAuth();

  const queueId = String(formData.get("queueId") ?? "");
  const reviewId = String(formData.get("reviewId") ?? "");
  const memberId = String(formData.get("memberId") ?? "");
  const reviewerNote = String(formData.get("reviewerNote") ?? "").trim();

  if (!queueId || !reviewId || !memberId) {
    throw new Error("queueId, reviewId, memberId は必須です");
  }

  await updateQueueStatus(
    queueId,
    "approved",
    "運営事務局",
    reviewerNote || "（理由なし）",
  );
  await setReviewStatus(reviewId, "published");
  revalidatePath(`/giin/${memberId}`);

  await addLog({
    id: `log-${crypto.randomUUID()}`,
    actionType: "review_approved",
    decisionReason: reviewerNote || "（理由なし）",
    operator: "運営事務局",
    relatedReviewId: reviewId,
    snapshot: {
      site: "chiho-map",
      queueId,
      memberId,
      prevStatus: "under_review",
      newStatus: "published",
    },
  });

  revalidatePath("/op-console-demo/moderation");
}

// 事前審査キューの投稿を「却下」する
export async function rejectQueuedReview(formData: FormData) {
  await requireAdminAuth();

  const queueId = String(formData.get("queueId") ?? "");
  const reviewId = String(formData.get("reviewId") ?? "");
  const memberId = String(formData.get("memberId") ?? "");
  const reviewerNote = String(formData.get("reviewerNote") ?? "").trim();

  if (!queueId || !reviewId || !memberId) {
    throw new Error("queueId, reviewId, memberId は必須です");
  }

  await updateQueueStatus(
    queueId,
    "rejected",
    "運営事務局",
    reviewerNote || "（理由なし）",
  );
  await setReviewStatus(reviewId, "removed");
  revalidatePath(`/giin/${memberId}`);

  await addLog({
    id: `log-${crypto.randomUUID()}`,
    actionType: "review_rejected",
    decisionReason: reviewerNote || "（理由なし）",
    operator: "運営事務局",
    relatedReviewId: reviewId,
    snapshot: {
      site: "chiho-map",
      queueId,
      memberId,
      prevStatus: "under_review",
      newStatus: "removed",
    },
  });

  revalidatePath("/op-console-demo/moderation");
}

// 決済完了済だが webhook 不発で pending_payment のままの投稿を救出
export async function forcePromotePendingReview(formData: FormData) {
  await requireAdminAuth();

  const reviewId = String(formData.get("reviewId") ?? "");
  const memberId = String(formData.get("memberId") ?? "");
  const target = String(formData.get("target") ?? "");

  if (!reviewId || !memberId) {
    throw new Error("reviewId, memberId は必須です");
  }
  if (target !== "published" && target !== "under_review") {
    throw new Error("target は published か under_review");
  }

  await promoteReviewAfterPayment(reviewId, target as "published" | "under_review");

  if (target === "published") {
    revalidatePath(`/giin/${memberId}`);
  }

  await addLog({
    id: `log-${crypto.randomUUID()}`,
    actionType: "review_force_promoted",
    decisionReason: `Webhook 不発の救出（${target}）`,
    operator: "運営事務局",
    relatedReviewId: reviewId,
    snapshot: {
      site: "chiho-map",
      memberId,
      target,
      prevStatus: "pending_payment",
      newStatus: target,
    },
  });

  revalidatePath("/op-console-demo/moderation");
}

// 公開中の投稿を取り下げる
export async function unpublishReview(formData: FormData) {
  await requireAdminAuth();

  const reviewId = String(formData.get("reviewId") ?? "");
  const memberId = String(formData.get("memberId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!reviewId || !memberId) {
    throw new Error("reviewId, memberId は必須です");
  }

  await setReviewStatus(reviewId, "removed");
  revalidatePath(`/giin/${memberId}`);

  await addLog({
    id: `log-${crypto.randomUUID()}`,
    actionType: "review_unpublished",
    decisionReason: reason || "（理由なし）",
    operator: "運営事務局",
    relatedReviewId: reviewId,
    snapshot: {
      site: "chiho-map",
      memberId,
      prevStatus: "published",
      newStatus: "removed",
    },
  });

  revalidatePath("/op-console-demo/moderation");
}
