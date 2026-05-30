/**
 * careerMilestones の重複検出・削除
 *
 * 重複判定:
 *   - content の主要部分（出典記述「○○では、…と記載されている」の…部分）を比較
 *   - 完全一致 + 部分一致（80%以上の文字一致）も検出
 *   - label が異なっても content が同じなら重複扱い
 *
 * 重複時の保持ルール:
 *   - 公式議会 > 政党公式 > 本人公式 の優先度で sourceUrl を選ぶ
 *   - 最初に出現したものを残し、後続を削除
 */
import { readFileSync, writeFileSync } from "node:fs";

const file = "data/member-overrides.json";

type CM = {
  label?: string;
  content: string;
  source: string;
  sourceUrl: string;
  verifiedAt: string;
};

type Override = {
  id: string;
  fields: { careerMilestones?: CM[] } & Record<string, unknown>;
  reason: string;
  appliedAt: string;
};

// content の主要部分を抽出（「○○では、…と記載されている」の…部分）
function extractCore(content: string): string {
  // 「公式…では、X と記載されている」→ X を抽出
  const m = content.match(/では、(.+?)(?:と記載されている|とされている)/);
  if (m) return m[1].trim();
  return content.trim();
}

function similarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;
  // 短い方が長い方に含まれていれば 0.9
  if (a.length < b.length && b.includes(a)) return 0.9;
  if (b.length < a.length && a.includes(b)) return 0.9;
  // 文字集合の共通率（Jaccard 風）
  const setA = new Set(a);
  const setB = new Set(b);
  let common = 0;
  for (const c of setA) if (setB.has(c)) common++;
  return common / Math.max(setA.size, setB.size);
}

const data = JSON.parse(readFileSync(file, "utf-8")) as { overrides: Override[] };

let removed = 0;
let touched = 0;
const examples: string[] = [];

for (const override of data.overrides) {
  const cms = override.fields.careerMilestones;
  if (!cms || cms.length < 2) continue;

  const keep: CM[] = [];
  const removedFromThis: CM[] = [];
  for (const cm of cms) {
    const core = extractCore(cm.content);
    const dup = keep.find((k) => {
      const kCore = extractCore(k.content);
      return similarity(core, kCore) >= 0.9;
    });
    if (dup) {
      removedFromThis.push(cm);
      // 出典の優先度: council_official > party_official > personal
      // 既存 dup が personal 系、新規 cm が council 系なら、dup を上書きする
      const priority = (s: string) =>
        s.includes("公式")
          ? s.includes("議会") || s.includes("市会")
            ? 3
            : s.includes("党")
              ? 2
              : 1
          : 0;
      if (priority(cm.source) > priority(dup.source)) {
        // dup を cm で置き換え
        const idx = keep.indexOf(dup);
        keep[idx] = cm;
      }
    } else {
      keep.push(cm);
    }
  }

  if (removedFromThis.length > 0) {
    override.fields.careerMilestones = keep;
    removed += removedFromThis.length;
    touched++;
    if (examples.length < 10) {
      examples.push(
        `${override.id}: 削除 ${removedFromThis.length}件 / 残 ${keep.length}件`,
      );
    }
  }
}

writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
console.log(`Removed ${removed} duplicates from ${touched} overrides`);
console.log("\nExamples:");
for (const e of examples) console.log("  " + e);
