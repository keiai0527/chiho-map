"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import {
  addCorrection,
  generateReceiptNumber,
  checkCorrectionRateLimit,
} from "@/lib/server-store";
import { sendOperatorMail } from "@/lib/mailer";
import { getClientIpHash } from "@/lib/auth";

const RATE_LIMIT_WINDOW_HOURS = 24;
const RATE_LIMIT_MAX = 5;

type CorrectionResult = { ok: false; error: string };

export async function submitCorrectionRequest(input: {
  name: string;
  email: string;
  target: string;
  memberRef?: string;
  speechRef?: string;
  whatIsWrong: string;
  shouldBe?: string;
  evidenceURL?: string;
}): Promise<CorrectionResult | void> {
  if (
    !input.name?.trim() ||
    !input.email?.trim() ||
    !input.whatIsWrong?.trim()
  ) {
    return { ok: false, error: "お名前・メール・誤り内容は必須項目です" };
  }
  if (!/^\S+@\S+\.\S+$/.test(input.email)) {
    return { ok: false, error: "メールアドレスの形式が正しくありません" };
  }
  if (input.whatIsWrong.length < 10) {
    return { ok: false, error: "誤り内容は10文字以上で記入してください" };
  }

  const ipHash = await getClientIpHash();
  const rl = await checkCorrectionRateLimit(
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

  const id = `cr-${crypto.randomUUID()}`;
  const receiptNumber = generateReceiptNumber("CR");

  await addCorrection({
    id,
    receiptNumber,
    requesterName: input.name.slice(0, 200),
    requesterEmail: input.email.slice(0, 200),
    ipHash,
    target: input.target.slice(0, 200),
    memberRef: input.memberRef?.slice(0, 200),
    speechRef: input.speechRef?.slice(0, 200),
    whatIsWrong: input.whatIsWrong.slice(0, 4000),
    shouldBe: (input.shouldBe ?? "").slice(0, 4000),
    evidenceUrl: (input.evidenceURL ?? "").slice(0, 1000),
  });

  await sendOperatorMail({
    subject: `【地方議員マップ】訂正依頼を受付（${receiptNumber}）`,
    replyTo: input.email,
    text: `訂正依頼を受付しました。

受付番号: ${receiptNumber}
依頼者氏名: ${input.name}
依頼者メール: ${input.email}
対象: ${input.target || "(未指定)"}
議員参照: ${input.memberRef || "(なし)"}
発言参照: ${input.speechRef || "(なし)"}

誤り内容:
${input.whatIsWrong}

修正案:
${input.shouldBe || "(なし)"}

証拠URL:
${input.evidenceURL || "(なし)"}
`,
  });

  redirect(`/correction/received?n=${receiptNumber}`);
}
