"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import {
  addTakedown,
  generateReceiptNumber,
  checkTakedownRateLimit,
} from "@/lib/server-store";
import { sendOperatorMail } from "@/lib/mailer";
import { getClientIpHash } from "@/lib/auth";

const RATE_LIMIT_WINDOW_HOURS = 24;
const RATE_LIMIT_MAX = 5;

const VIOLATION_LABELS: Record<string, string> = {
  privacy: "私生活への言及",
  defamation: "誹謗中傷・人格攻撃",
  discrimination: "差別的表現",
  falsehood: "虚偽の事実摘示",
  family: "家族への言及",
  threat: "脅迫・嫌がらせ",
  other: "その他",
};

type TakedownResult = { ok: false; error: string };

export async function submitTakedownRequest(input: {
  name: string;
  email: string;
  requesterType: "self" | "lawyer" | "secretary" | "other";
  reviewUrl: string;
  presetMemberId?: string;
  presetReviewId?: string;
  violations: string[];
  reason: string;
  evidence: string;
}): Promise<TakedownResult | void> {
  if (!input.name?.trim() || !input.email?.trim() || !input.reviewUrl?.trim()) {
    return {
      ok: false,
      error: "必須項目（氏名・メール・投稿URL）を入力してください",
    };
  }
  if (!/^\S+@\S+\.\S+$/.test(input.email)) {
    return { ok: false, error: "メールアドレスの形式が正しくありません" };
  }
  if (input.violations.length === 0) {
    return {
      ok: false,
      error: "ガイドライン違反の項目を1つ以上選択してください",
    };
  }
  if (input.reason.length < 200) {
    return {
      ok: false,
      error: `削除理由は200文字以上で記入してください（現在${input.reason.length}文字）`,
    };
  }

  const ipHash = await getClientIpHash();
  const rl = await checkTakedownRateLimit(
    ipHash,
    RATE_LIMIT_WINDOW_HOURS,
    RATE_LIMIT_MAX,
  );
  if (!rl.ok) {
    return {
      ok: false,
      error: `短時間に多数の依頼が確認されました。${RATE_LIMIT_WINDOW_HOURS}時間ほど時間をおいて再度お試しください`,
    };
  }

  const id = `td-${crypto.randomUUID()}`;
  const receiptNumber = generateReceiptNumber("TD");

  // URL からレビューID／メンバーIDを抽出（chiho-map は /giin/[id] パス）
  const memberMatch = input.reviewUrl.match(/\/giin\/([^/#?]+)/);
  const reviewMatch = input.reviewUrl.match(/review-([^&#?]+)/);
  const targetMemberId = memberMatch?.[1] ?? input.presetMemberId;
  const targetReviewId = reviewMatch?.[1] ?? input.presetReviewId;

  await addTakedown({
    id,
    receiptNumber,
    requesterName: input.name.slice(0, 200),
    requesterType: input.requesterType,
    requesterEmail: input.email.slice(0, 200),
    ipHash,
    targetReviewId,
    targetMemberId,
    violationCategories: input.violations,
    reason: input.reason.slice(0, 4000),
    evidence: (input.evidence ?? "").slice(0, 4000),
  });

  const violationsText = input.violations
    .map((v) => `・${VIOLATION_LABELS[v] ?? v}`)
    .join("\n");
  await sendOperatorMail({
    subject: `【地方議員マップ】削除依頼を受付（${receiptNumber}）`,
    replyTo: input.email,
    text: `削除依頼を受付しました。

受付番号: ${receiptNumber}
依頼者氏名: ${input.name}
依頼者区分: ${input.requesterType}
依頼者メール: ${input.email}
対象投稿URL: ${input.reviewUrl}
対象議員ID: ${targetMemberId ?? "(未特定)"}
対象投稿ID: ${targetReviewId ?? "(未特定)"}

ガイドライン違反項目:
${violationsText}

削除理由:
${input.reason}

証拠・補足:
${input.evidence || "(なし)"}

---
対応は Neon DB の takedowns_chiho テーブルから直接行ってください。
`,
  });

  redirect(`/takedown/received?n=${receiptNumber}`);
}
