/**
 * 4市の常任委員会名簿（公式議会サイトから取得）を各議員に反映
 *
 * 大阪は PDF が中心のため今回はスキップ（次セッション）。
 * 札幌・名古屋・横浜・福岡の常任委員会データを直接スクリプトに保持し、
 * 議員名のスペース・漢字/ひらがな違いを正規化してマッチング。
 *
 * 出典: 各市議会公式の委員会別名簿ページ（2026-05-30 取得）
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
  electoralDistrict?: string;
};

// ===== 公式議会サイトから取得した委員会データ =====
// 札幌: 6常任 + 議運
const sapporoCommittees: Record<string, string[]> = {
  総務委員会: [
    "おんむら健太郎",
    "山田一郎",
    "細川正人",
    "村松叶啓",
    "藤田稔人",
    "小野正美",
    "篠原すみれ",
    "福田浩太郎",
    "太田秀子",
    "坂元みちたか",
    "米倉みな子",
  ],
  財政市民委員会: [
    "三神英彦",
    "小口智久",
    "五十嵐徳美",
    "飯島弘之",
    "小竹ともこ",
    "ふじわら広昭",
    "中村たけし",
    "森基誉則",
    "わたなべ泰行",
    "田中啓介",
    "波田大専",
  ],
  文教委員会: [
    "小形香織",
    "和田勝也",
    "高橋克朋",
    "佐々木みつこ",
    "北村光一郎",
    "村上ゆうこ",
    "松原淳二",
    "たけのうち有美",
    "國安政典",
    "好井七海",
    "長屋いずみ",
  ],
  厚生委員会: [
    "水上美華",
    "山田洋聡",
    "勝木勇人",
    "よこやま峰子",
    "松井隆文",
    "林清治",
    "うるしはら直子",
    "丸山秀樹",
    "吉岡弘子",
    "山口かずさ",
    "成田祐樹",
  ],
  建設委員会: [
    "竹内孝代",
    "池田由美",
    "三上洋右",
    "伴良隆",
    "川田ただひさ",
    "中川賢一",
    "しのだ江里子",
    "かんの太一",
    "森山由美子",
    "荒井勇雄",
    "脇元繁之",
  ],
  経済観光委員会: [
    "小須田大拓",
    "定森光",
    "こんどう和雄",
    "こじまゆみ",
    "村山拓司",
    "福士勝",
    "あおいひろみ",
    "前川隆史",
    "熊谷誠一",
    "佐藤綾",
    "丸岡守幸",
  ],
  議会運営委員会: [
    "小竹ともこ",
    "中村たけし",
    "北村光一郎",
    "松井隆文",
    "村松叶啓",
    "かんの太一",
    "小口智久",
    "わたなべ泰行",
    "太田秀子",
  ],
};

// 名古屋: 6常任
const nagoyaCommittees: Record<string, string[]> = {
  総務環境委員会: [
    "成田たかゆき",
    "久田邦博",
    "金庭宜雄",
    "浅井正仁",
    "神ひろし",
    "岩本たかひろ",
    "大田とみひこ",
    "さかい大輔",
    "みつなか美由紀",
    "橋本ひろき",
    "佐藤ゆうこ",
    "森ともお",
  ],
  財政福祉委員会: [
    "西川学",
    "赤松哲次",
    "鈴木孝之",
    "渡辺やすのり",
    "北野よしはる",
    "辻まさお",
    "横井利明",
    "うえぞの晋介",
    "服部将也",
    "さわだ晃一",
    "田山宏之",
    "田口一登",
  ],
  教育子ども委員会: [
    "日比美咲",
    "沢田ひとみ",
    "岡田ゆき子",
    "月森たくや",
    "永井ゆり",
    "吉田茂",
    "加藤一登",
    "木下優",
    "金城ゆたか",
    "岡本やすひろ",
    "服部しんのすけ",
  ],
  土木交通委員会: [
    "久野美穂",
    "藤沢ちあき",
    "中村しゅうへい",
    "塚本つよし",
    "松井よしのり",
    "中里高之",
    "伊神邦彦",
    "小川としゆき",
    "長谷川由美子",
    "大村光子",
    "北角嘉幸",
  ],
  経済水道委員会: [
    "浅野有",
    "おくむら文悟",
    "おか千恵",
    "くずや利枝",
    "大谷ともひろ",
    "野田留美",
    "大島英勲",
    "ふじた和秀",
    "中田ちづこ",
    "うかい春美",
    "田辺雄一",
  ],
  都市消防委員会: [
    "吉岡正修",
    "上村みちよ",
    "くにまさ直記",
    "村瀬きよみ",
    "小出昭司",
    "丹羽ひろし",
    "田中里佳",
    "中川あつし",
    "豊田かおる",
    "近藤和博",
    "山田昌弘",
  ],
};

// 横浜: 8常任
const yokohamaCommittees: Record<string, string[]> = {
  総務委員会: [
    "大桑正貴",
    "竹内康洋",
    "大岩真善和",
    "黒川勝",
    "山下正人",
    "横山正人",
    "仁田昌寿",
    "藤崎浩太郎",
    "くしだ久子",
    "こがゆ康弘",
    "井上さくら",
  ],
  経済港湾委員会: [
    "行田朝仁",
    "清水富雄",
    "山田一誠",
    "田野井一雄",
    "松本研",
    "市来栄美子",
    "中山大輔",
    "田中紳一",
    "横溝じゅん子",
    "関嵩史",
    "大野トモイ",
  ],
  市民消防委員会: [
    "伏見幸枝",
    "伊波俊之助",
    "中島光徳",
    "瀬之間康浩",
    "増永純女",
    "武田勝久",
    "かざまあさみ",
    "山浦英太",
    "深作祐衣",
    "長谷川えつこ",
  ],
  こども教育委員会: [
    "麓理恵",
    "東みちよ",
    "福島直子",
    "白井亮次",
    "藤代哲夫",
    "髙橋正治",
    "髙田修平",
    "伊藤くみこ",
    "みわ智恵美",
    "斉藤達也",
    "輿石かつ子",
  ],
  福祉委員会: [
    "斉藤伸一",
    "青木亮祐",
    "谷田部孝一",
    "佐藤祐文",
    "鈴木太郎",
    "関勝則",
    "竹野内猛",
    "いそべ尚哉",
    "熊本ちひろ",
    "大和田あきお",
    "荻原隆宏",
  ],
  "GREEN×EXPOみどり委員会": [
    "川口広",
    "鴨志田啓介",
    "坂井太",
    "磯部圭太",
    "おさかべさやか",
    "尾崎太",
    "久保和弘",
    "花上喜代志",
    "二井くみよ",
    "古谷靖彦",
    "梶村充",
  ],
  まちづくり委員会: [
    "長谷川琢磨",
    "小松範昭",
    "坂本勝司",
    "酒井誠",
    "渋谷健",
    "安西英俊",
    "木内秀一",
    "森ひろたか",
    "柏原すぐる",
    "白井正子",
    "田中ゆき",
  ],
  上下水道交通委員会: [
    "大山しょうじ",
    "福地茂",
    "横山勇太朗",
    "佐藤茂",
    "渡邊忠則",
    "望月康弘",
    "越久田記子",
    "宇佐美さやか",
    "山田桂一郎",
    "太田正孝",
  ],
};

// 福岡: 5常任
const fukuokaCommittees: Record<string, string[]> = {
  総務財政委員会: [
    "田中たかし",
    "堤田寛",
    "大原弥寿男",
    "打越基安",
    "堤健太郎",
    "山口剛司",
    "前野真実子",
    "ついちはら陽子",
    "堀内徹夫",
    "はしだ和義",
    "中島まさひろ",
  ],
  教育こども委員会: [
    "とみながひろゆき",
    "田原香代子",
    "稲員稔夫",
    "調崇史",
    "尾花康広",
    "井上まい",
    "池田良子",
    "綿貫康代",
    "坂口よしまさ",
    "大沢めぐみ",
    "川口浩",
  ],
  経済振興委員会: [
    "倉元達朗",
    "もろくま英文",
    "淀川幸二郎",
    "津田信太郎",
    "川上晋平",
    "たのかしら知行",
    "古川清文",
    "篠原達也",
    "小竹りか",
    "落石俊則",
    "新村まさる",
    "阿部正剛",
    "福田まもる",
  ],
  福祉都市委員会: [
    "おばた英達",
    "勝見美代",
    "鬼塚昌宏",
    "平畑雅博",
    "川上陽平",
    "石本優子",
    "勝山信吾",
    "松野隆",
    "近藤里美",
    "中山郁美",
    "浜崎太郎",
    "藤野哲司",
    "あべひでき",
  ],
  生活環境委員会: [
    "高木勝利",
    "大森一馬",
    "今林ひであき",
    "阿部真之助",
    "伊藤嘉人",
    "大石修二",
    "山田ゆみこ",
    "田中しんすけ",
    "和田あきひこ",
    "新開ゆうじ",
    "木村てつあき",
    "森あやこ",
  ],
};

// ====== ロジック ======

function normalize(s: string): string {
  // 異体字の統一（﨑→崎, 髙→高, 﨔→桑, 𠮷→吉 等）
  const itaiji: Record<string, string> = {
    "﨑": "崎",
    "髙": "高",
    "﨔": "桑",
    "𠮷": "吉",
    "𠩤": "原",
  };
  let out = s.replace(/[\s　・]/g, "").toLowerCase();
  for (const [from, to] of Object.entries(itaiji)) {
    out = out.split(from).join(to);
  }
  return out;
}

// 議員名 -> 委員会リスト
function buildCommitteeMap(
  cityCommittees: Record<string, string[]>,
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const [committee, members] of Object.entries(cityCommittees)) {
    for (const name of members) {
      const key = normalize(name);
      const list = map.get(key) || [];
      list.push(committee);
      map.set(key, list);
    }
  }
  return map;
}

// 大阪市会: 役員委員表 PDF 令和8年5月18日現在
const osakaCommittees: Record<string, string[]> = {
  市会運営委員会: [
    "岡田妥知",
    "藤田あきら",
    "木下誠",
    "永田典子",
    "出雲輝英",
    "金子恵美",
    "ホンダリエ",
    "荒木肇",
    "今田信行",
    "竹下隆",
    "西徳人",
    "森山よしひさ",
    "高山美佳",
    "坂井はじめ",
    "佐々木哲夫",
    "福田武洋",
    "たけち博幸",
    "岩池きよ",
    "辻義隆",
    "田中ひろき",
  ],
  財政総務委員会: [
    "塩中一成",
    "岡田妥知",
    "山田正和",
    "井上浩",
    "くぼた亮",
    "東貴之",
    "前田和彦",
    "松田まさとし",
    "谷井正佳",
    "木下誠",
    "石川博紀",
    "高山美佳",
    "西徳人",
    "藤原よういち",
  ],
  教育こども委員会: [
    "橋本まさと",
    "藤田あきら",
    "佐々木哲夫",
    "山中智子",
    "山田かな",
    "ますもとさおり",
    "明石直樹",
    "田辺信広",
    "南隆文",
    "伊藤亜実",
    "永井広幸",
    "大西しょういち",
    "藤岡寛和",
    "木下吉信",
  ],
  民生保健委員会: [
    "中田光一郎",
    "坂井はじめ",
    "杉村幸太郎",
    "武直樹",
    "辻義隆",
    "宮脇希",
    "山本智子",
    "広田和美",
    "馬場のりゆき",
    "大橋一隆",
    "須藤奨太",
    "竹下隆",
    "木村ひかり",
    "森山よしひさ",
  ],
  都市経済委員会: [
    "わしみ慎一",
    "くりたゆうや",
    "小山光明",
    "佐竹りほ",
    "清水こう",
    "黒田まりこ",
    "杉田忠裕",
    "岸本栄",
    "梅園周",
    "渕上浩美",
    "たけち博幸",
    "辻淳子",
    "田中ひろき",
  ],
  市政改革委員会: [
    "山口悟朗",
    "岩池きよ",
    "吉見みさこ",
    "西拓郎",
    "西﨑照明",
    "近藤みわ",
    "森慶吾",
    "近藤大",
    "永瀬かなこ",
    "福田武洋",
    "出雲輝英",
    "ホンダリエ",
    "松崎孔",
  ],
  建設港湾委員会: [
    "鈴木理恵",
    "金子恵美",
    "人見つよし",
    "太田勝己",
    "荒木肇",
    "原口悠介",
    "今田信行",
    "今村直人",
    "片山一歩",
    "土岐恭生",
    "野上らん",
    "上田智隆",
    "永田典子",
  ],
};

// 全市の commitee マップを統合
const allCommitteesByCity: Record<string, Map<string, string[]>> = {
  sapporo: buildCommitteeMap(sapporoCommittees),
  nagoya: buildCommitteeMap(nagoyaCommittees),
  yokohama: buildCommitteeMap(yokohamaCommittees),
  fukuoka: buildCommitteeMap(fukuokaCommittees),
  osaka: buildCommitteeMap(osakaCommittees),
};

// 出典URL
const sourceUrls: Record<string, string> = {
  sapporo: "https://www.city.sapporo.jp/gikai/meibo/meibo-iinkai.html",
  nagoya: "https://www.city.nagoya.jp/shikai/category/333-6-0-0-0-0-0-0-0-0.html",
  yokohama:
    "https://www.city.yokohama.lg.jp/shikai/giin/iinkaibetsu/jonin/meibo2026j.html",
  fukuoka: "https://gikai.city.fukuoka.lg.jp/member/standard",
  osaka:
    "https://www.city.osaka.lg.jp/shikai/cmsfiles/contents/0000150/150881/20260518iin.pdf",
};

// base members.json を load
function loadBaseMembers(): Member[] {
  const all: Member[] = [];
  for (const f of readdirSync(membersDir)) {
    if (!f.endsWith(".json")) continue;
    const list = JSON.parse(
      readFileSync(`${membersDir}/${f}`, "utf-8"),
    ) as Member[];
    all.push(...list);
  }
  return all;
}

const baseMembers = loadBaseMembers();

const data = JSON.parse(readFileSync(file, "utf-8")) as {
  overrides: {
    id: string;
    fields: Record<string, unknown> & { committees?: string[] };
    reason: string;
    appliedAt: string;
  }[];
};

const overridesById = new Map(data.overrides.map((o) => [o.id, o]));

let matched = 0;
let unmatched: string[] = [];
let updated = 0;

for (const member of baseMembers) {
  if (!["sapporo", "nagoya", "yokohama", "fukuoka", "osaka"].includes(member.cityId))
    continue;
  const committeeMap = allCommitteesByCity[member.cityId];
  const key = normalize(member.name);
  const kanaKey = member.nameKana ? normalize(member.nameKana) : null;

  let committees = committeeMap.get(key);
  if (!committees && kanaKey) {
    committees = committeeMap.get(kanaKey);
  }
  // 部分マッチ（一部の議員名は省略や読み違いがある）
  if (!committees) {
    // 名前の半分以上が一致するエントリを探す（最低3文字）
    for (const [mapKey, comList] of committeeMap.entries()) {
      if (mapKey.length < 3 || key.length < 3) continue;
      // base name に mapKey が含まれる or mapKey に base name が含まれる
      if (mapKey.includes(key) || key.includes(mapKey)) {
        committees = comList;
        break;
      }
    }
  }

  if (!committees) {
    unmatched.push(`${member.cityId} ${member.id} (${member.name})`);
    continue;
  }
  matched++;

  // override に反映
  let ov = overridesById.get(member.id);
  if (!ov) {
    ov = {
      id: member.id,
      fields: {},
      reason: `${sourceUrls[member.cityId]} から委員会情報を取得`,
      appliedAt: VERIFIED_AT,
    };
    data.overrides.push(ov);
    overridesById.set(member.id, ov);
  }
  ov.fields.committees = committees;
  ov.appliedAt = VERIFIED_AT;
  updated++;
}

writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
console.log(
  `\nMatched: ${matched} / Updated: ${updated} / Unmatched: ${unmatched.length}`,
);
if (unmatched.length > 0) {
  console.log("\n=== Unmatched (公式委員会名簿に見つからなかった議員) ===");
  for (const u of unmatched.slice(0, 30)) console.log(`  ${u}`);
  if (unmatched.length > 30)
    console.log(`  ...他 ${unmatched.length - 30}名`);
}
