#!/usr/bin/env tsx
/**
 * 地方議員マップ データ品質監査
 *
 * 使い方: npm run audit
 * error が1件でも出たらデプロイしてはいけない。
 *
 * 国会議員マップ（diet-map）の scripts/audit/ パターンを踏襲。
 */

import { promises as fs } from "node:fs";
import path from "node:path";

interface Member {
  id: string;
  cityId: string;
  name: string;
  partyId: string;
  parliamentaryGroupId: string;
  electoralDistrict: string;
  source: { url: string; fetchedAt: string };
}

interface Party {
  id: string;
  name: string;
}

interface SourcesFile {
  cities: Array<{
    id: string;
    name: string;
    approxMemberCount: number;
  }>;
}

interface ExpectedFile {
  expectations: Array<{
    cityId: string;
    totalApprox: number;
    byParty: Record<string, number>;
  }>;
}

interface Finding {
  level: "error" | "warning" | "info";
  check: string;
  message: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const findings: Finding[] = [];

function add(level: Finding["level"], check: string, message: string) {
  findings.push({ level, check, message });
}

async function readJson<T>(rel: string): Promise<T> {
  return JSON.parse(await fs.readFile(path.join(DATA_DIR, rel), "utf-8")) as T;
}

async function loadAllMembers(cityIds: string[]): Promise<Member[]> {
  const all: Member[] = [];
  for (const id of cityIds) {
    try {
      const list = await readJson<Member[]>(`members/${id}.json`);
      all.push(...list);
    } catch {
      add(
        "warning",
        "load_members",
        `members/${id}.json が読めない or 存在しない`,
      );
    }
  }
  return all;
}

async function main() {
  const sources = await readJson<SourcesFile>("sources.json");
  const parties = await readJson<Party[]>("parties.json");
  const expected = await readJson<ExpectedFile>(
    "audit/expected-party-counts.json",
  );
  const cityIds = sources.cities.map((c) => c.id);
  const partyIds = new Set(parties.map((p) => p.id));
  const members = await loadAllMembers(cityIds);

  // ── 1. counts: 市別の議員数を表示
  for (const c of sources.cities) {
    const list = members.filter((m) => m.cityId === c.id);
    const ratio = list.length / c.approxMemberCount;
    if (list.length === 0) {
      add(
        "info",
        "counts",
        `${c.name}: 掲載 0 / 想定 ${c.approxMemberCount}（未収集）`,
      );
    } else if (ratio < 0.95) {
      add(
        "warning",
        "counts",
        `${c.name}: 掲載 ${list.length} / 想定 ${c.approxMemberCount}（5%以上少ない）`,
      );
    } else if (ratio > 1.05) {
      add(
        "error",
        "counts",
        `${c.name}: 掲載 ${list.length} / 想定 ${c.approxMemberCount}（多すぎ・重複疑い）`,
      );
    }
  }

  // ── 2. unique ids: 議員IDの一意性
  const idSet = new Set<string>();
  for (const m of members) {
    if (idSet.has(m.id)) {
      add("error", "unique_ids", `重複ID: ${m.id}`);
    }
    idSet.add(m.id);
  }

  // ── 3. party_consistency: partyId がマスタに存在するか
  for (const m of members) {
    if (!partyIds.has(m.partyId)) {
      add(
        "error",
        "party_consistency",
        `${m.id} の partyId "${m.partyId}" が parties.json に存在しない`,
      );
    }
  }

  // ── 4. required_fields: 必須項目の存在チェック
  for (const m of members) {
    if (!m.name) add("error", "required_fields", `${m.id}: name が空`);
    if (!m.electoralDistrict) {
      add(
        "error",
        "required_fields",
        `${m.id}: electoralDistrict が空`,
      );
    }
    if (!m.parliamentaryGroupId) {
      add(
        "error",
        "required_fields",
        `${m.id}: parliamentaryGroupId が空（無所属でも独立した会派IDを必須）`,
      );
    }
    if (!m.source?.url) {
      add("error", "required_fields", `${m.id}: source.url が空`);
    }
  }

  // ── 5. expected_party_counts: 市×政党 の期待値乖離
  for (const exp of expected.expectations) {
    const cityMembers = members.filter((m) => m.cityId === exp.cityId);
    if (cityMembers.length === 0) continue; // 未収集はスキップ
    for (const [partyId, expCount] of Object.entries(exp.byParty)) {
      const actual = cityMembers.filter((m) => m.partyId === partyId).length;
      const diff = actual - expCount;
      if (Math.abs(diff) >= 3) {
        add(
          "warning",
          "expected_party_counts",
          `${exp.cityId} ${partyId}: 期待 ${expCount} / 実際 ${actual}（差 ${diff}）`,
        );
      }
    }
  }

  // ── 6. id_format: id が cityId-slug の形式か
  for (const m of members) {
    if (!m.id.startsWith(`${m.cityId}-`)) {
      add(
        "error",
        "id_format",
        `${m.id}: cityId "${m.cityId}" で始まっていない`,
      );
    }
  }

  // ── レポート出力
  const errors = findings.filter((f) => f.level === "error");
  const warnings = findings.filter((f) => f.level === "warning");
  const infos = findings.filter((f) => f.level === "info");

  console.log("\n📊 地方議員マップ データ品質監査\n");
  console.log(`総議員数: ${members.length}`);
  console.log(`対応市数: ${cityIds.length}\n`);

  if (errors.length > 0) {
    console.log(`❌ ERROR (${errors.length}件)`);
    for (const f of errors) console.log(`   [${f.check}] ${f.message}`);
    console.log();
  }
  if (warnings.length > 0) {
    console.log(`⚠️  WARNING (${warnings.length}件)`);
    for (const f of warnings) console.log(`   [${f.check}] ${f.message}`);
    console.log();
  }
  if (infos.length > 0) {
    console.log(`ℹ️  INFO (${infos.length}件)`);
    for (const f of infos) console.log(`   [${f.check}] ${f.message}`);
    console.log();
  }

  if (errors.length === 0) {
    console.log("✅ error 0件。デプロイ可能です。");
  } else {
    console.log(
      `❌ error ${errors.length}件。修正してからデプロイしてください。`,
    );
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
