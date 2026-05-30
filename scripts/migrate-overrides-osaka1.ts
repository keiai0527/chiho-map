/**
 * 大阪市14名の careerMilestones 一括追加 + 既存 notableQuotes の ABCD 移行
 *
 * 既存5名: 藤田/山中/井上/木下/たけち（A=たけち1件残留、B=藤田/井上/木下3件→careerMilestones、C=山中削除）
 * 新規9名: 辻・前田・高山・西徳人・鈴木・田辺・廣田・西卓郎・佐竹
 *
 * 各項目: label / content / source / sourceUrl / verifiedAt を必須。
 * verifiedAt は実行日。content は「公式プロフィールでは...と記載されている」スタイルで統一。
 * 推測は入れない。出典URLが reason に明記されていない情報はスキップ。
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

type NQ = {
  date: string;
  content: string;
  source: string;
  sourceUrl?: string;
  context?: string;
};

type Patch = {
  careerMilestones?: CM[];
  notableQuotes?: NQ[];
};

const patches: Record<string, Patch> = {
  // ========== B 移行 ==========
  "osaka-fujita-akira": {
    notableQuotes: [],
    careerMilestones: [
      {
        label: "3期、北区選出",
        content:
          "大阪維新の会大阪市会議員団公式プロフィールでは、北区選出・3期とされている。2012年補欠選挙で初当選。",
        source: "大阪維新の会大阪市会議員団公式プロフィール",
        sourceUrl:
          "https://ishinnokai-osakashikai.jp/member/%E8%97%A4%E7%94%B0%E3%80%80%E3%81%82%E3%81%8D%E3%82%89",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "現職役職・委員会",
        content:
          "大阪維新の会大阪市会議員団公式プロフィールでは、財政総務委員会委員長、決算特別委員会委員長、関西広域連合議会議員、日本維新の会常任役員（政調会長代行）と記載されている。",
        source: "大阪維新の会大阪市会議員団公式プロフィール",
        sourceUrl:
          "https://ishinnokai-osakashikai.jp/member/%E8%97%A4%E7%94%B0%E3%80%80%E3%81%82%E3%81%8D%E3%82%89",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "2024-2025年度版 年次報告書 公開（2025-03-26）",
        content:
          "本人公式サイトで「2024-2025年度版 年次報告書」を公開。財政総務委員会委員長・決算特別委員会委員長・関西広域連合議会議員としての1年間の活動と、大阪維新の会大阪市会議員団 政務調査会長代行 兼 日本維新の会 政調会長代行としての職務が報告されている。",
        source: "本人公式サイト 年次報告書",
        sourceUrl:
          "https://fujitaakira.com/activity/report/annual_report_2024-2025/",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },

  "osaka-yamanaka-tomoko": {
    // C 削除（代表質問テーマの要約は本人発言の直接引用ではない）
    notableQuotes: [],
    careerMilestones: [
      {
        label: "7期",
        content:
          "日本共産党中央委員会公式議員紹介ページでは、大阪市会議員 7期とされている。",
        source: "日本共産党中央委員会公式 議員紹介",
        sourceUrl: "https://www.jcp.or.jp/web_jcp/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "日本共産党大阪市会議員団 団長",
        content:
          "本人公式サイトおよび日本共産党中央委員会公式では、日本共産党大阪市会議員団 団長と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "http://yamanaka-tomoko.wajcp.net/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "1999年初当選",
        content:
          "本人公式サイトおよび日本共産党中央委員会公式では、1999年初当選、元大阪福祉事業財団勤務と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "http://yamanaka-tomoko.wajcp.net/",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },

  "osaka-inoue-hiroshi": {
    // B 移行（建設港湾委員会の質疑は日付特定不可、careerMilestones に活動実績として）
    notableQuotes: [],
    careerMilestones: [
      {
        label: "5期、住吉区選出",
        content:
          "日本共産党中央委員会公式議員プロフィールでは、大阪市会議員 5期、住吉区選出とされている。",
        source: "日本共産党中央委員会公式 議員プロフィール",
        sourceUrl: "https://www.jcp.or.jp/list/member/2712091",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "日本共産党大阪市会議員団 政調会長",
        content:
          "日本共産党中央委員会公式議員プロフィールでは、日本共産党大阪市会議員団 政調会長と記載されている。",
        source: "日本共産党中央委員会公式 議員プロフィール",
        sourceUrl: "https://www.jcp.or.jp/list/member/2712091",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "建設港湾委員会での活動",
        content:
          "日本共産党中央委員会公式議員プロフィールでは、建設港湾委員会で大阪市の大規模公園の運営民間委託問題（コンセッション方式）について質疑を行ったと記載されている。",
        source: "日本共産党中央委員会公式 議員プロフィール",
        sourceUrl: "https://www.jcp.or.jp/list/member/2712091",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "他の役職",
        content:
          "日本共産党中央委員会公式議員プロフィールでは、大阪広域環境施設組合議会議員、住吉区社保協副会長と記載されている。",
        source: "日本共産党中央委員会公式 議員プロフィール",
        sourceUrl: "https://www.jcp.or.jp/list/member/2712091",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },

  "osaka-kinoshita-yoshinobu": {
    // B 移行（3件すべて実績・役職）
    notableQuotes: [],
    careerMilestones: [
      {
        label: "9期、阿倍野区選出（1992年補欠選挙で初当選）",
        content:
          "本人公式サイト『プロフィール』では、阿倍野区選出・9期、1992年補欠選挙で初当選と記載されている。",
        source: "本人公式プロフィール",
        sourceUrl:
          "https://www.kinoshita-yoshinobu.com/pages/profile/index.php",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "第110代大阪市会議長（2013-12 就任）",
        content:
          "本人公式プロフィールおよび大阪市会公式『歴代議長・副議長』では、第110代大阪市会議長に2013年12月に就任したと記載されている。",
        source: "大阪市会公式「歴代議長・副議長」",
        sourceUrl: "https://www.city.osaka.lg.jp/shikai/page/0000001333.html",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "第115代大阪市会副議長（2015-05 就任）",
        content:
          "本人公式プロフィールおよび大阪市会公式『歴代議長・副議長』では、第115代大阪市会副議長に2015年5月に就任したと記載されている。",
        source: "大阪市会公式「歴代議長・副議長」",
        sourceUrl: "https://www.city.osaka.lg.jp/shikai/page/0000001333.html",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "定例勉強会「木下塾」（2026-01-07 第105回開催）",
        content:
          "本人公式サイト『更新情報』では、定例勉強会「木下塾」を継続運営しており、2026年1月7日に第105回を開催したと記載されている。",
        source: "本人公式サイト 更新情報",
        sourceUrl: "https://www.kinoshita-yoshinobu.com/",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },

  "osaka-takechi-hiroyuki": {
    // A 残留（notableQuotes は維持）+ careerMilestones 追加
    careerMilestones: [
      {
        label: "1期、此花区選出",
        content:
          "大阪維新の会大阪市会議員団公式プロフィールでは、此花区選出・1期とされている。",
        source: "大阪維新の会大阪市会議員団公式プロフィール",
        sourceUrl:
          "https://ishinnokai-osakashikai.jp/member/%E7%AB%B9%E5%86%85%20%E5%8D%9A%E5%B9%B8",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "大阪維新の会大阪市会議員団 政務調査会副会長",
        content:
          "大阪維新の会大阪市会議員団公式プロフィールでは、大阪維新の会大阪市会議員団 政務調査会副会長と記載されている。",
        source: "大阪維新の会大阪市会議員団公式プロフィール",
        sourceUrl:
          "https://ishinnokai-osakashikai.jp/member/%E7%AB%B9%E5%86%85%20%E5%8D%9A%E5%B9%B8",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },

  // ========== 新規9名 ==========
  "osaka-tsuji-junko": {
    careerMilestones: [
      {
        label: "西成区：6期",
        content:
          "大阪維新の会大阪市会議員団公式プロフィールでは、西成区選出・6期とされている。",
        source: "大阪維新の会大阪市会議員団公式プロフィール",
        sourceUrl:
          "https://ishinnokai-osakashikai.jp/member/%E8%BE%BB%E6%B7%B3%E5%AD%90",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "略歴",
        content:
          "大阪維新の会公式プロフィールでは、武庫川女子大学薬学部卒、薬剤師と記載されている。",
        source: "大阪維新の会公式プロフィール",
        sourceUrl: "https://oneosaka.jp/member/detail/tsuji_junko.html",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "第108代大阪市会議長",
        content:
          "大阪市会公式の歴代議長一覧では、第108代議長として辻淳子氏、在任期間は平成24年5月30日から平成25年5月30日までと記載されている。",
        source: "大阪市会公式「歴代議長・副議長」",
        sourceUrl: "https://www.city.osaka.lg.jp/shikai/page/0000001333.html",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "役職・委員会",
        content:
          "大阪維新の会公式プロフィールでは、日本維新の会常任役員、都市経済委員会と記載されている。",
        source: "大阪維新の会公式プロフィール",
        sourceUrl: "https://oneosaka.jp/member/detail/tsuji_junko.html",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },

  "osaka-maeda-kazuhiko": {
    careerMilestones: [
      {
        label: "3期、北区選出",
        content:
          "自由民主党大阪市会議員団公式プロフィールでは、北区選出・3期とされている。",
        source: "自由民主党大阪市会議員団公式",
        sourceUrl: "https://www.osaka-jimin-shikai.jp/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "略歴",
        content:
          "自由民主党大阪市会議員団公式および本人公式サイトでは、元財務省財務事務官と記載されている。",
        source: "自由民主党大阪市会議員団公式",
        sourceUrl: "https://www.osaka-jimin-shikai.jp/",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },

  "osaka-takayama-mika": {
    careerMilestones: [
      {
        label: "北区選出",
        content:
          "大阪維新の会公式メンバーページでは、北区選出と記載されている。",
        source: "大阪維新の会公式メンバーページ",
        sourceUrl: "https://oneosaka.jp/member/detail/takayama_mika.html",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "略歴",
        content:
          "大阪維新の会公式メンバーページでは、関西学院大学商学部卒、元民間証券会社勤務と記載されている。",
        source: "大阪維新の会公式メンバーページ",
        sourceUrl: "https://oneosaka.jp/member/detail/takayama_mika.html",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "大阪維新の会 政調会長代理",
        content:
          "大阪維新の会公式メンバーページでは、大阪維新の会 政調会長代理と記載されている。",
        source: "大阪維新の会公式メンバーページ",
        sourceUrl: "https://oneosaka.jp/member/detail/takayama_mika.html",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },

  "osaka-nishi-tokuto": {
    careerMilestones: [
      {
        label: "4期、港区選出",
        content:
          "公明党公式議員プロフィールおよび本人公式サイトでは、港区選出・4期とされている。",
        source: "公明党公式議員プロフィール",
        sourceUrl: "https://www.komei.or.jp/m/norihito-nishi/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "大阪市会副議長",
        content:
          "本人公式サイトでは、大阪市会副議長と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://norihito-nishi.com/",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },

  "osaka-suzuki-rie": {
    careerMilestones: [
      {
        label: "中央区選出",
        content:
          "自由民主党大阪市会議員団公式および本人公式サイトでは、中央区選出と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://rie-suzuki.jp/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "略歴・本業",
        content:
          "本人公式サイトでは、現役薬剤師、株式会社コトブキ薬局代表取締役、大阪府薬剤師会理事と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://rie-suzuki.jp/",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },

  "osaka-tanabe-nobuhiro": {
    careerMilestones: [
      {
        label: "東住吉区選出（無所属大阪市会議員団・1人会派）",
        content:
          "本人公式サイトおよび大阪維新の会公式メンバーページでは、東住吉区選出、会派『無所属大阪市会議員団』（1人会派）と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://nobuhiro-tanabe.com/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "略歴・本業",
        content:
          "本人公式サイトでは、元証券マン（資産運用アドバイザー）、行政書士・経営コンサルタントと記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://nobuhiro-tanabe.com/",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },

  "osaka-hirota-kazumi": {
    careerMilestones: [
      {
        label: "5期、福島区選出（会派『福島クラブ』1人会派）",
        content:
          "本人公式サイトおよび大阪維新の会公式メンバーページでは、福島区選出・5期、会派『福島クラブ』（1人会派、維新公式メンバーページにも掲載）と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://hirotano.com/",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },

  "osaka-nishi-takuro": {
    careerMilestones: [
      {
        label: "2期、会派『大阪にし』（1人会派）",
        content:
          "大阪市会公式名簿では、2期、会派『大阪にし』（1人会派）、市政改革委員会所属と記載されている。",
        source: "大阪市会公式議員名簿",
        sourceUrl: "https://www.city.osaka.lg.jp/shikai/category/3060-3-5-0-0-0-0-0-0-0.html",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },

  "osaka-satake-riho": {
    careerMilestones: [
      {
        label: "1期、淀川区選出（会派『総活躍社会実現の会』1人会派）",
        content:
          "本人公式サイトでは、淀川区選出・1期、会派『総活躍社会実現の会』（1人会派）と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://satakeriho.info/",
        verifiedAt: VERIFIED_AT,
      },
      {
        label: "略歴・本業",
        content:
          "本人公式サイトでは、シスメックス株式会社、メディア放送局を経て28歳で起業、株式会社エスリンクス代表取締役と記載されている。",
        source: "本人公式サイト",
        sourceUrl: "https://satakeriho.info/",
        verifiedAt: VERIFIED_AT,
      },
    ],
  },
};

// ====== 適用 ======
const file = "data/member-overrides.json";
const data = JSON.parse(readFileSync(file, "utf-8"));

let applied = 0;
let skipped = 0;
const ids = Object.keys(patches);

for (const override of data.overrides) {
  if (!ids.includes(override.id)) continue;
  const patch = patches[override.id];
  if (patch.careerMilestones) {
    override.fields.careerMilestones = patch.careerMilestones;
  }
  if (patch.notableQuotes !== undefined) {
    override.fields.notableQuotes = patch.notableQuotes;
  }
  override.appliedAt = VERIFIED_AT;
  applied++;
  console.log(
    `OK : ${override.id}  cm=${patch.careerMilestones?.length ?? 0}  nq=${patch.notableQuotes?.length ?? "(unchanged)"}`,
  );
}

// 未適用の id を検出
for (const id of ids) {
  if (!data.overrides.find((o: { id: string }) => o.id === id)) {
    console.error(`MISS: ${id} (no existing override block — needs manual add)`);
    skipped++;
  }
}

writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
console.log(
  `\nApplied: ${applied}/${ids.length}, skipped: ${skipped}, file written: ${file}`,
);
