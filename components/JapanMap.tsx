import Link from "next/link";

interface CityInfo {
  id: "sapporo" | "yokohama" | "nagoya" | "osaka" | "fukuoka";
  name: string;
  count: number;
  /** SVG x座標 (viewBox 0-600) */
  x: number;
  /** SVG y座標 (viewBox 0-700) */
  y: number;
  /** 地方別カラー（kokkaimap.jp と同系統） */
  regionColor: string;
  region: string;
}

/**
 * 5市の SVG 上の位置。
 * viewBox 600x700。緯度経度から大まかに割り当て:
 *   緯度 33-44 → y 580-150（上下反転）
 *   経度 128-146 → x 100-560
 */
const cities: CityInfo[] = [
  {
    id: "sapporo",
    name: "札幌",
    count: 67,
    x: 441,
    y: 147,
    regionColor: "#0ea5e9", // 北海道=水色
    region: "北海道",
  },
  {
    id: "yokohama",
    name: "横浜",
    count: 86,
    x: 405,
    y: 475,
    regionColor: "#10b981", // 関東=緑
    region: "関東",
  },
  {
    id: "nagoya",
    name: "名古屋",
    count: 68,
    x: 335,
    y: 488,
    regionColor: "#f59e0b", // 中部=オレンジ
    region: "中部",
  },
  {
    id: "osaka",
    name: "大阪",
    count: 81,
    x: 290,
    y: 510,
    regionColor: "#ef4444", // 近畿=赤
    region: "近畿",
  },
  {
    id: "fukuoka",
    name: "福岡",
    count: 60,
    x: 175,
    y: 545,
    regionColor: "#f97316", // 九州=オレンジ
    region: "九州",
  },
];

/**
 * 5市を可視化する日本地図コンポーネント。
 * 国会議員マップ（kokkaimap.jp）の地図セクションを参考にした構成。
 * 簡略化した日本列島SVG + 5市の位置にクリック可能ピン + 議員数バッジ。
 */
export function JapanMap() {
  return (
    <section
      aria-label="日本地図から市を選ぶ"
      className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6"
    >
      <h2 className="mb-1 text-lg font-bold text-slate-900 sm:text-xl">
        日本地図から市を選ぶ
      </h2>
      <p className="mb-4 text-xs text-slate-500">
        地図上のピンをクリックすると、その市の議員一覧を表示します。
        対応は政令指定都市5市から。
      </p>

      <div className="overflow-hidden rounded-lg bg-slate-50">
        <svg
          viewBox="0 0 600 700"
          className="h-auto w-full"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="5市の位置を示す日本地図"
        >
          {/* 沖縄 inset box */}
          <g>
            <rect
              x="20"
              y="280"
              width="100"
              height="90"
              fill="none"
              stroke="#cbd5e1"
              strokeDasharray="3,3"
            />
            <text
              x="70"
              y="295"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="10"
            >
              沖縄県
            </text>
            <path
              d="M 30 335 Q 60 330 80 340 Q 95 348 75 358 Q 45 355 30 345 Z"
              fill="#e2e8f0"
              stroke="#cbd5e1"
            />
          </g>

          {/* 北海道 */}
          <path
            d="M 380 80 Q 430 50 510 80 Q 555 130 530 200 Q 470 230 410 210 Q 370 170 380 120 Z"
            fill="#e0f2fe"
            stroke="#7dd3fc"
            strokeWidth="1.5"
          />

          {/* 本州 (細長くカーブ) */}
          <path
            d="
              M 460 240
              Q 480 270 470 310
              Q 460 360 415 400
              Q 380 430 340 450
              Q 300 470 270 490
              Q 240 510 200 510
              Q 175 510 160 530
              Q 150 540 170 555
              Q 200 555 240 540
              Q 285 525 325 510
              Q 365 490 395 470
              Q 430 445 455 410
              Q 480 380 485 340
              Q 490 290 475 250 Z
            "
            fill="#f3f4f6"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          {/* 四国 */}
          <path
            d="M 290 540 Q 320 535 380 542 Q 385 565 360 575 Q 325 575 290 565 Z"
            fill="#fef3c7"
            stroke="#fcd34d"
            strokeWidth="1.5"
          />

          {/* 九州 */}
          <path
            d="M 130 510 Q 175 495 215 520 Q 240 555 225 605 Q 200 640 155 625 Q 120 595 120 555 Z"
            fill="#ffedd5"
            stroke="#fdba74"
            strokeWidth="1.5"
          />

          {/* ピンとバッジ */}
          {cities.map((c) => (
            <a
              key={c.id}
              href={`/${c.id}`}
              aria-label={`${c.name}市の議員一覧へ（${c.count}名）`}
            >
              <g className="cursor-pointer transition-opacity hover:opacity-80">
                {/* ピンの白い縁 */}
                <circle
                  cx={c.x}
                  cy={c.y}
                  r="9"
                  fill="#ffffff"
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                {/* ピンの色 */}
                <circle cx={c.x} cy={c.y} r="6" fill={c.regionColor} />

                {/* 市名 + 議員数の長方形バッジ */}
                <rect
                  x={c.x + 12}
                  y={c.y - 14}
                  width="76"
                  height="28"
                  rx="4"
                  fill="#ffffff"
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
                <text
                  x={c.x + 20}
                  y={c.y + 5}
                  fontSize="14"
                  fontWeight="700"
                  fill="#0f172a"
                >
                  {c.name}
                </text>
                <rect
                  x={c.x + 56}
                  y={c.y - 7}
                  width="26"
                  height="14"
                  rx="3"
                  fill={c.regionColor}
                />
                <text
                  x={c.x + 69}
                  y={c.y + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill="#ffffff"
                >
                  {c.count}
                </text>
              </g>
            </a>
          ))}
        </svg>
      </div>

      {/* 凡例：地方別カラー */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500">
        <span>地方別カラー</span>
        {cities.map((c) => (
          <span key={c.id} className="inline-flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: c.regionColor }}
              aria-hidden
            />
            {c.region}
          </span>
        ))}
      </div>

      {/* テキストリンク（地図が読みにくい場合用） */}
      <div className="mt-4 grid gap-2 sm:grid-cols-5">
        {cities.map((c) => (
          <Link
            key={c.id}
            href={`/${c.id}`}
            className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <span className="font-medium text-slate-900">{c.name}</span>
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
              style={{ backgroundColor: c.regionColor }}
            >
              {c.count}名
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
