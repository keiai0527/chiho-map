import {
  filterKeywords,
  type FilterCategory,
} from "./filter-keywords";

// 議員名 × 機微キーワード組合せ判定（旧 `checkMemberCombo`）はサーバー側で実装する。
// クライアントから議員データセット（11MB）を引き込むのを避けるため、ここではプレレビューキーワードのみで判定する。

export type ModerationResult =
  | { status: "rejected"; reason: string; flags: ModerationFlag[] }
  | { status: "queued"; reason: string; flags: ModerationFlag[] }
  | { status: "published"; flags: [] };

export type ModerationFlag = {
  category: FilterCategory | "length" | "rate_limit" | "member_combo";
  matched: string;
  filterType: "hard_ban" | "pre_review" | "rule";
};

export const MIN_CONTENT_LENGTH = 100;
export const RATE_LIMIT_WINDOW_HOURS = 24;
export const RATE_LIMIT_MAX = 5;

export function checkLength(content: string): ModerationFlag | null {
  if (content.length < MIN_CONTENT_LENGTH) {
    return {
      category: "length",
      matched: `${content.length}文字`,
      filterType: "rule",
    };
  }
  return null;
}

export function checkHardBan(content: string): ModerationFlag[] {
  const flags: ModerationFlag[] = [];
  for (const kw of filterKeywords) {
    if (kw.filterType !== "hard_ban") continue;
    if (content.includes(kw.keyword)) {
      flags.push({
        category: kw.category,
        matched: kw.keyword,
        filterType: "hard_ban",
      });
    }
  }
  return flags;
}

export function checkPreReview(content: string): ModerationFlag[] {
  const flags: ModerationFlag[] = [];
  for (const kw of filterKeywords) {
    if (kw.filterType !== "pre_review") continue;
    if (content.includes(kw.keyword)) {
      flags.push({
        category: kw.category,
        matched: kw.keyword,
        filterType: "pre_review",
      });
    }
  }
  return flags;
}

export function moderateContent(content: string): ModerationResult {
  // 1. 文字数
  const lenFlag = checkLength(content);
  if (lenFlag) {
    return {
      status: "rejected",
      reason: "投稿は100文字以上でお願いします",
      flags: [lenFlag],
    };
  }

  // 2. ハードバン
  const hardBan = checkHardBan(content);
  if (hardBan.length > 0) {
    return {
      status: "rejected",
      reason:
        "投稿内容にガイドライン違反の表現が含まれている可能性があります。表現を修正してください",
      flags: hardBan,
    };
  }

  // 3. プレビュー必須キーワード（議員名×機微表現の組合せ判定はサーバー側で実装予定）
  const preReview = checkPreReview(content);
  if (preReview.length > 0) {
    return {
      status: "queued",
      reason: "投稿を受け付けました。内容確認の上、72時間以内に公開判断します",
      flags: preReview,
    };
  }

  // 4. 全クリア
  return { status: "published", flags: [] };
}

export function describeFlag(flag: ModerationFlag): string {
  const categoryLabel: Record<string, string> = {
    hate: "ヘイト・罵詈雑言",
    private_life: "私生活への言及",
    false_accusation: "犯罪・虚偽事実摘示の疑い",
    harassment: "嫌がらせ",
    other: "その他",
    length: "文字数不足",
    rate_limit: "レート制限",
    member_combo: "議員名×機微表現の組合せ",
  };
  return `${categoryLabel[flag.category] ?? flag.category}：「${flag.matched}」`;
}
