/**
 * 5市の委員会の委員長・副委員長役職を各議員の careerMilestones に追加
 *
 * 出典: 各市公式委員会別名簿（migrate-committees.ts と同じ）
 * + 大阪市会公式 PDF（令和8年5月18日現在）
 *
 * 委員長・副委員長は議員の「役職」なので careerMilestones に追加。
 * 一般委員は committees field のみで十分（既に整備済み）。
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const VERIFIED_AT = "2026-05-30";
const file = "data/member-overrides.json";
const membersDir = "data/members";

type Member = {
  id: string;
  cityId: string;
  name: string;
  nameKana?: string;
};

type CM = {
  label?: string;
  content: string;
  source: string;
  sourceUrl: string;
  verifiedAt: string;
};

type ChairData = {
  committee: string;
  chair: string;
  viceChair: string[];
};

const sapporoChairs: ChairData[] = [
  { committee: "総務委員会", chair: "おんむら健太郎", viceChair: ["山田一郎"] },
  { committee: "財政市民委員会", chair: "三神英彦", viceChair: ["小口智久"] },
  { committee: "文教委員会", chair: "小形香織", viceChair: ["和田勝也"] },
  { committee: "厚生委員会", chair: "水上美華", viceChair: ["山田洋聡"] },
  { committee: "建設委員会", chair: "竹内孝代", viceChair: ["池田由美"] },
  { committee: "経済観光委員会", chair: "小須田大拓", viceChair: ["定森光"] },
  { committee: "議会運営委員会", chair: "小竹ともこ", viceChair: ["中村たけし"] },
];

const nagoyaChairs: ChairData[] = [
  {
    committee: "総務環境委員会",
    chair: "成田たかゆき",
    viceChair: ["久田邦博", "金庭宜雄"],
  },
  {
    committee: "財政福祉委員会",
    chair: "西川学",
    viceChair: ["赤松哲次", "鈴木孝之"],
  },
  {
    committee: "教育子ども委員会",
    chair: "日比美咲",
    viceChair: ["沢田ひとみ", "岡田ゆき子"],
  },
  {
    committee: "土木交通委員会",
    chair: "久野美穂",
    viceChair: ["藤沢ちあき", "中村しゅうへい"],
  },
  {
    committee: "経済水道委員会",
    chair: "浅野有",
    viceChair: ["おくむら文悟", "おか千恵"],
  },
  {
    committee: "都市消防委員会",
    chair: "吉岡正修",
    viceChair: ["上村みちよ", "くにまさ直記"],
  },
];

const yokohamaChairs: ChairData[] = [
  {
    committee: "総務委員会",
    chair: "大桑正貴",
    viceChair: ["竹内康洋", "大岩真善和"],
  },
  {
    committee: "経済港湾委員会",
    chair: "行田朝仁",
    viceChair: ["清水富雄", "山田一誠"],
  },
  {
    committee: "市民消防委員会",
    chair: "伏見幸枝",
    viceChair: ["伊波俊之助", "中島光徳"],
  },
  {
    committee: "こども教育委員会",
    chair: "麓理恵",
    viceChair: ["東みちよ", "福島直子"],
  },
  {
    committee: "福祉委員会",
    chair: "斉藤伸一",
    viceChair: ["青木亮祐", "谷田部孝一"],
  },
  {
    committee: "GREEN×EXPOみどり委員会",
    chair: "川口広",
    viceChair: ["鴨志田啓介", "坂井太"],
  },
  {
    committee: "まちづくり委員会",
    chair: "長谷川琢磨",
    viceChair: ["小松範昭", "坂本勝司"],
  },
  {
    committee: "上下水道交通委員会",
    chair: "大山しょうじ",
    viceChair: ["福地茂", "横山勇太朗"],
  },
];

const fukuokaChairs: ChairData[] = [
  { committee: "総務財政委員会", chair: "田中たかし", viceChair: ["堤田寛"] },
  {
    committee: "教育こども委員会",
    chair: "とみながひろゆき",
    viceChair: ["田原香代子"],
  },
  {
    committee: "経済振興委員会",
    chair: "倉元達朗",
    viceChair: ["もろくま英文"],
  },
  { committee: "福祉都市委員会", chair: "おばた英達", viceChair: ["勝見美代"] },
  { committee: "生活環境委員会", chair: "高木勝利", viceChair: ["大森一馬"] },
];

const osakaChairs: ChairData[] = [
  {
    committee: "市会運営委員会",
    chair: "岡田妥知",
    viceChair: ["出雲輝英", "今田信行"],
  },
  {
    committee: "財政総務委員会",
    chair: "塩中一成",
    viceChair: ["くぼた亮", "谷井正佳"],
  },
  {
    committee: "教育こども委員会",
    chair: "橋本まさと",
    viceChair: ["山田かな", "南隆文"],
  },
  {
    committee: "民生保健委員会",
    chair: "中田光一郎",
    viceChair: ["辻義隆", "馬場のりゆき"],
  },
  {
    committee: "都市経済委員会",
    chair: "わしみ慎一",
    viceChair: ["清水こう", "岸本栄"],
  },
  {
    committee: "市政改革委員会",
    chair: "山口悟朗",
    viceChair: ["西﨑照明", "近藤大"],
  },
  {
    committee: "建設港湾委員会",
    chair: "鈴木理恵",
    viceChair: ["荒木肇", "今村直人"],
  },
];

const allChairs: Record<string, ChairData[]> = {
  sapporo: sapporoChairs,
  nagoya: nagoyaChairs,
  yokohama: yokohamaChairs,
  fukuoka: fukuokaChairs,
  osaka: osakaChairs,
};

const sourceUrls: Record<string, string> = {
  sapporo: "https://www.city.sapporo.jp/gikai/meibo/meibo-iinkai.html",
  nagoya:
    "https://www.city.nagoya.jp/shikai/category/333-6-0-0-0-0-0-0-0-0.html",
  yokohama:
    "https://www.city.yokohama.lg.jp/shikai/giin/iinkaibetsu/jonin/meibo2026j.html",
  fukuoka: "https://gikai.city.fukuoka.lg.jp/member/standard",
  osaka:
    "https://www.city.osaka.lg.jp/shikai/cmsfiles/contents/0000150/150881/20260518iin.pdf",
};

const sourceNames: Record<string, string> = {
  sapporo: "札幌市議会公式 委員会別名簿",
  nagoya: "名古屋市会公式 常任委員会名簿",
  yokohama: "横浜市会公式 常任委員会名簿（令和8年5月15日〜）",
  fukuoka: "福岡市議会公式 常任委員会",
  osaka: "大阪市会公式 役員委員表（令和8年5月18日現在 PDF）",
};

function normalize(s: string): string {
  const itaiji: Record<string, string> = {
    "﨑": "崎",
    "髙": "高",
    "𠮷": "吉",
    "𠩤": "原",
  };
  let out = s.replace(/[\s　・]/g, "").toLowerCase();
  for (const [from, to] of Object.entries(itaiji)) {
    out = out.split(from).join(to);
  }
  return out;
}

// base members → name normalized -> id
function loadBaseMembers(): Map<string, Map<string, string>> {
  const byCity = new Map<string, Map<string, string>>();
  for (const f of readdirSync(membersDir)) {
    if (!f.endsWith(".json")) continue;
    const cityId = f.replace(".json", "");
    const inner = new Map<string, string>();
    const list = JSON.parse(
      readFileSync(`${membersDir}/${f}`, "utf-8"),
    ) as Member[];
    for (const m of list) {
      inner.set(normalize(m.name), m.id);
      if (m.nameKana) inner.set(normalize(m.nameKana), m.id);
    }
    byCity.set(cityId, inner);
  }
  return byCity;
}

const baseMembersByCity = loadBaseMembers();

const data = JSON.parse(readFileSync(file, "utf-8")) as {
  overrides: {
    id: string;
    fields: { careerMilestones?: CM[] } & Record<string, unknown>;
    reason: string;
    appliedAt: string;
  }[];
};

const overridesById = new Map(data.overrides.map((o) => [o.id, o]));

function findId(name: string, cityId: string): string | null {
  const cityMap = baseMembersByCity.get(cityId);
  if (!cityMap) return null;
  const key = normalize(name);
  if (cityMap.has(key)) return cityMap.get(key)!;
  // 部分一致（フォールバック）
  for (const [k, id] of cityMap.entries()) {
    if (k.length >= 3 && key.length >= 3) {
      if (k.includes(key) || key.includes(k)) return id;
    }
  }
  return null;
}

function ensureOverride(id: string) {
  let o = overridesById.get(id);
  if (!o) {
    o = { id, fields: {}, reason: "委員会役職を追加", appliedAt: VERIFIED_AT };
    data.overrides.push(o);
    overridesById.set(id, o);
  }
  return o;
}

function addRole(
  id: string,
  cityId: string,
  committee: string,
  roleLabel: string,
) {
  const o = ensureOverride(id);
  const existing = o.fields.careerMilestones || [];
  const newLabel = `${committee} ${roleLabel}`;
  // 既に同じ label の milestone があればスキップ
  if (existing.some((cm) => cm.label === newLabel)) return false;
  existing.push({
    label: newLabel,
    content: `${sourceNames[cityId]}では、${committee}の${roleLabel}として記載されている。`,
    source: sourceNames[cityId],
    sourceUrl: sourceUrls[cityId],
    verifiedAt: VERIFIED_AT,
  });
  o.fields.careerMilestones = existing;
  o.appliedAt = VERIFIED_AT;
  return true;
}

let added = 0;
let unmatched: string[] = [];

for (const [cityId, chairs] of Object.entries(allChairs)) {
  for (const c of chairs) {
    // 委員長
    const chairId = findId(c.chair, cityId);
    if (chairId) {
      if (addRole(chairId, cityId, c.committee, "委員長")) added++;
    } else {
      unmatched.push(`${cityId} 委員長 ${c.committee} ${c.chair}`);
    }
    // 副委員長
    for (const vc of c.viceChair) {
      const vcId = findId(vc, cityId);
      if (vcId) {
        if (addRole(vcId, cityId, c.committee, "副委員長")) added++;
      } else {
        unmatched.push(`${cityId} 副委員長 ${c.committee} ${vc}`);
      }
    }
  }
}

writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
console.log(`\nAdded: ${added} chair/vice-chair careerMilestones`);
console.log(`Unmatched: ${unmatched.length}`);
if (unmatched.length > 0) {
  for (const u of unmatched.slice(0, 20)) console.log(`  ${u}`);
}
