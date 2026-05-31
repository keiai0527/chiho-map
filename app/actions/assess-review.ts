"use server";

import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { getAllReviews } from "@/lib/server-store";
import { getMemberById, getPartyMap, getCity } from "@/lib/data";
import { requireAdminAuth } from "@/lib/auth";

const GUIDELINES = `あなたは「地方議員マップ」というサイトの口コミ投稿の事前審査を、運営者の補助として行う AI です。
このサイトは政令指定都市の市議会議員を、会派・政策・公開活動から多面的に比較する中立サイトです。
口コミは「公人としての職務（議会発言、政策、公開活動、事務所対応など）への評価」のみ受け付け、私生活への言及は禁止されています。

【絶対に却下すべきもの（E: 即非公開）】
- 私生活への言及（家族・配偶者・子供・恋愛関係など）
- 事実無根の犯罪・スキャンダル断定（「犯罪者だ」「逮捕されるべき」など、根拠なしの断定）
- 差別的表現（出自・国籍・宗教・人種・障害・性別等への差別）
- ヘイトスピーチ、誹謗中傷、脅迫
- 個人情報の暴露（住所・電話番号・家族情報など）
- スパム・宣伝・無関係な投稿、同文反復
- 帰化・国籍・出自を理由にした評価（サイト方針で扱わない領域）

【非公開推奨（D）】
- 強い人格攻撃（職務評価を装っているが、実質的に侮辱）
- 「利権」「癒着」「公金不正」など重大な疑惑を、証拠なく断定的に主張

【要修正（C）】
- 断定的表現が多いが、公人の職務範囲内の批評の可能性があるもの
- 根拠の薄い疑惑だが、グレーゾーンで運営者判断が必要なもの
- 主観が強すぎて表現を和らげるべきもの

【軽微な注意あり、公開可（B）】
- 強い批判だが、事実ベースで職務評価として読める
- 多少感情的だが、公人の活動への意見として成立している

【そのまま公開可（A）】
- 事実ベースの政策評価、議会発言の評価
- 公約と実態の乖離の指摘（事実根拠あり）
- 「期待している」「応援している」などの好意的コメント
- 強い批判でも、職務に関する事実ベース

リスク分類は以下から該当するものを全て選ぶ（複数可）:
- 名誉毀損リスク
- 侮辱表現
- 犯罪・違法行為の断定
- 根拠不明の疑惑
- 出自・国籍・宗教・家族への言及
- 個人情報
- 差別的表現
- 選挙法・政治資金関連リスク
- スパム・同文反復
- 意味不明・文章不成立

危険語ハイライトは、投稿本文内に出現する危険な語句を抜き出して、なぜ危険なのかを短く添える。
出現しない場合は空配列でよい。

AI修正文案は、軽微〜中程度の問題なら原文を生かして修正した文案を 100〜400 文字で示す。
重大な問題（E）の場合は空文字でよい。

推奨対応は、運営者がワンクリックで実行できる対応を1文で示す。例:
「そのまま公開してください」「修正版で公開してください」「却下を推奨します」「投稿者に修正依頼を送ってください」

判断理由は中立的に、口コミの具体的な部分を引用しながら 2〜4文で簡潔に。`;

const AssessmentSchema = z.object({
  grade: z.enum(["A", "B", "C", "D", "E"]).describe("5段階の総合判定"),
  reason: z.string().describe("判断理由（2〜4文）"),
  riskCategories: z.array(z.string()).describe("リスク分類（複数可、なければ空配列）"),
  dangerousPhrases: z.array(z.object({
    phrase: z.string().describe("本文内の該当語句"),
    why: z.string().describe("なぜ危険か（短く）"),
  })).describe("危険語ハイライト（なければ空配列）"),
  suggestedFix: z.string().describe("AI修正文案（不要なら空文字）"),
  recommendedAction: z.string().describe("推奨対応（1文）"),
});

export type ReviewAssessment = z.infer<typeof AssessmentSchema>;

export async function assessReview(reviewId: string): Promise<ReviewAssessment> {
  await requireAdminAuth();

  const allReviews = await getAllReviews();
  const review = allReviews.find((r) => r.id === reviewId);
  if (!review) throw new Error("review not found");

  const member = await getMemberById(review.memberId);
  const partyMap = await getPartyMap();
  const party = member ? partyMap.get(member.partyId) : null;
  const city = member ? await getCity(member.cityId) : null;
  const memberLabel = member
    ? `${member.name}（${party?.name ?? member.partyId} / ${city?.name ?? member.cityId} / ${member.electoralDistrict ?? ""}）`
    : `（議員不明: ${review.memberId}）`;

  const userPrompt = `次の口コミを審査してください。

【投稿対象議員】
${memberLabel}

【投稿内容】
評価: ${review.rating} / 5
カテゴリ: ${review.caseType}
本文:
${review.content}

【自動検出フラグ（参考）】
${review.flags && review.flags.length > 0 ? review.flags.map((f) => `${f.category}:${f.matched}`).join(", ") : "なし"}

このサイトの方針を踏まえて、5段階（A〜E）で判定してください。`;

  const client = new Anthropic();

  const response = await client.messages.parse({
    model: "claude-haiku-4-5",
    max_tokens: 2048,
    system: GUIDELINES,
    messages: [{ role: "user", content: userPrompt }],
    output_config: {
      format: zodOutputFormat(AssessmentSchema),
    },
  });

  if (!response.parsed_output) {
    throw new Error("AI 判定の解析に失敗しました");
  }

  return response.parsed_output;
}
