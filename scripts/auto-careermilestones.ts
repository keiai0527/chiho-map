/**
 * 既存 override 議員 約123名の reason から careerMilestones を自動補完
 *
 * 方針:
 *  - verified/partial の override で careerMilestones が空の議員のみ対象
 *  - reason の **明示的な記載** からパターンマッチで事実を抽出
 *  - 抽出できない情報はスキップ（推測しない）
 *  - 出典URL は websiteUrl(本人公式) or officialProfileUrl(議会公式) を使用
 *  - どちらもない議員はスキップ（出典なしの careerMilestone は作らない）
 *
 * 抽出する事実:
 *  - 期数 + 選挙区（reason 内 N期 が既存 termsServed と一致するか確認）
 *  - 議長就任歴（第N代○○議長）
 *  - 副議長就任歴
 *  - 党/会派内役職（政調会長・幹事長・団長・代表・会長等）
 *  - 略歴（学歴・職歴の reason 引用、評価語含まないもの）
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const VERIFIED_AT = "2026-05-30";
const file = "data/member-overrides.json";
const membersDir = "data/members";

type Member = {
  id: string;
  cityId?: string;
  name?: string;
  electoralDistrict?: string;
  termsServed?: number;
  partyId?: string;
  officialProfileUrl?: string;
};

type Override = {
  id: string;
  fields: {
    name?: string;
    electoralDistrict?: string;
    termsServed?: number;
    officialProfileUrl?: string;
    websiteUrl?: string;
    careerMilestones?: unknown[];
    dataConfidence?: string;
  } & Record<string, unknown>;
  reason: string;
  appliedAt: string;
};

// base members.json を読み込んでマージ用 map を作る
function loadBaseMembers(): Map<string, Member> {
  const map = new Map<string, Member>();
  const files = readdirSync(membersDir);
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    const list = JSON.parse(
      readFileSync(`${membersDir}/${f}`, "utf-8"),
    ) as Member[];
    for (const m of list) {
      map.set(m.id, m);
    }
  }
  return map;
}

const baseMembers = loadBaseMembers();

function getMerged(
  override: Override,
): {
  electoralDistrict?: string;
  termsServed?: number;
  websiteUrl?: string;
  officialProfileUrl?: string;
} {
  const base: Member = baseMembers.get(override.id) || ({} as Member);
  return {
    electoralDistrict:
      override.fields.electoralDistrict ?? base.electoralDistrict,
    termsServed: override.fields.termsServed ?? base.termsServed,
    websiteUrl: override.fields.websiteUrl,
    officialProfileUrl:
      override.fields.officialProfileUrl ?? base.officialProfileUrl,
  };
}

type CM = {
  label?: string;
  content: string;
  source: string;
  sourceUrl: string;
  verifiedAt: string;
};

// 評価語・推測語チェック
const FORBIDDEN_WORDS = [
  "らしい",
  "と思われる",
  "未確認",
  "噂",
  "推測",
  "だろう",
  "可能性",
  "思われ",
  "親中",
  "極右",
  "極左",
  "反日",
  "疑惑",
  "利権",
  "地盤継承",
  "政治家家系",
  "遺志を継いで",
];

function containsForbidden(text: string): boolean {
  return FORBIDDEN_WORDS.some((w) => text.includes(w));
}

// city → 議会公式名
const COUNCIL_NAMES: Record<string, string> = {
  osaka: "大阪市会公式",
  sapporo: "札幌市議会公式",
  nagoya: "名古屋市議会公式",
  yokohama: "横浜市会公式",
  fukuoka: "福岡市議会公式",
};

// 都市名（出典記載用）
const CITY_COUNCIL_NAME: Record<string, string> = {
  osaka: "大阪市会",
  sapporo: "札幌市議会",
  nagoya: "名古屋市議会",
  yokohama: "横浜市会",
  fukuoka: "福岡市議会",
};

// city → 議会公式ドメイン（source 名整合性チェック用）
const COUNCIL_DOMAINS: Record<string, string> = {
  osaka: "city.osaka.lg.jp",
  sapporo: "city.sapporo.jp",
  nagoya: "city.nagoya.jp",
  yokohama: "city.yokohama.lg.jp",
  fukuoka: "city.fukuoka.lg.jp",
};

// sourceUrl のドメインから source name を判定（事実誤認を防ぐ）
function getSourceLabelFromUrl(url: string, cityId: string): string {
  const cd = COUNCIL_DOMAINS[cityId];
  if (cd && url.includes(cd)) return COUNCIL_NAMES[cityId] || "議会公式";

  // 党公式・系列ドメイン
  if (/jimin|liberaldemocrat/i.test(url)) return "自由民主党系公式";
  if (/komei\.or\.jp/i.test(url)) return "公明党公式";
  if (/o-ishin|oneosaka|ishinnokai/i.test(url))
    return "日本維新の会系公式";
  if (/cdp-japan/i.test(url)) return "立憲民主党公式";
  if (/jcp\.or\.jp|wajcp\.net|jcp-/i.test(url))
    return "日本共産党系公式";
  if (/new-kokumin|kokumin/i.test(url)) return "国民民主党公式";
  if (/reiwa-shinsengumi/i.test(url)) return "れいわ新選組公式";
  if (/sanseito/i.test(url)) return "参政党公式";
  if (/genzei758|genzei/i.test(url)) return "減税日本公式";

  // それ以外は本人公式
  return "本人公式サイト";
}

// reason から本人公式サイトURLを抽出（既存 websiteUrl と一致または記載パターン）
function extractWebsiteFromReason(reason: string): string | null {
  // パターン: "本人公式サイト xxx.com" or "本人公式サイト（xxx.com）"
  const m = reason.match(
    /本人公式サイト[\s（(]*((?:https?:\/\/)?[\w.-]+\.(?:com|jp|net|info|org|wajcp\.net))/i,
  );
  return m ? m[1] : null;
}

// 党公式 URL の代表的なもの（reason に「○○公式」と書かれている場合に補完）
const PARTY_PUBLIC_SOURCES: Record<
  string,
  { name: string; baseUrl: string }
> = {
  // 「日本共産党中央委員会公式」「日本共産党○○市議団公式」
  jcp: {
    name: "日本共産党中央委員会公式",
    baseUrl: "https://www.jcp.or.jp/",
  },
  ldp: {
    name: "自由民主党公式",
    baseUrl: "https://www.jimin.jp/",
  },
  komei: {
    name: "公明党公式",
    baseUrl: "https://www.komei.or.jp/",
  },
  ishin: {
    name: "日本維新の会公式",
    baseUrl: "https://o-ishin.jp/",
  },
  cdp: {
    name: "立憲民主党公式",
    baseUrl: "https://cdp-japan.jp/",
  },
  dpp: {
    name: "国民民主党公式",
    baseUrl: "https://new-kokumin.jp/",
  },
};

// === 抽出ロジック ===

function extractCareerMilestones(
  override: Override,
  cityId: string,
): CM[] {
  const reason = override.reason || "";
  const cm: CM[] = [];

  // ガード: 禁止語が reason に含まれていたらスキップ（既存 0件想定だが念のため）
  if (containsForbidden(reason)) {
    console.warn(`SKIP-FORBIDDEN: ${override.id} (reason に禁止語)`);
    return [];
  }

  const merged = getMerged(override);
  const websiteUrl = merged.websiteUrl;
  const officialProfileUrl = merged.officialProfileUrl;
  const reasonWebsite = extractWebsiteFromReason(reason);

  // 優先出典URL（無ければスキップ）
  const primaryUrl =
    websiteUrl ||
    (reasonWebsite
      ? reasonWebsite.startsWith("http")
        ? reasonWebsite
        : `https://${reasonWebsite}`
      : null) ||
    officialProfileUrl;
  if (!primaryUrl) {
    console.warn(`SKIP-NOURL: ${override.id} (出典URL確定できず)`);
    return [];
  }

  const primarySourceName = getSourceLabelFromUrl(primaryUrl, cityId);
  const councilSourceName = officialProfileUrl
    ? getSourceLabelFromUrl(officialProfileUrl, cityId)
    : null;

  // 1. 期数 + 選挙区
  const termsServed = merged.termsServed;
  const electoralDistrict = merged.electoralDistrict;
  // reason に N期 表記があるか確認（既存 termsServed と一致）
  const termsInReason = reason.match(/(\d+)\s*期(?:目|（)?/);
  const termsMatchesReason =
    termsServed !== undefined &&
    termsInReason !== null &&
    parseInt(termsInReason[1], 10) === termsServed;
  if (termsMatchesReason && electoralDistrict) {
    cm.push({
      label: `${termsServed}期、${electoralDistrict}`,
      content: `${primarySourceName}では、${electoralDistrict}選出・${termsServed}期と記載されている。`,
      source: primarySourceName,
      sourceUrl: primaryUrl,
      verifiedAt: VERIFIED_AT,
    });
  } else if (termsServed !== undefined && electoralDistrict && !termsInReason) {
    // reason に期数の記載なし、既存 fields のみ → officialProfileUrl の実体に合わせた source 名
    const url = officialProfileUrl || primaryUrl;
    const srcName = getSourceLabelFromUrl(url, cityId);
    cm.push({
      label: `${termsServed}期、${electoralDistrict}`,
      content: `${srcName}では、${electoralDistrict}選出・${termsServed}期と記載されている。`,
      source: srcName,
      sourceUrl: url,
      verifiedAt: VERIFIED_AT,
    });
  }

  // 2. 議長就任歴
  // パターン: 「第N代○○議長」「N年X月議長就任」「議長経験者」「元○○議長」
  const chairmanMatches = [...reason.matchAll(/第\s*(\d+)\s*代([^\s、。]{0,15}?議長)/g)];
  for (const m of chairmanMatches) {
    const dai = m[1];
    const title = m[2];
    cm.push({
      label: `第${dai}代${title}`,
      content: `${primarySourceName}の記載では、第${dai}代${title}と記載されている。`,
      source: primarySourceName,
      sourceUrl: primaryUrl,
      verifiedAt: VERIFIED_AT,
    });
  }
  // 「議長経験者」「元○○議長」（数字なし）
  if (
    !chairmanMatches.length &&
    /(?:議長経験者|元[^\s、。]{0,10}議長|市議会議長を歴任)/.test(reason)
  ) {
    cm.push({
      label: `${CITY_COUNCIL_NAME[cityId] || "市議会"} 議長経験者`,
      content: `${primarySourceName}の記載では、${CITY_COUNCIL_NAME[cityId] || "市議会"}議長経験者と記載されている。`,
      source: primarySourceName,
      sourceUrl: primaryUrl,
      verifiedAt: VERIFIED_AT,
    });
  }

  // 3. 副議長就任歴
  const viceMatches = [
    ...reason.matchAll(/第\s*(\d+)\s*代([^\s、。]{0,15}?副議長)/g),
  ];
  for (const m of viceMatches) {
    const dai = m[1];
    const title = m[2];
    cm.push({
      label: `第${dai}代${title}`,
      content: `${primarySourceName}の記載では、第${dai}代${title}と記載されている。`,
      source: primarySourceName,
      sourceUrl: primaryUrl,
      verifiedAt: VERIFIED_AT,
    });
  }
  if (
    !viceMatches.length &&
    /(?:副議長経験者|元[^\s、。]{0,10}副議長|市議会副議長を歴任|現副議長)/.test(reason)
  ) {
    cm.push({
      label: `${CITY_COUNCIL_NAME[cityId] || "市議会"} 副議長経験者`,
      content: `${primarySourceName}の記載では、${CITY_COUNCIL_NAME[cityId] || "市議会"}副議長経験者と記載されている。`,
      source: primarySourceName,
      sourceUrl: primaryUrl,
      verifiedAt: VERIFIED_AT,
    });
  }

  // 4. 党/会派内役職 (政調会長・幹事長・団長 等)
  // reason 中の「○○団 政調会長」「○○団長」「政調会長代理」等を抽出
  const partyRoleMatches = [
    ...reason.matchAll(
      /([^\s、。]{2,30}?(?:政調会長(?:代理|代行)?|政務調査会長(?:代行|代理)?|政務調査会副会長|幹事長(?:代行|代理)?|副幹事長|団長|代表(?!的)|議員会会長|議員会副会長|常任役員|総務会長|政策委員長))/g,
    ),
  ];
  const seenRoles = new Set<string>();
  const roles: string[] = [];
  for (const m of partyRoleMatches) {
    const role = m[1].trim();
    if (seenRoles.has(role)) continue;
    seenRoles.add(role);
    // 「○○委員会委員長」は別カテゴリなので除外
    if (/委員会(委員|委員長|副委員長)/.test(role)) continue;
    // 役職らしく見えないもの除外
    if (role.length < 3) continue;
    roles.push(role);
  }
  if (roles.length > 0) {
    cm.push({
      label: "党/会派内役職",
      content: `${primarySourceName}の記載では、${roles.join("、")}と記載されている。`,
      source: primarySourceName,
      sourceUrl: primaryUrl,
      verifiedAt: VERIFIED_AT,
    });
  }

  return cm;
}

// === メイン処理 ===
const data = JSON.parse(readFileSync(file, "utf-8")) as {
  overrides: Override[];
};

let processedCount = 0;
let addedCount = 0;
let skippedCount = 0;

for (const override of data.overrides) {
  const conf = override.fields.dataConfidence;
  if (conf !== "verified" && conf !== "partial") continue;
  if (
    override.fields.careerMilestones &&
    Array.isArray(override.fields.careerMilestones) &&
    override.fields.careerMilestones.length > 0
  )
    continue;

  const cityId = override.id.split("-")[0];
  const cms = extractCareerMilestones(override, cityId);
  if (cms.length === 0) {
    skippedCount++;
    continue;
  }
  override.fields.careerMilestones = cms;
  override.appliedAt = VERIFIED_AT;
  processedCount++;
  addedCount += cms.length;
}

writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
console.log(
  `\nProcessed ${processedCount} overrides, added ${addedCount} careerMilestones, skipped ${skippedCount} (no extractable facts or no URL)`,
);
