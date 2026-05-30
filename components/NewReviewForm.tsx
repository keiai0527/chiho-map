"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  MIN_CONTENT_LENGTH,
  describeFlag,
  moderateContent,
} from "@/lib/moderation";
import { createReviewCheckout } from "@/app/actions/review-checkout";

const REVIEW_FEE = 100;

const CASE_TYPES = [
  "本会議発言",
  "委員会質問",
  "政策・条例",
  "事務所対応",
  "陳情対応",
  "街頭・SNS発信",
  "選挙公約との整合性",
  "その他",
];

// 地方議員向け評価軸（diet-map から「国会活動」→「議会活動」に調整）
const EVAL_CRITERIA = [
  { key: "clarity", label: "発言・質問の分かりやすさ" },
  { key: "accountability", label: "説明責任" },
  { key: "consistency", label: "政策・公約への一貫性" },
  { key: "regional", label: "地域課題への対応" },
  { key: "transparency", label: "議会活動の透明性" },
  { key: "communication", label: "公式情報の発信頻度" },
] as const;

type CriterionKey = (typeof EVAL_CRITERIA)[number]["key"];

export type NewReviewFormMember = {
  id: string;
  name: string;
  cityName: string;
  electoralDistrict: string;
  partyName: string;
  partyColor: string;
};

export function NewReviewForm({ member }: { member: NewReviewFormMember }) {
  const [criteriaRatings, setCriteriaRatings] = useState<
    Record<CriterionKey, number>
  >(
    Object.fromEntries(EVAL_CRITERIA.map((c) => [c.key, 3])) as Record<
      CriterionKey,
      number
    >,
  );
  const rating = Math.round(
    EVAL_CRITERIA.reduce((s, c) => s + criteriaRatings[c.key], 0) /
      EVAL_CRITERIA.length,
  );
  const [caseType, setCaseType] = useState(CASE_TYPES[0]);
  const [content, setContent] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flags, setFlags] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFlags([]);

    if (!agreed) {
      setError("ガイドラインの確認にチェックを入れてください");
      return;
    }

    const result = moderateContent(content);
    if (result.status === "rejected") {
      setError(result.reason);
      setFlags(result.flags.map(describeFlag));
      return;
    }

    startTransition(async () => {
      try {
        const result = await createReviewCheckout({
          memberId: member.id,
          memberName: member.name,
          rating,
          caseType,
          content,
        });
        if (result && result.ok === false) {
          setError(result.error);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "決済セッションの作成に失敗しました");
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <nav className="text-xs text-muted-foreground mb-6">
        <Link href={`/giin/${member.id}`} className="hover:text-primary">
          ← {member.name} の議員ページに戻る
        </Link>
      </nav>

      <h1 className="text-xl font-bold text-primary mb-1">
        口コミを投稿する
      </h1>
      <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
        <span className="font-medium">{member.name}</span>
        <span
          className="inline-block rounded px-2 py-0.5 text-xs text-white"
          style={{ backgroundColor: member.partyColor }}
        >
          {member.partyName}
        </span>
        <span className="text-muted-foreground">
          {member.cityName}・{member.electoralDistrict}
        </span>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-4 text-xs space-y-2 mb-4">
        <p className="font-bold text-blue-900">
          📋 投稿手数料：¥{REVIEW_FEE}（税込・クレジットカード決済）
        </p>
        <p className="text-blue-900 leading-relaxed">
          口コミ投稿には、荒らし・誹謗中傷・大量投稿を防ぎ、投稿内容を事前審査するため、<strong>1投稿 ¥{REVIEW_FEE} の審査・管理手数料</strong>が必要です。投稿の公開を保証するものではなく、ガイドライン違反の投稿は非公開または削除される場合があります。
        </p>
        <p className="text-blue-900 leading-relaxed">
          用途：投稿内容の事前審査、不正投稿防止、運営管理のため。決済は決済代行（Stripe）経由で行われ、当サイトでは <strong>カード番号は一切保持しません</strong>。詳細は<Link href="/guidelines#fee" className="underline">投稿ガイドライン「投稿手数料について」</Link>をご覧ください。
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded p-4 text-xs space-y-2 mb-6">
        <p className="font-bold text-amber-900">投稿前にご確認ください</p>
        <p className="text-amber-900 leading-relaxed">
          本サイトの口コミ投稿は、市議会議員の<strong>公務・政策・議会活動・地域活動</strong>に関する具体的な評価を投稿するための機能です。
        </p>
        <p className="text-amber-900 leading-relaxed">
          <strong>人格攻撃、誹謗中傷、差別的表現、私生活・家族・住所等に関する記載、脅迫、嫌がらせを助長する投稿は禁止</strong>
          されています。詳細は
          <Link href="/guidelines" className="underline">
            投稿ガイドライン
          </Link>
          をご確認ください。
        </p>
        <p className="text-amber-900 leading-relaxed">
          β版運営期間中は、投稿は原則として全件、運営者による確認後に公開します（最大72時間程度かかる場合があります）。投稿ガイドラインに違反する内容は非公開または削除される場合があります。
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5 bg-surface border border-border rounded p-5">
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            公務評価（6項目・各5段階）
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            市議会議員としての公務に関する評価を6項目で記入してください。
          </p>
          <div className="space-y-2">
            {EVAL_CRITERIA.map((c) => (
              <div
                key={c.key}
                className="flex items-center justify-between gap-3 py-1"
              >
                <span className="text-sm flex-1 min-w-0">{c.label}</span>
                <div className="flex gap-0.5 shrink-0">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() =>
                        setCriteriaRatings((prev) => ({
                          ...prev,
                          [c.key]: n,
                        }))
                      }
                      className={`text-xl ${
                        n <= criteriaRatings[c.key]
                          ? "text-accent"
                          : "text-border"
                      }`}
                      aria-label={`${c.label}を${n}つ星`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            総合評価（自動計算）：
            <span className="font-bold text-primary">{rating}/5</span>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            ケース種別
          </label>
          <select
            value={caseType}
            onChange={(e) => setCaseType(e.target.value)}
            className="border border-border rounded px-3 py-2 text-sm bg-white"
          >
            {CASE_TYPES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            自由記述（{MIN_CONTENT_LENGTH}文字以上）
          </label>
          <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
            <strong>公務に関する具体的事実に基づいて記載してください。</strong>
            人格攻撃、私生活、家族、出自、国籍、宗教、病歴、住所、容姿、侮辱表現は禁止です。
          </p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder={`例：2026年6月の${member.cityName}本会議で、〇〇条例について△△と質問し、市長答弁を引き出した点が…`}
            className="w-full border border-border rounded px-3 py-2 text-sm bg-white resize-y"
          />
          <div className="flex justify-between mt-1 text-xs">
            <span
              className={
                content.length < MIN_CONTENT_LENGTH
                  ? "text-rose-700"
                  : "text-muted-foreground"
              }
            >
              {content.length} / {MIN_CONTENT_LENGTH}文字
            </span>
          </div>
        </div>

        <label className="flex items-start gap-2 text-xs text-foreground">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            <Link href="/guidelines" className="underline">投稿ガイドライン</Link>
            、
            <Link href="/terms" className="underline">利用規約</Link>
            を確認し、これに同意します。
          </span>
        </label>

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded p-3 text-sm space-y-1">
            <p className="font-bold text-rose-900">{error}</p>
            {flags.length > 0 && (
              <ul className="text-xs text-rose-800 list-disc pl-4">
                {flags.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="bg-amber-50 border border-amber-300 rounded p-4 text-xs leading-relaxed text-amber-900 space-y-1.5">
          <p className="font-bold">⚠️ 決済前にご確認ください</p>
          <p>
            本手数料は、投稿内容の<strong>審査・管理および不正投稿防止のための費用</strong>です。投稿内容がガイドラインに違反する場合、公開されないことがあります。<strong>その場合でも、原則として返金は行いません</strong>。
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="bg-accent text-white px-5 py-2.5 rounded hover:bg-accent/90 text-sm disabled:opacity-60"
          >
            {isPending
              ? "決済画面に移動中…"
              : `審査・管理手数料 ¥${REVIEW_FEE} を支払って投稿する`}
          </button>
          <Link
            href={`/giin/${member.id}`}
            className="text-sm text-muted-foreground self-center hover:text-primary"
          >
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
}
