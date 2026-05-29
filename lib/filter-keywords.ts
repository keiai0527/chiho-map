export type FilterCategory =
  | "hate" // 侮辱・罵詈雑言
  | "threat" // 脅迫・襲撃示唆
  | "crime_assertion" // 犯罪断定
  | "discrimination" // 差別・属性攻撃
  | "election_campaign" // 選挙運動誘導
  | "private_life" // 私生活・家族・住所等
  | "false_accusation" // 虚偽事実摘示
  | "harassment" // 嫌がらせ
  | "other";

export type FilterKeyword = {
  keyword: string;
  filterType: "hard_ban" | "pre_review";
  category: FilterCategory;
  notes?: string;
};

export const filterKeywords: FilterKeyword[] = [
  // ===== ハードバン（即拒否） =====
  // 脅迫系（最重要・即拒否）
  { keyword: "死ね", filterType: "hard_ban", category: "threat" },
  { keyword: "殺す", filterType: "hard_ban", category: "threat" },
  { keyword: "消えろ", filterType: "hard_ban", category: "threat" },
  { keyword: "襲う", filterType: "hard_ban", category: "threat" },
  { keyword: "燃やす", filterType: "hard_ban", category: "threat" },
  { keyword: "家に行く", filterType: "hard_ban", category: "threat" },
  { keyword: "事務所に行く", filterType: "hard_ban", category: "threat" },
  { keyword: "晒す", filterType: "hard_ban", category: "threat" },
  { keyword: "晒せ", filterType: "hard_ban", category: "threat" },
  { keyword: "住所を", filterType: "hard_ban", category: "threat" },
  // 死ね回避策
  { keyword: "氏ね", filterType: "hard_ban", category: "threat" },
  { keyword: "4ね", filterType: "hard_ban", category: "threat" },
  { keyword: "しね", filterType: "hard_ban", category: "threat" },

  // 侮辱系
  { keyword: "ゴミクズ", filterType: "hard_ban", category: "hate" },
  { keyword: "クズ", filterType: "hard_ban", category: "hate" },
  { keyword: "ゴミ野郎", filterType: "hard_ban", category: "hate" },
  { keyword: "屑", filterType: "hard_ban", category: "hate" },
  { keyword: "無能", filterType: "hard_ban", category: "hate" },
  { keyword: "低能", filterType: "hard_ban", category: "hate" },
  { keyword: "池沼", filterType: "hard_ban", category: "hate" },
  { keyword: "キチガイ", filterType: "hard_ban", category: "hate" },
  { keyword: "糞", filterType: "hard_ban", category: "hate" },
  { keyword: "クソ野郎", filterType: "hard_ban", category: "hate" },
  { keyword: "ボケ", filterType: "hard_ban", category: "hate" },
  { keyword: "カス", filterType: "hard_ban", category: "hate" },
  { keyword: "ハゲ", filterType: "hard_ban", category: "hate" },
  { keyword: "デブ", filterType: "hard_ban", category: "hate" },
  { keyword: "ブス", filterType: "hard_ban", category: "hate" },
  { keyword: "ブサイク", filterType: "hard_ban", category: "hate" },
  { keyword: "バカ野郎", filterType: "hard_ban", category: "hate" },
  { keyword: "アホ", filterType: "hard_ban", category: "hate" },
  { keyword: "老害", filterType: "hard_ban", category: "hate" },
  { keyword: "ks", filterType: "hard_ban", category: "hate" },

  // 犯罪断定系（断定的表現はハードバン、報道事実引用なら審査）
  { keyword: "犯罪者", filterType: "hard_ban", category: "crime_assertion" },
  { keyword: "詐欺師", filterType: "hard_ban", category: "crime_assertion" },
  { keyword: "泥棒", filterType: "hard_ban", category: "crime_assertion" },
  { keyword: "反社", filterType: "hard_ban", category: "crime_assertion" },
  { keyword: "ヤクザ", filterType: "hard_ban", category: "crime_assertion" },
  { keyword: "スパイ", filterType: "hard_ban", category: "crime_assertion" },
  { keyword: "売国奴", filterType: "hard_ban", category: "discrimination" },

  // 差別・属性攻撃系
  { keyword: "在日", filterType: "hard_ban", category: "discrimination" },
  { keyword: "Z日", filterType: "hard_ban", category: "discrimination" },
  { keyword: "朝鮮人", filterType: "hard_ban", category: "discrimination" },
  { keyword: "支那", filterType: "hard_ban", category: "discrimination" },

  // 選挙運動誘導系
  { keyword: "落選させ", filterType: "hard_ban", category: "election_campaign" },
  { keyword: "落とせ", filterType: "hard_ban", category: "election_campaign" },
  { keyword: "投票するな", filterType: "hard_ban", category: "election_campaign" },
  { keyword: "潰せ", filterType: "hard_ban", category: "election_campaign" },
  { keyword: "辞めさせろ", filterType: "hard_ban", category: "election_campaign" },
  { keyword: "拡散希望", filterType: "hard_ban", category: "election_campaign" },
  { keyword: "抗議に行", filterType: "hard_ban", category: "election_campaign" },
  { keyword: "凸しろ", filterType: "hard_ban", category: "election_campaign" },
  { keyword: "凸して", filterType: "hard_ban", category: "election_campaign" },

  // ===== プレビュー必須（運営者の事前審査） =====
  // 報道事実に基づく可能性のある語（断定でなければ審査で許可）
  { keyword: "犯罪", filterType: "pre_review", category: "false_accusation" },
  { keyword: "違法", filterType: "pre_review", category: "false_accusation" },
  { keyword: "贈収賄", filterType: "pre_review", category: "false_accusation" },
  { keyword: "汚職", filterType: "pre_review", category: "false_accusation" },
  { keyword: "買収", filterType: "pre_review", category: "false_accusation" },
  { keyword: "横領", filterType: "pre_review", category: "false_accusation" },
  { keyword: "脱税", filterType: "pre_review", category: "false_accusation" },
  { keyword: "強要", filterType: "pre_review", category: "false_accusation" },
  { keyword: "強姦", filterType: "pre_review", category: "false_accusation" },
  { keyword: "暴行", filterType: "pre_review", category: "false_accusation" },
  { keyword: "逮捕", filterType: "pre_review", category: "false_accusation" },
  { keyword: "起訴", filterType: "pre_review", category: "false_accusation" },
  { keyword: "疑惑", filterType: "pre_review", category: "false_accusation" },

  // 私生活・家族関連
  { keyword: "家族", filterType: "pre_review", category: "private_life" },
  { keyword: "妻", filterType: "pre_review", category: "private_life" },
  { keyword: "夫", filterType: "pre_review", category: "private_life" },
  { keyword: "子供", filterType: "pre_review", category: "private_life" },
  { keyword: "息子", filterType: "pre_review", category: "private_life" },
  { keyword: "娘", filterType: "pre_review", category: "private_life" },
  { keyword: "両親", filterType: "pre_review", category: "private_life" },
  { keyword: "父", filterType: "pre_review", category: "private_life" },
  { keyword: "母", filterType: "pre_review", category: "private_life" },
  { keyword: "兄弟", filterType: "pre_review", category: "private_life" },
  { keyword: "姉妹", filterType: "pre_review", category: "private_life" },

  // 個人情報
  { keyword: "自宅", filterType: "pre_review", category: "private_life" },
  { keyword: "出身地", filterType: "pre_review", category: "private_life" },
  { keyword: "出身校", filterType: "pre_review", category: "private_life" },
  { keyword: "本籍", filterType: "pre_review", category: "private_life" },

  // 健康・私的属性
  { keyword: "病気", filterType: "pre_review", category: "private_life" },
  { keyword: "入院", filterType: "pre_review", category: "private_life" },
  { keyword: "健康", filterType: "pre_review", category: "private_life" },
  { keyword: "精神的", filterType: "pre_review", category: "private_life" },
  { keyword: "依存", filterType: "pre_review", category: "private_life" },

  // 性的私生活（公務適格性論点になり得るためpre_review）
  { keyword: "不倫", filterType: "pre_review", category: "private_life", notes: "公務適格性に関わる場合がある" },
  { keyword: "浮気", filterType: "pre_review", category: "private_life" },
  { keyword: "愛人", filterType: "pre_review", category: "private_life" },
  { keyword: "隠し子", filterType: "pre_review", category: "private_life" },
];

export function getHardBanKeywords(): string[] {
  return filterKeywords
    .filter((k) => k.filterType === "hard_ban")
    .map((k) => k.keyword);
}

export function getPreReviewKeywords(): FilterKeyword[] {
  return filterKeywords.filter((k) => k.filterType === "pre_review");
}
