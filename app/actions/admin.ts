"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import {
  setReviewStatus,
  updateTakedown,
  addLog,
  getAllReviews,
} from "@/lib/server-store";
import { sendOperatorMail } from "@/lib/mailer";
import { requireAdminAuth } from "@/lib/auth";

// 削除依頼の判定（承認 or 却下）
export async function decideTakedown(formData: FormData) {
  await requireAdminAuth();

  const takedownId = String(formData.get("takedownId") ?? "");
  const reviewId = String(formData.get("reviewId") ?? "");
  const requesterEmail = String(formData.get("requesterEmail") ?? "");
  const receiptNumber = String(formData.get("receiptNumber") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!takedownId) return;
  if (decision !== "approved" && decision !== "rejected") return;

  const now = new Date().toISOString();

  await updateTakedown(takedownId, {
    status: decision,
    decisionReason: reason,
    completedAt: now,
  });

  if (decision === "approved" && reviewId) {
    await setReviewStatus(reviewId, "removed");
    const allReviews = await getAllReviews();
    const target = allReviews.find((r) => r.id === reviewId);
    if (target) {
      revalidatePath(`/giin/${target.memberId}`);
    }
  }

  await addLog({
    id: `log-${crypto.randomUUID()}`,
    relatedTakedownId: takedownId,
    relatedReviewId: reviewId || undefined,
    actionType:
      decision === "approved" ? "takedown_approved" : "takedown_rejected",
    decisionReason: reason || "(理由なし)",
    operator: "運営事務局",
    snapshot: {
      site: "chiho-map",
      receiptNumber,
      ...(decision === "approved" && reviewId
        ? { prevStatus: "published", newStatus: "removed" }
        : {}),
    },
  });

  if (requesterEmail) {
    const subjectStatus = decision === "approved" ? "承認" : "不承認";
    await sendOperatorMail({
      subject: `【地方議員マップ】削除依頼の判定結果（${receiptNumber}）：${subjectStatus}`,
      replyTo: requesterEmail,
      text: `削除依頼の判定結果をお知らせします。

受付番号: ${receiptNumber}
判定: ${decision === "approved" ? "承認（投稿を非公開にしました）" : "不承認"}

判定理由:
${reason || "（理由は別途回答します）"}

ご不明な点がございましたら、本メールに返信してください。

地方議員マップ運営事務局
`,
    });
  }

  revalidatePath("/op-console-demo/takedowns");
}
