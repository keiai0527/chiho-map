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
  officialProfileUrl?: string;
  /** 議員個人サイト/SNS */
  websiteUrl?: string;
  twitterUrl?: string;
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
