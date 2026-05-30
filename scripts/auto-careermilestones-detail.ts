/**
 * reason から「初当選年・学歴・職歴・特別委員会役職」を追加抽出して careerMilestones に追加
 *
 * 既に careerMilestones にある label はスキップ（重複防止）。
 * 出典URLは reason 内の URL or 既存 fields の websiteUrl/officialProfileUrl。
 * 推測ゼロ・抽出できない情報はスキップ。
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const VERIFIED_AT = "2026-05-30";
const file = "data/member-overrides.json";
const membersDir = "data/members";

type Member = {
  id: string;
  cityId: string;
  officialProfileUrl?: string;
};

type CM = {
  label?: string;
  content: string;
  source: string;
  sourceUrl: string;
  verifiedAt: string;
};

type Override = {
  id: string;
  fields: {
    careerMilestones?: CM[];
    officialProfileUrl?: string;
    websiteUrl?: string;
    dataConfidence?: string;
  } & Record<string, unknown>;
  reason: string;
  appliedAt: string;
};

// base members から officialProfileUrl 取得
function loadBaseMembers(): Map<string, Member> {
  const map = new Map<string, Member>();
  for (const f of readdirSync(membersDir)) {
    if (!f.endsWith(".json")) continue;
    const list = JSON.parse(
      readFileSync(`${membersDir}/${f}`, "utf-8"),
    ) as Member[];
    for (const m of list) map.set(m.id, m);
  }
  return map;
}

const baseMembers = loadBaseMembers();

function getSourceLabelFromUrl(url: string, cityId: string): string {
  const cd: Record<string, string> = {
    osaka: "city.osaka.lg.jp",
    sapporo: "city.sapporo.jp",
    nagoya: "city.nagoya.jp",
    yokohama: "city.yokohama.lg.jp",
    fukuoka: "city.fukuoka.lg.jp",
  };
  if (cd[cityId] && url.includes(cd[cityId])) return `${cityCouncilName(cityId)}公式`;
  if (/jimin|liberaldemocrat/i.test(url)) return "自由民主党系公式";
  if (/komei\.or\.jp|komei\.news/i.test(url)) return "公明党公式";
  if (/o-ishin|oneosaka|ishinnokai/i.test(url)) return "日本維新の会系公式";
  if (/cdp-japan/i.test(url)) return "立憲民主党公式";
  if (/jcp\.or\.jp|wajcp\.net|jcp-/i.test(url)) return "日本共産党系公式";
  if (/new-kokumin|kokumin/i.test(url)) return "国民民主党公式";
  if (/reiwa-shinsengumi/i.test(url)) return "れいわ新選組公式";
  if (/sanseito/i.test(url)) return "参政党公式";
  if (/genzei758|genzei/i.test(url)) return "減税日本公式";
  return "本人公式サイト";
}

function cityCouncilName(cityId: string): string {
  return {
    osaka: "大阪市会",
    sapporo: "札幌市議会",
    nagoya: "名古屋市会",
    yokohama: "横浜市会",
    fukuoka: "福岡市議会",
  }[cityId] || "市議会";
}

function getPrimaryUrl(override: Override): string | null {
  return (
    override.fields.websiteUrl ||
    override.fields.officialProfileUrl ||
    baseMembers.get(override.id)?.officialProfileUrl ||
    null
  );
}

// reason の禁止語チェック（家族・評価語は抽出対象外）
const FORBIDDEN_PATTERNS = [
  /父・/, /祖父・/, /母・/, /兄・/, /弟・/, /妹・/, /家系/, /地盤継承/, /遺志/,
  /らしい/, /と思われる/, /未確認/, /推測/, /疑惑/, /利権/,
];

function isForbidden(text: string): boolean {
  return FORBIDDEN_PATTERNS.some((p) => p.test(text));
}

// === 抽出ロジック ===

type Extract = { label: string; content: string };

function extractFromReason(reason: string, cityId: string): Extract[] {
  const out: Extract[] = [];

  // 1. 初当選年
  const electedMatch = reason.match(/(\d{4})年(?:(\d{1,2})月)?(?:補欠選挙(?:で)?)?(?:初当選|初選出|当選)/);
  if (electedMatch) {
    const year = electedMatch[1];
    const month = electedMatch[2];
    const isHoketsu = /補欠選挙/.test(reason.slice(reason.indexOf(electedMatch[0])));
    const monthPart = month ? `${month}月` : "";
    const hoketsuPart = isHoketsu ? "（補欠選挙）" : "";
    out.push({
      label: `${year}年初当選${hoketsuPart}`,
      content: `${year}年${monthPart}に初当選${hoketsuPart}したと記載されている。`,
    });
  }

  // 2. 学歴: "○○大学 + 学部 + 卒|院修了|中退"
  const eduMatches = [
    ...reason.matchAll(
      /([一-龥ァ-ヶー]{2,15}(?:大学|大学院|高校|高等学校|学校))(?:[一-龥ァ-ヶー]{2,15}(?:学部|学科|研究科|科))?(?:[一-龥ァ-ヶー]{2,15}(?:専攻|専修|コース))?\s*([卒中院]?(?:卒(?:業)?|院修了|中退|修了))/g,
    ),
  ];
  const eduParts: string[] = [];
  for (const m of eduMatches) {
    const part = (m[1] + (m[0].replace(m[1], "").replace(m[2], "")) + m[2]).replace(/\s/g, "");
    if (!eduParts.includes(part) && part.length < 40 && !isForbidden(part)) {
      eduParts.push(part);
    }
  }
  if (eduParts.length > 0) {
    out.push({
      label: "学歴",
      content: `${eduParts.join("、")}と記載されている。`,
    });
  }

  // 3. 職歴: "元 + ○○" / "現 + ○○"（職業の場合のみ）
  const careerMatches = [
    ...reason.matchAll(
      /(元|現)([一-龥ァ-ヶーA-Za-z0-9（）()・]{2,40}?(?:勤務|職員|社員|秘書|代表|代表取締役|理事|取締役|社長|会長|教諭|教員|研究員|医師|弁護士|司法書士|行政書士|公認会計士|税理士|アナリスト|マネージャー|ファンドマネージャー|ディレクター|プロデューサー|プロ|官|事務官))/g,
    ),
  ];
  const careerParts: string[] = [];
  for (const m of careerMatches) {
    const part = (m[1] + m[2]).replace(/[\s（）()]/g, "");
    if (!careerParts.includes(part) && part.length < 50 && !isForbidden(part)) {
      careerParts.push(part);
    }
  }
  if (careerParts.length > 0) {
    out.push({
      label: "職歴",
      content: `${careerParts.join("、")}と記載されている。`,
    });
  }

  // 4. 特別委員会役職: "○○特別委員会委員長|副委員長"
  const specialMatches = [
    ...reason.matchAll(
      /([一-龥ァ-ヶー・A-Za-z0-9]{2,30}?特別委員会)(?:委員長|副委員長)/g,
    ),
  ];
  for (const m of specialMatches) {
    const fullRole = m[0];
    const committee = m[1];
    const role = fullRole.endsWith("副委員長") ? "副委員長" : "委員長";
    out.push({
      label: `${committee} ${role}`,
      content: `${committee}の${role}として記載されている。`,
    });
  }

  return out;
}

// === メイン ===
const data = JSON.parse(readFileSync(file, "utf-8")) as { overrides: Override[] };

let touched = 0;
let added = 0;
let skipped = 0;

for (const override of data.overrides) {
  const conf = override.fields.dataConfidence;
  if (conf !== "verified" && conf !== "partial") continue;
  if (!override.reason || isForbidden(override.reason)) {
    skipped++;
    continue;
  }
  const cityId = override.id.split("-")[0];
  const url = getPrimaryUrl(override);
  if (!url) {
    skipped++;
    continue;
  }
  const sourceName = getSourceLabelFromUrl(url, cityId);

  const extracts = extractFromReason(override.reason, cityId);
  if (extracts.length === 0) continue;

  const existing = override.fields.careerMilestones || [];
  const existingLabels = new Set(existing.map((cm) => cm.label));

  let localAdded = 0;
  for (const ex of extracts) {
    if (existingLabels.has(ex.label)) continue;
    if (isForbidden(ex.content)) continue;
    existing.push({
      label: ex.label,
      content: `${sourceName}では、${ex.content}`,
      source: sourceName,
      sourceUrl: url,
      verifiedAt: VERIFIED_AT,
    });
    existingLabels.add(ex.label);
    localAdded++;
    added++;
  }
  if (localAdded > 0) {
    override.fields.careerMilestones = existing;
    override.appliedAt = VERIFIED_AT;
    touched++;
  }
}

writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
console.log(`\nTouched ${touched} overrides, added ${added} careerMilestones (skipped ${skipped} no URL/forbidden)`);
