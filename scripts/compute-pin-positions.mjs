import { readFileSync } from 'node:fs';

const svg = readFileSync('/Users/keiai/Desktop/chiho-map/public/japan-map.svg', 'utf-8');

const cities = [
  { name: '札幌', code: '1' },
  { name: '横浜', code: '14' },
  { name: '名古屋', code: '23' },
  { name: '大阪', code: '27' },
  { name: '福岡', code: '40' },
];

const svgTransform = { a: 1.028807, b: 0, c: 0, d: 1.028807, e: -47.544239, f: -28.806583 };
const prefTransform = { a: 1, b: 0, c: 0, d: 1, e: 6, f: 18 };

function applyT(t, x, y) {
  return { x: t.a*x + t.c*y + t.e, y: t.b*x + t.d*y + t.f };
}

for (const { name, code } of cities) {
  const tag = `data-code="${code}"`;
  const start = svg.indexOf(tag);
  const gOpenStart = svg.lastIndexOf('<g', start);
  const gOpenEnd = svg.indexOf('>', start);
  const gHeader = svg.slice(gOpenStart, gOpenEnd + 1);
  const tMatch = gHeader.match(/transform="translate\(([^,]+),\s*([^)]+)\)"/);
  const localTx = tMatch ? parseFloat(tMatch[1]) : 0;
  const localTy = tMatch ? parseFloat(tMatch[2]) : 0;
  const gCloseEnd = svg.indexOf('</g>', gOpenEnd);
  const gContent = svg.slice(gOpenEnd, gCloseEnd);
  const polyRegex = /points="([^"]+)"/g;
  let m;
  const allPoints = [];
  while ((m = polyRegex.exec(gContent)) !== null) {
    // 点列は "x1 y1 x2 y2 ..." 形式
    const nums = m[1].trim().split(/\s+/).map(Number);
    for (let i = 0; i + 1 < nums.length; i += 2) {
      if (!isNaN(nums[i]) && !isNaN(nums[i+1])) allPoints.push({ x: nums[i], y: nums[i+1] });
    }
  }
  if (allPoints.length === 0) { console.log(`${name}: 0 points`); continue; }

  const xs = allPoints.map(p=>p.x), ys = allPoints.map(p=>p.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2;

  let p = { x: cx + localTx, y: cy + localTy };
  p = applyT(prefTransform, p.x, p.y);
  p = applyT(svgTransform, p.x, p.y);

  console.log(`${name}(${code}): pts=${allPoints.length}, viewBox=(${p.x.toFixed(0)},${p.y.toFixed(0)}), %=(${(p.x/10).toFixed(1)}%, ${(p.y/10).toFixed(1)}%)`);
}
