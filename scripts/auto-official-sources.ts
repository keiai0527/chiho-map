/**
 * 全 override 議員に officialSources を自動構成
 *
 * 既存の officialProfileUrl と websiteUrl から OfficialSource[] を生成。
 * - officialProfileUrl: ドメインで kind を判定（議会公式 or 党公式 or 個人）
 * - websiteUrl: personal_official（本人公式）
 * - kind / label / url / verifiedAt 必須
 *
 * verified/partial の override のみ対象。
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const VERIFIED_AT = "2026-05-30";
const file = "data/member-overrides.json";
const membersDir = "data/members";

type Member = {
  id: string;
  officialProfileUrl?: string;
};

type OS = {
  kind:
    | "council_official"
    | "party_official"
    | "election_committee"
    | "personal_official"
    | "government_official";
  label: string;
  url: string;
  verifiedAt: string;
};

const COUNCIL_DOMAINS: Record<string, string> = {
  osaka: "city.osaka.lg.jp",
  sapporo: "city.sapporo.jp",
  nagoya: "city.nagoya.jp",
  yokohama: "city.yokohama.lg.jp",
  fukuoka: "city.fukuoka.lg.jp",
};

const COUNCIL_LABELS: Record<string, string> = {
  osaka: "大阪市会公式 議員プロフィール",
  sapporo: "札幌市議会公式 議員プロフィール",
  nagoya: "名古屋市議会公式 議員プロフィール",
  yokohama: "横浜市会公式 議員プロフィール",
  fukuoka: "福岡市議会公式 議員プロフィール",
};

function classifyUrl(
  url: string,
  cityId: string,
): { kind: OS["kind"]; label: string } {
  const cd = COUNCIL_DOMAINS[cityId];
  if (cd && url.includes(cd))
    return { kind: "council_official", label: COUNCIL_LABELS[cityId] };

  if (/jimin|liberaldemocrat/i.test(url))
    return { kind: "party_official", label: "自由民主党系公式" };
  if (/komei\.or\.jp/i.test(url))
    return { kind: "party_official", label: "公明党公式" };
  if (/o-ishin|oneosaka|ishinnokai/i.test(url))
    return { kind: "party_official", label: "日本維新の会系公式" };
  if (/cdp-japan/i.test(url))
    return { kind: "party_official", label: "立憲民主党公式" };
  if (/jcp\.or\.jp|wajcp\.net|jcp-/i.test(url))
    return { kind: "party_official", label: "日本共産党系公式" };
  if (/new-kokumin|kokumin/i.test(url))
    return { kind: "party_official", label: "国民民主党公式" };
  if (/reiwa-shinsengumi/i.test(url))
    return { kind: "party_official", label: "れいわ新選組公式" };
  if (/sanseito/i.test(url))
    return { kind: "party_official", label: "参政党公式" };
  if (/genzei758|genzei/i.test(url))
    return { kind: "party_official", label: "減税日本公式" };

  return { kind: "personal_official", label: "本人公式サイト" };
}

// base members から officialProfileUrl を取得
function loadBaseMembers(): Map<string, Member> {
  const map = new Map<string, Member>();
  const files = readdirSync(membersDir);
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    const list = JSON.parse(
      readFileSync(`${membersDir}/${f}`, "utf-8"),
    ) as Member[];
    for (const m of list) map.set(m.id, m);
  }
  return map;
}

const baseMembers = loadBaseMembers();

const data = JSON.parse(readFileSync(file, "utf-8")) as {
  overrides: {
    id: string;
    fields: {
      officialProfileUrl?: string;
      websiteUrl?: string;
      officialSources?: OS[];
      dataConfidence?: string;
    };
    appliedAt: string;
  }[];
};

let processed = 0;
let added = 0;
let skipped = 0;

for (const override of data.overrides) {
  const conf = override.fields.dataConfidence;
  if (conf !== "verified" && conf !== "partial") continue;
  // 既に officialSources がある場合はスキップ
  if (override.fields.officialSources && override.fields.officialSources.length > 0)
    continue;

  const cityId = override.id.split("-")[0];
  const officialProfileUrl =
    override.fields.officialProfileUrl ??
    baseMembers.get(override.id)?.officialProfileUrl;
  const websiteUrl = override.fields.websiteUrl;

  const sources: OS[] = [];
  const seen = new Set<string>();

  if (officialProfileUrl && !seen.has(officialProfileUrl)) {
    const { kind, label } = classifyUrl(officialProfileUrl, cityId);
    sources.push({
      kind,
      label,
      url: officialProfileUrl,
      verifiedAt: VERIFIED_AT,
    });
    seen.add(officialProfileUrl);
  }
  if (websiteUrl && !seen.has(websiteUrl)) {
    const { kind, label } = classifyUrl(websiteUrl, cityId);
    sources.push({
      kind,
      label,
      url: websiteUrl,
      verifiedAt: VERIFIED_AT,
    });
    seen.add(websiteUrl);
  }

  if (sources.length === 0) {
    skipped++;
    continue;
  }
  override.fields.officialSources = sources;
  override.appliedAt = VERIFIED_AT;
  processed++;
  added += sources.length;
}

writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
console.log(
  `\nOfficialSources: processed ${processed}, added ${added}, skipped ${skipped}`,
);
