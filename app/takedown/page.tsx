"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { submitTakedownRequest } from "@/app/actions/takedown";

type RequesterType = "self" | "lawyer" | "secretary" | "other";

const VIOLATION_TYPES = [
  { value: "defamation", label: "名誉毀損・侮辱" },
  { value: "privacy", label: "プライバシー侵害（私生活・家族・住所等）" },
  { value: "copyright", label: "著作権侵害" },
  { value: "false_fact", label: "虚偽事実の摘示" },
  { value: "other", label: "その他" },
] as const;

const VIOLATION_OPTIONS = ["私生活への言及", "罵詈雑言", "虚偽事実", "その他"];

const REQUESTER_TYPES = [
  { value: "self", label: "議員本人" },
  { value: "lawyer", label: "弁護士" },
  { value: "secretary", label: "議員秘書" },
  { value: "other", label: "その他" },
] as const;

function TakedownForm() {
  const sp = useSearchParams();
  const presetReviewId = sp.get("reviewId") ?? "";
  const presetMemberId = sp.get("memberId") ?? "";

  const [name, setName] = useState("");
  const [requesterType, setRequesterType] = useState<RequesterType>("self");
  const [violationType, setViolationType] = useState<string>("defamation");
  const [email, setEmail] = useState("");
  const [reviewUrl, setReviewUrl] = useState(
    presetReviewId
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/giin/${presetMemberId}#review-${presetReviewId}`
      : "",
  );
  const [violations, setViolations] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggleViolation = (v: string) => {
    setViolations((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v],
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result = await submitTakedownRequest({
          name,
          email,
          requesterType,
          reviewUrl,
          presetMemberId,
          presetReviewId,
          violations,
          reason,
          evidence,
        });
        if (result && result.ok === false) {
          setError(result.error);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "送信に失敗しました");
      }
    });
  };

  return (
    <form
      onSubmit={submit}
      className="space-y-5 bg-surface border border-border rounded p-5"
    >
      <div>
        <label className="block text-sm font-medium text-primary mb-1">
          氏名 <span className="text-rose-700">*</span>
          <span className="text-xs font-normal text-muted-foreground ml-2">
            本人確認のため
          </span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-border rounded px-3 py-2 text-sm bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-1">
          本人または代理人の別 <span className="text-rose-700">*</span>
        </label>
        <div className="flex flex-wrap gap-3 text-sm">
          {REQUESTER_TYPES.map((t) => (
            <label key={t.value} className="flex items-center gap-1.5">
              <input
                type="radio"
                name="requesterType"
                value={t.value}
                checked={requesterType === t.value}
                onChange={() => setRequesterType(t.value)}
              />
              <span>{t.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-1">
          権利侵害の類型 <span className="text-rose-700">*</span>
        </label>
        <div className="space-y-1.5 text-sm">
          {VIOLATION_TYPES.map((t) => (
            <label key={t.value} className="flex items-start gap-2">
              <input
                type="radio"
                name="violationType"
                value={t.value}
                checked={violationType === t.value}
                onChange={() => setViolationType(t.value)}
                className="mt-0.5"
              />
              <span>{t.label}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          類型により、確認に必要な追加資料（委任状、著作権の証明など）をお願いする場合があります。
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-1">
          連絡先メールアドレス <span className="text-rose-700">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-border rounded px-3 py-2 text-sm bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-1">
          削除を求める投稿のURL <span className="text-rose-700">*</span>
        </label>
        <input
          type="text"
          value={reviewUrl}
          onChange={(e) => setReviewUrl(e.target.value)}
          className="w-full border border-border rounded px-3 py-2 text-sm bg-white font-mono"
          placeholder="https://chiho-map.vercel.app/giin/.../#review-..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-2">
          ガイドライン違反の項目 <span className="text-rose-700">*</span>
        </label>
        <div className="flex flex-wrap gap-3 text-sm">
          {VIOLATION_OPTIONS.map((v) => (
            <label
              key={v}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded border cursor-pointer ${
                violations.includes(v)
                  ? "border-accent bg-accent/10"
                  : "border-border bg-white"
              }`}
            >
              <input
                type="checkbox"
                checked={violations.includes(v)}
                onChange={() => toggleViolation(v)}
              />
              <span>{v}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-1">
          削除を求める具体的理由 <span className="text-rose-700">*</span>
          <span className="text-xs font-normal text-muted-foreground ml-2">
            200文字以上
          </span>
        </label>
        <textarea
          rows={6}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full border border-border rounded px-3 py-2 text-sm bg-white resize-y"
          placeholder="どの部分が、なぜガイドライン違反に該当するかを具体的にご記入ください。"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {reason.length} / 200文字
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-1">
          真実でない場合、根拠資料の有無
          <span className="text-xs font-normal text-muted-foreground ml-2">
            任意
          </span>
        </label>
        <textarea
          rows={3}
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
          className="w-full border border-border rounded px-3 py-2 text-sm bg-white resize-y"
          placeholder="例：当該日時の活動記録、市議会会議録のURL、新聞記事の見出しなど"
        />
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded p-3 text-sm text-rose-900">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="bg-accent text-white px-5 py-2.5 rounded hover:bg-accent/90 text-sm disabled:opacity-60"
        >
          {isPending ? "送信中…" : "削除依頼を送信"}
        </button>
        <Link
          href="/"
          className="self-center text-sm text-muted-foreground hover:text-primary"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}

export default function TakedownPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-xl font-bold text-primary mb-2">削除依頼</h1>
      <p className="text-xs text-muted-foreground mb-6">
        本サイト上の投稿が
        <Link href="/guidelines" className="underline">
          投稿ガイドライン
        </Link>
        に違反していると考える場合の受付窓口です。
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded p-4 text-xs space-y-2 mb-6">
        <p className="font-bold text-amber-900">削除依頼にあたって</p>
        <ul className="list-disc pl-5 space-y-1 text-amber-900 leading-relaxed">
          <li>ガイドラインに合致した正当な批判は、原則として削除しません。</li>
          <li>
            本サイトは個人で1人で運営しております。原則として5営業日以内に判断結果をお知らせしますが、業務状況により<strong>1〜2週間お時間をいただく場合があります</strong>。
          </li>
          <li>
            判断が困難な場合、投稿者に意見照会を行うことがあります（情報流通プラットフォーム対処法（旧プロバイダ責任制限法）の趣旨に基づく手続き）。
          </li>
          <li>
            削除依頼は<strong>原則として本フォームから受け付けます</strong>。ただし、フォームが表示されない・送信できない場合に限り、
            <strong>keiai0527+chiho-map@gmail.com</strong>
            へのメールでも受け付けます。電話、SNS、第三者経由での削除依頼には対応しません。
          </li>
        </ul>
      </div>

      <Suspense
        fallback={
          <div className="text-sm text-muted-foreground">読み込み中…</div>
        }
      >
        <TakedownForm />
      </Suspense>

      <noscript>
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded p-4 text-sm leading-relaxed text-amber-900">
          フォームの利用には JavaScript が必要です。フォームが表示されない場合は{" "}
          <strong>keiai0527+chiho-map@gmail.com</strong>{" "}
          まで、対象URL・理由・お名前・連絡先を記載してご連絡ください。
        </div>
      </noscript>
    </div>
  );
}
