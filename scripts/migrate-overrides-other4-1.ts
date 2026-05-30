/**
 * 他4市10名（札幌2/名古屋2/横浜4/福岡2）の notableQuotes → careerMilestones 移行
 *
 * ABCD 分類結果：
 *  - A 残留: 0件
 *  - B 移行 → careerMilestones: 13件
 *  - C 削除: 1件（sapporo-osanai の桑園小学校新築は議員業績との関連性が不明確）
 *  - D 非表示: 0件
 *
 * 加えて、各議員の reason に書かれている経歴・役職情報も careerMilestones に追加。
 *
 * すべて出典URLは reason に既出のもの or 既存 officialProfileUrl/websiteUrl。
 */
import { readFileSync, writeFileSync } from "node:fs";

const VERIFIED_AT = "2026-05-30";

type CM = {
  label?: string;
  content: string;
  source: string;
  sourceUrl: string;
  verifiedAt: string;
};

type Patch = {
  careerMilestones: CM[];
  clearQuotes: boolean;
};

const patches: Record<string, Patch> = {
  "sapporo-osanai-naoya": {
    clearQuotes: true, // 2件のうち1件はB移行、1件はC削除（桑園小学校）
    careerMilestones: [
      {
        label: "7期",
        content:
          "さっぽろ自民党公式および本人公式サイトでは、札幌市議会議員7期、1999年初当選とされている。",
        source: "本人公式サイト",
        sourceUrl: "http://www.naoya.jp/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "自民党札幌市支部連合会副会長・元議長",
        content:
          "さっぽろ自民党公式および本人公式サイトでは、自民党札幌市支部連合会副会長、札幌市議会議長経験者と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "http://www.naoya.jp/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "ポイ捨て防止条例の議員提案",
        content:
          "本人公式サイトでは、ポイ捨て防止条例を議員提案で制定したと記載されている。",
        source: "本人公式サイト",
        sourceUrl: "http://www.naoya.jp/",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },

  "sapporo-iijima-hiroyuki": {
    clearQuotes: true,
    careerMilestones: [
      {
        label: "第36代札幌市議会議長（2023-05 就任）",
        content:
          "さっぽろ自民党公式では、2023年5月に第36代札幌市議会議長に就任したと記載されている。",
        source: "さっぽろ自民党公式",
        sourceUrl:
          "https://jiminsapporo.jp/activity/%E7%AC%AC36%E4%BB%A3%E6%9C%AD%E5%B9%8C%E5%B8%82%E8%AD%B0%E4%BC%9A%E8%AD%B0%E9%95%B7%E3%81%AB%E9%A3%AF%E5%B3%B6%E5%BC%98%E4%B9%8B%E8%AD%B0%E5%93%A1%E3%81%8C%E5%B0%B1%E4%BB%BB%E3%81%97%E3%81%BE%E3%81%97/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "略歴",
        content:
          "札幌自民党公式プロフィールでは、本人の経歴・学歴・職歴が掲載されている（jimin-sapporo.jp）。",
        source: "札幌自民党公式プロフィール",
        sourceUrl: "https://jimin-sapporo.jp/iijimahiroyuki.html",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },

  "nagoya-asai-masahito": {
    clearQuotes: true,
    careerMilestones: [
      {
        label: "中川区選出",
        content:
          "自由民主党名古屋市会議員団公式および本人公式サイトでは、中川区選出と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://asaimasahito.com/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "令和7年度 自民党名古屋市会議員団幹事・財政福祉委員会委員長",
        content:
          "自由民主党名古屋市会議員団公式および本人公式サイトでは、令和7年度の自民党名古屋市会議員団幹事、財政福祉委員会委員長と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://asaimasahito.com/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "2026-03-05 本会議質問",
        content:
          "本人公式サイトの活動報告では、2026年3月5日に本会議で財政運営と福祉施策について質疑を行ったと記載されている。",
        source: "本人公式サイト 活動報告",
        sourceUrl: "https://asaimasahito.com/",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },

  "nagoya-akamatsu-tetsuji": {
    clearQuotes: true,
    careerMilestones: [
      {
        label: "2期、名古屋市中川区",
        content:
          "立憲民主党公式および名古屋民主市会議員団公式では、2期、中川区選出と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://www.akamatsu-tetsuji.com/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "略歴",
        content:
          "本人公式サイトでは、愛知学院大学商学部卒、元日本通運（シンガポール配属歴あり）、現赤松広隆衆議院議員秘書と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://www.akamatsu-tetsuji.com/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "新型コロナ対応の本会議提案",
        content:
          "本人公式サイトでは、新型コロナウイルス自宅療養者への配食サービス拡充を本会議で提案したと記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://www.akamatsu-tetsuji.com/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "子ども医療費18歳まで無料化の提案",
        content:
          "本人公式サイトでは、子ども医療費の18歳まで無料化を提案したと記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://www.akamatsu-tetsuji.com/",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },

  "yokohama-yamada-issei": {
    clearQuotes: true,
    careerMilestones: [
      {
        label: "2期、鶴見区選出",
        content:
          "よこはま自民党公式および本人公式サイトでは、2期、鶴見区選出と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://yamadakazumasa.com/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "略歴",
        content:
          "本人公式サイトでは、横浜市立寺尾小学校→慶應義塾大学法学部法律学科卒（2000年3月）、2000年10月司法試験合格、2002年10月弁護士登録、2007年4月に「横浜開港法律事務所」を設立・代表と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://yamadakazumasa.com/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "令和3年度『横浜市子供を虐待から守る条例』改正（議員提案）の事務局長",
        content:
          "本人公式サイトでは、令和3年度に行われた『横浜市子供を虐待から守る条例』改正（議員提案）の事務局長を務め、体罰や子どもの尊厳を傷つける行為の禁止などを盛り込んだ条例改正に関わったと記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://yamadakazumasa.com/",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },

  "yokohama-fukushima-naoko": {
    clearQuotes: true,
    careerMilestones: [
      {
        label: "6期、中区選出",
        content:
          "公明党公式議員プロフィールおよび本人公式サイトでは、6期、中区選出と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://www.fukushima-naoko.info/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "第61代横浜市会副議長",
        content:
          "本人公式サイトでは、第61代横浜市会副議長と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://www.fukushima-naoko.info/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "公明党神奈川県本部副代表・他役職",
        content:
          "本人公式サイトでは、公明党神奈川県本部副代表、公明党中区支部長、神奈川県後期高齢者医療広域連合議会議員と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://www.fukushima-naoko.info/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "2026-04-16 後期高齢者医療制度に関する市政レポート発行",
        content:
          "本人公式サイトでは、2026年4月16日に後期高齢者医療制度に関する市政レポートを発行したと記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://www.fukushima-naoko.info/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "2026-03-24 予算特別委員会で質問",
        content:
          "本人公式サイトの活動報告では、2026年3月24日に予算特別委員会で質問を行ったと記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://www.fukushima-naoko.info/",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },

  "yokohama-inoue-sakura": {
    clearQuotes: true,
    careerMilestones: [
      {
        label: "8期（1995年初当選）、鶴見区選出",
        content:
          "本人公式サイトでは、1995年に横浜市会議員に初当選、以後8期連続当選、無所属、鶴見区選出と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://www.sakuraline.jp/profile",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "略歴",
        content:
          "本人公式サイトでは、1965年2月24日東京都渋谷区代々木生まれ、法政大学法学部中退と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://www.sakuraline.jp/profile",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "2009 議員歳費10%削減条例案を提出",
        content:
          "本人公式サイトでは、2009年に議員歳費10%削減条例案を提出したと記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://www.sakuraline.jp/profile",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },

  "yokohama-watanabe-tadanori": {
    clearQuotes: true,
    careerMilestones: [
      {
        label: "5期、鶴見区選出",
        content:
          "よこはま自民党公式および本人公式サイトでは、5期、鶴見区選出と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://www.watanabe-tadanori.com/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "第56代横浜市会議長（2026-05-15 選任）",
        content:
          "本人公式サイトでは、2026年5月15日に第56代横浜市会議長に選任されたと記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://www.watanabe-tadanori.com/",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },

  "fukuoka-abe-shinnosuke": {
    clearQuotes: true,
    careerMilestones: [
      {
        label: "5期、城南区選出（2003年初当選）",
        content:
          "福岡市議会公式および本人公式サイトでは、5期、2003年初当選、城南区選出と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://shin-no-suke.net/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "略歴",
        content:
          "本人公式サイトでは、修猷館高校→鳥取大学医学部中退→九州大学法学部法律学科卒と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://shin-no-suke.net/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "第73代福岡市議会議長（2019-05 〜 2021-06）",
        content:
          "福岡市議会公式および本人公式サイトでは、2019年5月から2021年6月まで第73代福岡市議会議長を務め、在任中に全国市議会議長会研究会会長、九州市議会議長会会長、福岡県市議会議長会会長を歴任したと記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://shin-no-suke.net/",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },

  "fukuoka-uchikoshi-motoyasu": {
    clearQuotes: true,
    careerMilestones: [
      {
        label: "6期、南区選出（2003年初当選）",
        content:
          "福岡市議会公式および本人公式サイトでは、6期、2003年初当選、南区選出と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://uchikoshi.info/profile/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "第75代福岡市議会議長（2023-05 就任、2025 退任）",
        content:
          "福岡市議会公式および本人公式サイトでは、2023年5月に第75代福岡市議会議長に就任し、2025年に退任したと記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://uchikoshi.info/profile/",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },
};

// ====== 適用 ======
const file = "data/member-overrides.json";
const data = JSON.parse(readFileSync(file, "utf-8"));

let applied = 0;
const ids = Object.keys(patches);

for (const override of data.overrides) {
  if (!ids.includes(override.id)) continue;
  const patch = patches[override.id];
  override.fields.careerMilestones = patch.careerMilestones;
  if (patch.clearQuotes) {
    override.fields.notableQuotes = [];
  }
  override.appliedAt = VERIFIED_AT;
  applied++;
  console.log(
    `OK : ${override.id}  cm=${patch.careerMilestones.length}  quotes_cleared=${patch.clearQuotes}`,
  );
}

for (const id of ids) {
  if (!data.overrides.find((o: { id: string }) => o.id === id)) {
    console.error(`MISS: ${id}`);
  }
}

writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
console.log(`\nApplied: ${applied}/${ids.length}`);
