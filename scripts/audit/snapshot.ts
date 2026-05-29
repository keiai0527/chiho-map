#!/usr/bin/env tsx
/**
 * データ状態のスナップショットを保存。
 * npm run diff で前回スナップショットとの差分を確認できる。
 */

import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const SNAP_DIR = path.join(DATA_DIR, "audit", "snapshots");

interface Member {
  id: string;
  cityId: string;
  name: string;
  partyId: string;
  parliamentaryGroupId: string;
  electoralDistrict: string;
}

interface SourcesFile {
  cities: Array<{ id: string; name: string }>;
}

async function main() {
  await fs.mkdir(SNAP_DIR, { recursive: true });
  const sources = JSON.parse(
    await fs.readFile(path.join(DATA_DIR, "sources.json"), "utf-8"),
  ) as SourcesFile;

  const all: Member[] = [];
  for (const c of sources.cities) {
    try {
      const list = JSON.parse(
        await fs.readFile(
          path.join(DATA_DIR, "members", `${c.id}.json`),
          "utf-8",
        ),
      ) as Member[];
      all.push(...list);
    } catch {
      // empty
    }
  }

  const snap = {
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

  const filename = `snapshot-${snap.takenAt.replace(/[:.]/g, "-")}.json`;
  const filepath = path.join(SNAP_DIR, filename);
  await fs.writeFile(filepath, JSON.stringify(snap, null, 2));

  // latest.json を更新（diff の基準点）
  await fs.writeFile(
    path.join(SNAP_DIR, "latest.json"),
    JSON.stringify(snap, null, 2),
  );

  console.log(`✅ snapshot saved: ${filename}`);
  console.log(`   total: ${snap.totalMembers}`);
  for (const c of snap.byCity) {
    console.log(`   ${c.cityId}: ${c.count}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
