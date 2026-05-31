"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { submitCorrectionRequest } from "@/app/actions/correction";

const CORRECTION_TARGETS = [
  "議員プロフィール（生年月日・学歴・職歴・経歴等）に誤りがある",
  "議員プロフィール（所属政党・選挙区・期数等）に誤りがある",
  "主張・政策の記載に誤りがある",
  "公式リンク・SNS のURLが正しくない",
  "その他の事実誤り",
];

function CorrectionForm() {
  const sp = useSearchParams();
  const presetMember = sp.get("memberId") ?? "";
  const presetSpeech = sp.get("speechId") ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [target, setTarget] = useState(CORRECTION_TARGETS[0]);
  const [memberRef, setMemberRef] = useState(presetMember);
  const [speechRef, setSpeechRef] = useState(presetSpeech);
  const [whatIsWrong, setWhatIsWrong] = useState("");
  const [shouldBe, setShouldBe] = useState("");
  const [evidenceURL, setEvidenceURL] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result = await submitCorrectionRequest({
          name,
          email,
          target,
          memberRef,
          speechRef,
          whatIsWrong,
          shouldBe,
          evidenceURL,
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
      <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-900 leading-relaxed">
        <p className="font-bold mb-1">訂正依頼について</p>
        <p>
          このフォームは、議員プロフィール・経歴・主張・公式リンク等に
          <strong>事実上の誤り</strong>がある場合の訂正依頼用です。
          投稿の削除を希望される場合は、
          <Link href="/takedown" className="underline font-medium">
            削除依頼フォーム
          </Link>
          をご利用ください。
        </p>
        <p className="mt-2">
          ※ 本サイトは個人で1人で運営しております。原則として5営業日以内にご返信しますが、業務状況により
          <strong>1〜2週間お時間をいただく場合があります</strong>。
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-1">
          お名前 <span className="text-rose-700">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-border rounded px-3 py-2 text-sm bg-white"
          placeholder="（任意：所属・肩書もご記入ください）"
        />
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
        <label className="block text-sm font-medium text-primary mb-2">
          訂正をお願いしたい項目 <span className="text-rose-700">*</span>
        </label>
        <div className="space-y-1.5 text-sm">
          {CORRECTION_TARGETS.map((t) => (
            <label key={t} className="flex items-center gap-2">
              <input
                type="radio"
                name="target"
                value={t}
                checked={target === t}
                onChange={() => setTarget(t)}
              />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            対象議員ID（任意）
          </label>
          <input
            type="text"
            value={memberRef}
            onChange={(e) => setMemberRef(e.target.value)}
            className="w-full border border-border rounded px-3 py-2 text-sm bg-white font-mono"
            placeholder="例: osaka-fujita-akira"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            対象発言ID（任意）
          </label>
          <input
            type="text"
            value={speechRef}
            onChange={(e) => setSpeechRef(e.target.value)}
            className="w-full border border-border rounded px-3 py-2 text-sm bg-white font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-1">
          誤っている内容 <span className="text-rose-700">*</span>
        </label>
        <textarea
          rows={4}
          value={whatIsWrong}
          onChange={(e) => setWhatIsWrong(e.target.value)}
          className="w-full border border-border rounded px-3 py-2 text-sm bg-white resize-y"
          placeholder="現在表示されている内容のうち、どの部分が事実と異なるかを具体的にご記入ください。"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-1">
          正しい内容（分かる範囲で）
        </label>
        <textarea
          rows={3}
          value={shouldBe}
          onChange={(e) => setShouldBe(e.target.value)}
          className="w-full border border-border rounded px-3 py-2 text-sm bg-white resize-y"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-primary mb-1">
          根拠資料のURL（任意）
        </label>
        <input
          type="url"
          value={evidenceURL}
          onChange={(e) => setEvidenceURL(e.target.value)}
          className="w-full border border-border rounded px-3 py-2 text-sm bg-white font-mono"
          placeholder="https://..."
        />
        <p className="text-xs text-muted-foreground mt-1">
          市議会公式サイト、議員本人サイト、政党公式サイト、報道記事等の確認可能なURL
        </p>
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
          {isPending ? "送信中…" : "訂正依頼を送信"}
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

export default function CorrectionPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-xl font-bold text-primary mb-2">訂正依頼</h1>
      <p className="text-xs text-muted-foreground mb-6">
        本サイトに掲載されている情報に
        <strong>事実上の誤り</strong>
        がある場合に、訂正をご依頼いただけます。
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded p-4 text-xs space-y-2 mb-6">
        <p className="font-bold text-amber-900">訂正依頼について</p>
        <ul className="list-disc pl-5 space-y-1 text-amber-900 leading-relaxed">
          <li>本フォームは事実誤りの訂正用です。投稿削除依頼ではありません。</li>
          <li>
            原則として5営業日以内に確認・対応します。確認が取れた誤りは速やかに修正します。
          </li>
          <li>訂正対応の判断記録は不可逆ログとして保存します。</li>
        </ul>
      </div>

      <Suspense
        fallback={
          <div className="text-sm text-muted-foreground">読み込み中…</div>
        }
      >
        <CorrectionForm />
      </Suspense>

      <noscript>
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded p-4 text-sm leading-relaxed text-amber-900">
          フォームの利用には JavaScript が必要です。フォームが表示されない場合は{" "}
          <strong>info@kokkaimap.jp</strong>{" "}
          まで、対象ページURL・誤りの箇所・正しい内容・出典・お名前・連絡先を記載してご連絡ください。
        </div>
      </noscript>
    </div>
  );
}
