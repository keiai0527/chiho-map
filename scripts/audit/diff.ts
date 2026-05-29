#!/usr/bin/env tsx
/**
 * 前回 snapshot との差分を表示。
 * 大量の追加・削除があったら警告。
 */

import { promises as fs } from "node:fs";
import path from "node:path";

const SNAP_DIR = path.join(process.cwd(), "data", "audit", "snapshots");

interface Snapshot {
  takenAt: string;
  totalMembers: number;
  byCity: Array<{ cityId: string; count: number }>;
  byParty: Array<{ partyId: string; count: number }>;
  ids: string[];
}

async function loadCurrentData(): Promise<Snapshot> {
  const sources = JSON.parse(
    await fs.readFile(path.join(process.cwd(), "data", "sources.json"), "utf-8"),
  ) as { cities: Array<{ id: string }> };

  const all: Array<{ id: string; cityId: string; partyId: string }> = [];
  for (const c of sources.cities) {
    try {
      const list = JSON.parse(
        await fs.readFile(
          path.join(process.cwd(), "data", "members", `${c.id}.json`),
          "utf-8",
        ),
      );
      all.push(...list);
    } catch {
      // empty
    }
  }

  return {
    takenAt: new Date().toISOString(),
    totalMembers: all.length,
    byCity: sources.cities.map((c) => ({
      cityId: c.id,
      count: all.filter((m) => m.cityId === c.id).length,
    })),
    byParty: Object.entries(
      all.reduce<Record<string, number>>((acc, m) => {
        acc[m.partyId] = (acc[m.partyId] ?? 0) + 1;
        return acc;
      }, {}),
    ).map(([partyId, count]) => ({ partyId, count })),
    ids: all.map((m) => m.id).sort(),
  };
}

async function main() {
  let prev: Snapshot;
  try {
    prev = JSON.parse(
      await fs.readFile(path.join(SNAP_DIR, "latest.json"), "utf-8"),
    ) as Snapshot;
  } catch {
    console.log(
      "ℹ️  latest.json なし。最初に npm run snapshot を実行してください。",
    );
    return;
  }

  const curr = await loadCurrentData();
  const prevIds = new Set(prev.ids);
  const currIds = new Set(curr.ids);
  const added = curr.ids.filter((id) => !prevIds.has(id));
  const removed = prev.ids.filter((id) => !currIds.has(id));

  console.log(`\n📊 前回スナップショット (${prev.takenAt}) との差分\n`);
  console.log(`総数: ${prev.totalMembers} → ${curr.totalMembers}`);

  if (added.length > 0) {
    console.log(`\n➕ 追加 ${added.length}名`);
    added.slice(0, 20).forEach((id) => console.log(`   ${id}`));
    if (added.length > 20) console.log(`   ... 他 ${added.length - 20}名`);
  }
  if (removed.length > 0) {
    console.log(`\n➖ 削除 ${removed.length}名`);
    removed.slice(0, 20).forEach((id) => console.log(`   ${id}`));
    if (removed.length > 20) console.log(`   ... 他 ${removed.length - 20}名`);
  }

  // 急変警告
  const ratio = curr.totalMembers / Math.max(prev.totalMembers, 1);
  if (prev.totalMembers > 0 && (ratio < 0.8 || ratio > 1.2)) {
    console.log(
      `\n⚠️  WARNING: 議員数が前回比 ${(ratio * 100).toFixed(1)}% に急変。スクレイパー破損か？`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
