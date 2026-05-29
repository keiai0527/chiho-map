/**
 * 地方議員マップ 型定義
 *
 * 重要: partyId（政党）と parliamentaryGroupId（会派）は別フィールド。
 * 公式名簿の「政党」列は実は会派を指していることが多いので、最初から分離する。
 */

export type CityId =
  | "osaka"
  | "nagoya"
  | "yokohama"
  | "fukuoka"
  | "sapporo";

export type PartyId =
  | "ldp" // 自由民主党
  | "cdp" // 立憲民主党
  | "dpp" // 国民民主党
  | "ishin" // 日本維新の会
  | "komei" // 公明党
  | "jcp" // 日本共産党
  | "reiwa" // れいわ新選組
  | "sansei" // 参政党
  | "sdp" // 社会民主党
  | "nhk" // NHKから国民を守る党系
  | "genzei" // 減税日本（名古屋ローカル）
  | "regional" // その他地域政党
  | "independent"; // 無所属

export interface Party {
  id: PartyId;
  name: string;
  shortName: string;
  color: string; // Tailwindに合うhex
}

/**
 * 会派（市議会内の議員グループ）
 * 政党とは別物。例: 大阪市会の「自民市民」は自民党+市民クラブの合同会派
 */
export interface ParliamentaryGroup {
  id: string; // 例: "osaka-ishin", "nagoya-genzei"
  cityId: CityId;
  name: string;
  shortName: string;
  /** この会派を構成する政党（複数あり得る） */
  partyIds: PartyId[];
}

/**
 * データの信頼度
 * - verified: 公式情報と照合済、本人発信等で確認済
 * - partial: 一部のフィールドが暫定（混合会派の partyId、推定ふりがな等）
 * - estimated: 多くが推定（β初版段階）
 */
export type DataConfidence = "verified" | "partial" | "estimated";

/**
 * 議員の主張・政策の一項目（本人発信ベース）
 * 偏向回避のため、出典URL必須・本人の公式発信から引用または要約のみ
 */
export interface PolicyItem {
  /** カテゴリ（例: "教育・子育て", "防災", "産業"） */
  category: string;
  /** 短いタイトル（例: "保育所増設", "地下鉄延伸"） */
  title: string;
  /** 主張・政策の説明（本人発信からの要約、運営者の評価は含めない） */
  description: string;
  /** 出典URL（本人公式・市議会議事録・党公式等） */
  sourceUrl?: string;
}

/**
 * 注目発言・実績の記録
 * 議事録引用や本人発信からの抜粋。出典必須。
 */
export interface NotableQuote {
  /** 発言日・実績の日付（ISO date or 「2024-03-15」） */
  date: string;
  /** 発言内容または実績（出典通りに引用 or 要約） */
  content: string;
  /** 出典タイプ（例: "市議会本会議質問", "本人ブログ", "X投稿"） */
  source: string;
  /** 出典URL */
  sourceUrl?: string;
  /** 補足コンテクスト（任意） */
  context?: string;
}

export interface Member {
  /** 一意ID: `${cityId}-${slug}` 例: "osaka-yamada-taro" */
  id: string;
  cityId: CityId;
  name: string;
  nameKana?: string;
  /** 政党所属（無所属なら "independent"） */
  partyId: PartyId;
  /** 所属会派ID（必ず存在。会派に所属しない議員は cityId + "-independent" などのダミー会派） */
  parliamentaryGroupId: string;
  /** 選挙区（市議会の場合は「区」が選挙区になることが多い） */
  electoralDistrict: string;
  /** 当選回数 */
  termsServed?: number;
  photoUrl?: string;

  // ── 公式リンク（追加予定枠を含む）──
  /** 市議会公式の議員プロフィールページURL */
  officialProfileUrl?: string;
  /** 議員個人サイト/事務所サイト */
  websiteUrl?: string;
  /** X (Twitter) URL */
  twitterUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;

  // ── 活動・政策（追加予定枠）──
  /** 所属委員会名（公式情報から取得） */
  committees?: string[];
  /** 過去の発言・質問記録の入口URL（市議会公式の議事録検索等） */
  speechRecordUrl?: string;
  /** 議案賛否記録URL（将来枠：市議会公式の本会議採決結果等） */
  voteRecordUrl?: string;
  /** 政策タグ（運営者が公式発言から付与する分類） */
  policyTags?: string[];

  // ── プロフィール・経歴 ──
  /** 生年月日（ISO date or 「1972-08-15」形式） */
  birthDate?: string;
  /** 出身地（例: 「大阪府大阪市」「北海道札幌市東区」） */
  birthPlace?: string;
  /** 学歴リスト（時系列降順 or 最終学歴のみ） */
  education?: string[];
  /** 職歴リスト（議員以前の主要キャリア） */
  career?: string[];
  /** 経歴・略歴の自然文（150〜500字程度、出典のある事実のみ） */
  biography?: string;

  // ── 主張・政策（深掘り） ──
  /** 主要政策・主張のリスト（本人発信に基づく） */
  keyPolicies?: PolicyItem[];

  // ── 発言・実績 ──
  /** 注目発言・本会議質問・実績の記録（出典必須） */
  notableQuotes?: NotableQuote[];

  // ── データ品質（追加予定枠）──
  /** データ信頼度 */
  dataConfidence?: DataConfidence;
  /** 暫定情報を含むかのフラグ（合同会派の partyId、推定ふりがな等） */
  hasProvisionalData?: boolean;
  /** 最終確認日（ISO date）。空なら未確認 */
  lastVerifiedAt?: string;

  /** データ取得元と取得日 */
  source: {
    url: string;
    fetchedAt: string; // ISO date
  };
}

/**
 * 手動補正: スクレイピングで上書きされない議員データ補正
 * 国会議員マップで効いている仕組みを最初から導入
 */
export interface MemberOverride {
  id: string; // Member.id
  fields: Partial<Omit<Member, "id" | "cityId">>;
  reason: string;
  appliedAt: string; // ISO date
}
