/**
 * 5市の現職議長・副議長を反映
 *
 * 既存 override 4名: 最新の議長/副議長就任を careerMilestones に追加
 * 新規 override 4名: 議長/副議長就任を中心とした最低限の override 作成
 *
 * 出典: 公式議会サイト + 信頼できる報道（西日本新聞等）+ 既存 override の本人公式
 */
import { readFileSync, writeFileSync } from "node:fs";

const VERIFIED_AT = "2026-05-30";
const file = "data/member-overrides.json";

type CM = {
  label?: string;
  content: string;
  source: string;
  sourceUrl: string;
  verifiedAt: string;
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

const data = JSON.parse(readFileSync(file, "utf-8")) as {
  overrides: {
    id: string;
    fields: Record<string, unknown> & {
      careerMilestones?: CM[];
      officialSources?: OS[];
    };
    reason: string;
    appliedAt: string;
  }[];
};

// === 1. 既存 override に追加 ===

// 1-A. 長内直也 (osaka-osanai-naoya は誤、正しくは sapporo-osanai-naoya)
const osanai = data.overrides.find((o) => o.id === "sapporo-osanai-naoya");
if (osanai) {
  // 既存 careerMilestones に「第37代議長就任 2025-04-02」を追加
  const existing = osanai.fields.careerMilestones || [];
  existing.push({
    label: "第37代札幌市議会議長（2025-04-02 就任）",
    content:
      "札幌市議会公式によると、令和7年（2025年）4月2日の臨時市議会で第37代札幌市議会議長に選出された。",
    source: "札幌市議会公式 議長と副議長",
    sourceUrl: "https://www.city.sapporo.jp/gikai/html/gichou.html",
    verifiedAt: VERIFIED_AT,
  });
  osanai.fields.careerMilestones = existing;
  osanai.appliedAt = VERIFIED_AT;
  console.log("UPDATED: sapporo-osanai-naoya (第37代議長 追加)");
}

// 1-B. 大阪議長 杉村幸太郎（既存 override があれば追加、無ければ newOverrides で作成）
const sugimura = data.overrides.find((o) => o.id === "osaka-sugimura-kotaro");
if (sugimura) {
  const existing = sugimura.fields.careerMilestones || [];
  // 既に「議長」を含む careerMilestone がなければ追加
  if (!existing.some((cm) => cm.content && cm.content.includes("議長"))) {
    existing.push({
      label: "大阪市会議長（令和8年5月18日時点 現職）",
      content:
        "大阪市会公式の役員委員表（令和8年5月18日現在）では、市会議長として記載されている。",
      source: "大阪市会公式 役員委員表",
      sourceUrl:
        "https://www.city.osaka.lg.jp/shikai/cmsfiles/contents/0000150/150881/20260518iin.pdf",
      verifiedAt: VERIFIED_AT,
    });
    sugimura.fields.careerMilestones = existing;
    sugimura.appliedAt = VERIFIED_AT;
    console.log("UPDATED: osaka-sugimura-kotaro (大阪市会議長 追加)");
  }
}

// 1-C. 大阪副議長 山田正和
const osakaYamada = data.overrides.find(
  (o) => o.id === "osaka-yamada-masakazu",
);
if (osakaYamada) {
  const existing = osakaYamada.fields.careerMilestones || [];
  if (!existing.some((cm) => cm.content && cm.content.includes("副議長"))) {
    existing.push({
      label: "大阪市会副議長（令和8年5月18日時点 現職）",
      content:
        "大阪市会公式の役員委員表（令和8年5月18日現在）では、市会副議長として記載されている。",
      source: "大阪市会公式 役員委員表",
      sourceUrl:
        "https://www.city.osaka.lg.jp/shikai/cmsfiles/contents/0000150/150881/20260518iin.pdf",
      verifiedAt: VERIFIED_AT,
    });
    osakaYamada.fields.careerMilestones = existing;
    osakaYamada.appliedAt = VERIFIED_AT;
    console.log("UPDATED: osaka-yamada-masakazu (大阪市会副議長 追加)");
  }
}

// === 2. 新規 override の追加 ===

// 2-A. 札幌副議長 村上ゆうこ
const newOverrides = [
  {
    id: "sapporo-murakami-yuko",
    fields: {
      careerMilestones: [
        {
          label: "第43代札幌市議会副議長（2025-04-02 就任）",
          content:
            "札幌市議会公式によると、令和7年（2025年）4月2日の臨時市議会で第43代札幌市議会副議長に選出された。",
          source: "札幌市議会公式 議長と副議長",
          sourceUrl: "https://www.city.sapporo.jp/gikai/html/gichou.html",
          verifiedAt: VERIFIED_AT,
        },
      ],
      officialSources: [
        {
          kind: "council_official" as const,
          label: "札幌市議会公式 議員一覧",
          url: "https://www.city.sapporo.jp/gikai/meibo/meibo-50on.html",
          verifiedAt: VERIFIED_AT,
        },
      ],
      dataConfidence: "verified" as const,
      hasProvisionalData: false,
      lastVerifiedAt: VERIFIED_AT,
    },
    reason:
      "札幌市議会公式（city.sapporo.jp/gikai/html/gichou.html）確認。第43代札幌市議会副議長（2025年4月2日就任）。",
    appliedAt: VERIFIED_AT,
  },

  // 2-B. 名古屋議長 小出昭司
  {
    id: "nagoya-koide-shoji",
    fields: {
      careerMilestones: [
        {
          label: "名古屋市会議長",
          content:
            "名古屋市会公式『議長・副議長』ページによると、現職の名古屋市会議長に就任している。",
          source: "名古屋市会公式 議長・副議長",
          sourceUrl:
            "https://www.city.nagoya.jp/shikai/category/322-0-0-0-0-0-0-0-0-0.html",
          verifiedAt: VERIFIED_AT,
        },
      ],
      officialSources: [
        {
          kind: "council_official" as const,
          label: "名古屋市会公式 議員名簿",
          url: "https://www.city.nagoya.jp/shikai/category/333-0-0-0-0-0-0-0-0-0.html",
          verifiedAt: VERIFIED_AT,
        },
      ],
      dataConfidence: "verified" as const,
      hasProvisionalData: false,
      lastVerifiedAt: VERIFIED_AT,
    },
    reason:
      "名古屋市会公式（www.city.nagoya.jp/shikai/category/322-0-0-0-0-0-0-0-0-0.html）確認。現職の名古屋市会議長。",
    appliedAt: VERIFIED_AT,
  },

  // 2-C. 名古屋副議長 森ともお
  {
    id: "nagoya-mori-tomoo",
    fields: {
      careerMilestones: [
        {
          label: "名古屋市会副議長",
          content:
            "名古屋市会公式『議長・副議長』ページによると、現職の名古屋市会副議長に就任している。",
          source: "名古屋市会公式 議長・副議長",
          sourceUrl:
            "https://www.city.nagoya.jp/shikai/category/322-0-0-0-0-0-0-0-0-0.html",
          verifiedAt: VERIFIED_AT,
        },
      ],
      officialSources: [
        {
          kind: "council_official" as const,
          label: "名古屋市会公式 議員名簿",
          url: "https://www.city.nagoya.jp/shikai/category/333-0-0-0-0-0-0-0-0-0.html",
          verifiedAt: VERIFIED_AT,
        },
      ],
      dataConfidence: "verified" as const,
      hasProvisionalData: false,
      lastVerifiedAt: VERIFIED_AT,
    },
    reason:
      "名古屋市会公式（www.city.nagoya.jp/shikai/category/322-0-0-0-0-0-0-0-0-0.html）確認。現職の名古屋市会副議長。",
    appliedAt: VERIFIED_AT,
  },

  // 2-D2. 大阪議長 杉村幸太郎（既存 override がない場合に作成）
  {
    id: "osaka-sugimura-kotaro",
    fields: {
      careerMilestones: [
        {
          label: "大阪市会議長（令和8年5月18日時点 現職）",
          content:
            "大阪市会公式の役員委員表（令和8年5月18日現在）では、市会議長として記載されている。",
          source: "大阪市会公式 役員委員表",
          sourceUrl:
            "https://www.city.osaka.lg.jp/shikai/cmsfiles/contents/0000150/150881/20260518iin.pdf",
          verifiedAt: VERIFIED_AT,
        },
      ],
      officialSources: [
        {
          kind: "council_official" as const,
          label: "大阪市会公式 役員委員表（PDF）",
          url: "https://www.city.osaka.lg.jp/shikai/page/0000150881.html",
          verifiedAt: VERIFIED_AT,
        },
      ],
      dataConfidence: "verified" as const,
      hasProvisionalData: false,
      lastVerifiedAt: VERIFIED_AT,
    },
    reason:
      "大阪市会公式 役員委員表（令和8年5月18日現在）確認。市会議長として記載。",
    appliedAt: VERIFIED_AT,
  },

  // 2-D3. 大阪副議長 山田正和
  {
    id: "osaka-yamada-masakazu",
    fields: {
      careerMilestones: [
        {
          label: "大阪市会副議長（令和8年5月18日時点 現職）",
          content:
            "大阪市会公式の役員委員表（令和8年5月18日現在）では、市会副議長として記載されている。",
          source: "大阪市会公式 役員委員表",
          sourceUrl:
            "https://www.city.osaka.lg.jp/shikai/cmsfiles/contents/0000150/150881/20260518iin.pdf",
          verifiedAt: VERIFIED_AT,
        },
      ],
      officialSources: [
        {
          kind: "council_official" as const,
          label: "大阪市会公式 役員委員表（PDF）",
          url: "https://www.city.osaka.lg.jp/shikai/page/0000150881.html",
          verifiedAt: VERIFIED_AT,
        },
      ],
      dataConfidence: "verified" as const,
      hasProvisionalData: false,
      lastVerifiedAt: VERIFIED_AT,
    },
    reason:
      "大阪市会公式 役員委員表（令和8年5月18日現在）確認。市会副議長として記載。",
    appliedAt: VERIFIED_AT,
  },

  // 2-D. 福岡議長 平畑雅博
  {
    id: "fukuoka-hirahata-masahiro",
    fields: {
      careerMilestones: [
        {
          label: "福岡市議会議長（自民党福岡市議団より選出）",
          content:
            "福岡市議会公式の議員個別ページ（gikai.city.fukuoka.lg.jp/hirahata_masahiro）に掲載されている現職議員。自民党福岡市議団より福岡市議会議長に選出された旨が報道（西日本新聞）で確認できる。",
          source: "福岡市議会公式 議員個別ページ",
          sourceUrl: "https://gikai.city.fukuoka.lg.jp/hirahata_masahiro",
          verifiedAt: VERIFIED_AT,
        },
      ],
      officialSources: [
        {
          kind: "council_official" as const,
          label: "福岡市議会公式 議員個別ページ",
          url: "https://gikai.city.fukuoka.lg.jp/hirahata_masahiro",
          verifiedAt: VERIFIED_AT,
        },
        {
          kind: "party_official" as const,
          label: "自由民主党 福岡市議団",
          url: "https://www.jimin-fukuokacity.com/members/",
          verifiedAt: VERIFIED_AT,
        },
      ],
      dataConfidence: "verified" as const,
      hasProvisionalData: false,
      lastVerifiedAt: VERIFIED_AT,
      officialProfileUrl: "https://gikai.city.fukuoka.lg.jp/hirahata_masahiro",
    },
    reason:
      "福岡市議会公式（gikai.city.fukuoka.lg.jp/hirahata_masahiro）+ 自民党福岡市議団公式 確認。福岡市議会議長に選出。",
    appliedAt: VERIFIED_AT,
  },
];

let added = 0;
for (const newO of newOverrides) {
  const exists = data.overrides.find((o) => o.id === newO.id);
  if (exists) {
    console.log(`SKIP (already exists): ${newO.id}`);
    continue;
  }
  data.overrides.push(newO);
  added++;
  console.log(`ADDED: ${newO.id}`);
}

writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
console.log(`\nDone. ${added} new overrides added.`);
