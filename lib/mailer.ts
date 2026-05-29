import "server-only";
import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey && process.env.NODE_ENV !== "production") {
  console.warn("[mailer] RESEND_API_KEY is not set");
}

const resend = new Resend(apiKey ?? "re_placeholder");

// Resend ドメイン認証完了後は env で `RESEND_FROM_EMAIL=noreply@send.chihogiin.jp` を設定する。
// 未設定時は Resend の共通テスト用 from を使う（受信は問題なく可能）。
const FROM = process.env.RESEND_FROM_EMAIL ?? "地方議員マップ <onboarding@resend.dev>";
const OPERATOR_TO =
  process.env.OPERATOR_EMAIL ?? "keiai0527+chiho-map@gmail.com";

export async function sendOperatorMail(opts: {
  subject: string;
  text: string;
  replyTo?: string;
}) {
  if (!apiKey) {
    console.warn("[mailer] dry run (no RESEND_API_KEY):", opts.subject);
    return { ok: false, dryRun: true } as const;
  }
  const res = await resend.emails.send({
    from: FROM,
    to: [OPERATOR_TO],
    subject: opts.subject,
    text: opts.text,
    replyTo: opts.replyTo,
  });
  if (res.error) {
    console.error("[mailer] send failed:", res.error);
    return { ok: false, error: res.error.message } as const;
  }
  return { ok: true, id: res.data?.id } as const;
}
