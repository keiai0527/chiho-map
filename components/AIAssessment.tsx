"use client";

import { useState, useTransition } from "react";
import { assessReview, type ReviewAssessment } from "@/app/actions/assess-review";

const GRADE_LABEL: Record<
  ReviewAssessment["grade"],
  { label: string; tone: string }
> = {
  A: {
    label: "A：そのまま公開可",
    tone: "bg-emerald-100 text-emerald-900 border-emerald-300",
  },
  B: {
    label: "B：軽微な注意あり、公開可",
    tone: "bg-lime-100 text-lime-900 border-lime-300",
  },
  C: {
    label: "C：要修正",
    tone: "bg-amber-100 text-amber-900 border-amber-300",
  },
  D: {
    label: "D：非公開推奨",
    tone: "bg-orange-100 text-orange-900 border-orange-300",
  },
  E: {
    label: "E：即非公開",
    tone: "bg-rose-100 text-rose-900 border-rose-300",
  },
};

export function AIAssessment({ reviewId }: { reviewId: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ReviewAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessment = () => {
    setError(null);
    startTransition(async () => {
      try {
        const r = await assessReview(reviewId);
        setResult(r);
      } catch (e) {
        setError(e instanceof Error ? e.message : "AI 判定に失敗しました");
      }
    });
  };

  if (!result && !pending && !error) {
    return (
      <button
        type="button"
        onClick={fetchAssessment}
        className="text-xs px-3 py-1.5 rounded border border-violet-400 text-violet-900 bg-violet-50 hover:bg-violet-100"
      >
        🤖 AI に審査補助を求める
      </button>
    );
  }

  if (pending) {
    return (
      <div className="text-xs px-3 py-1.5 rounded bg-violet-50 border border-violet-200 text-violet-900">
        🤖 AI が判定中…（数秒お待ちください）
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-1">
        <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded p-2">
          {error}
        </p>
        <button
          type="button"
          onClick={fetchAssessment}
          className="text-xs underline text-violet-700"
        >
          再試行
        </button>
      </div>
    );
  }

  if (!result) return null;

  const tone = GRADE_LABEL[result.grade];

  return (
    <div className={`border rounded p-3 space-y-2 ${tone.tone}`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm font-bold">🤖 AI 判定：{tone.label}</p>
        <button
          type="button"
          onClick={fetchAssessment}
          className="text-[10px] underline opacity-70 hover:opacity-100"
        >
          再判定
        </button>
      </div>

      <div className="text-xs space-y-1">
        <p className="font-semibold">判断理由:</p>
        <p className="leading-relaxed whitespace-pre-wrap">{result.reason}</p>
      </div>

      {result.riskCategories.length > 0 && (
        <div className="text-[11px] space-y-0.5">
          <p className="font-semibold">リスク分類:</p>
          <div className="flex flex-wrap gap-1">
            {result.riskCategories.map((c, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 rounded bg-white/60 border border-current text-[10px]"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.dangerousPhrases.length > 0 && (
        <div className="text-[11px] space-y-0.5">
          <p className="font-semibold">危険語ハイライト:</p>
          <ul className="list-disc pl-5 space-y-0.5">
            {result.dangerousPhrases.map((p, i) => (
              <li key={i}>
                <span className="bg-yellow-200 px-1 rounded">{p.phrase}</span>
                <span className="text-[10px] opacity-80 ml-1">— {p.why}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.suggestedFix && (
        <div className="text-[11px] space-y-0.5">
          <p className="font-semibold">AI 修正文案:</p>
          <p className="bg-white/60 rounded p-2 leading-relaxed whitespace-pre-wrap text-[11px]">
            {result.suggestedFix}
          </p>
        </div>
      )}

      <div className="text-[11px] space-y-0.5">
        <p className="font-semibold">推奨対応:</p>
        <p>{result.recommendedAction}</p>
      </div>

      <p className="text-[10px] opacity-60">
        ※ AI（Claude Haiku 4.5）による参考判定です。最終判断は必ず運営者が行ってください。
      </p>
    </div>
  );
}
