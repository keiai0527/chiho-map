/**
 * reason に明示された本人公認SNSアカウントを fields に補完
 *
 * 抽出パターン:
 *   - 「本人X @xxx」「本人Twitter @xxx」「本人運営X @xxx」
 *   - 「本人FB」「Facebook 本人発信」+ URL
 *   - 「本人Instagram」「IG 本人」+ URL
 *
 * 既存 fields.twitterUrl/facebookUrl/instagramUrl/youtubeUrl があればスキップ。
 * 「本人」「公式」のラベルが近接しない @xxx はスキップ（推測禁止）。
 */
import { readFileSync, writeFileSync } from "node:fs";

const VERIFIED_AT = "2026-05-30";
const file = "data/member-overrides.json";

type Override = {
  id: string;
  fields: {
    twitterUrl?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    youtubeUrl?: string;
    dataConfidence?: string;
  } & Record<string, unknown>;
  reason: string;
  appliedAt: string;
};

const data = JSON.parse(readFileSync(file, "utf-8")) as { overrides: Override[] };

let updated = 0;
let added: { id: string; field: string; value: string }[] = [];

for (const override of data.overrides) {
  const conf = override.fields.dataConfidence;
  if (conf !== "verified" && conf !== "partial") continue;
  if (!override.reason) continue;

  const reason = override.reason;
  let touched = false;

  // X（Twitter）：「本人X @xxx」「本人Twitter @xxx」「本人運営X @xxx」「本人発信X @xxx」
  if (!override.fields.twitterUrl) {
    const m = reason.match(
      /本人(?:運営|発信|公式)?(?:X|Twitter|ツイッター)\s*[@＠]([A-Za-z0-9_]{3,})/,
    );
    if (m) {
      const handle = m[1];
      const url = `https://x.com/${handle}`;
      override.fields.twitterUrl = url;
      added.push({ id: override.id, field: "twitterUrl", value: url });
      touched = true;
    }
  }

  // Facebook：「本人Facebook」「本人FB」+ URL
  if (!override.fields.facebookUrl) {
    // facebook.com URL を直接探す
    const m = reason.match(
      /(?:本人|公式)(?:発信|運営|公式)?(?:Facebook|FB)[^a-zA-Z0-9]*?(https?:\/\/(?:www\.)?facebook\.com\/[A-Za-z0-9._-]+)/,
    );
    if (m) {
      override.fields.facebookUrl = m[1];
      added.push({ id: override.id, field: "facebookUrl", value: m[1] });
      touched = true;
    }
  }

  // Instagram：「本人Instagram」「本人IG」+ URL
  if (!override.fields.instagramUrl) {
    const m = reason.match(
      /(?:本人|公式)(?:発信|運営|公式)?(?:Instagram|IG|インスタ)[^a-zA-Z0-9]*?(https?:\/\/(?:www\.)?instagram\.com\/[A-Za-z0-9._-]+)/,
    );
    if (m) {
      override.fields.instagramUrl = m[1];
      added.push({ id: override.id, field: "instagramUrl", value: m[1] });
      touched = true;
    }
  }

  // YouTube：「本人YouTube」+ URL
  if (!override.fields.youtubeUrl) {
    const m = reason.match(
      /(?:本人|公式)(?:発信|運営|公式)?YouTube[^a-zA-Z0-9]*?(https?:\/\/(?:www\.)?youtube\.com\/[A-Za-z0-9._@/-]+)/,
    );
    if (m) {
      override.fields.youtubeUrl = m[1];
      added.push({ id: override.id, field: "youtubeUrl", value: m[1] });
      touched = true;
    }
  }

  if (touched) {
    override.appliedAt = VERIFIED_AT;
    updated++;
  }
}

writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
console.log(`\nUpdated ${updated} overrides with ${added.length} SNS links:`);
for (const a of added) console.log(`  ${a.id} ${a.field}: ${a.value}`);
