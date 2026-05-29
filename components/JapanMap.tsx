import Link from "next/link";

interface CityInfo {
  id: "sapporo" | "yokohama" | "nagoya" | "osaka" | "fukuoka";
  name: string;
  count: number;
  /** SVG 上の位置（%）。viewBox 0 0 1000 1000 の japan-map.svg に合わせる */
  left: string;
  top: string;
  /** 地方別カラー（kokkaimap.jp と同系統） */
  regionColor: string;
  region: string;
}

/**
 * 5市の地図上の位置（%）。
 * geolonia/japanese-prefectures の SVG（viewBox 0 0 1000 1000）に合わせて補正。
 */
const cities: CityInfo[] = [
  {
    id: "sapporo",
    name: "札幌",
    count: 67,
    left: "75%",
    top: "18%",
    regionColor: "#0ea5e9",
    region: "北海道",
  },
  {
    id: "yokohama",
    name: "横浜",
    count: 86,
    left: "82%",
    top: "63%",
    regionColor: "#10b981",
    region: "関東",
  },
  {
    id: "nagoya",
    name: "名古屋",
    count: 68,
    left: "75%",
    top: "64.5%",
    regionColor: "#f59e0b",
    region: "中部",
  },
  {
    id: "osaka",
    name: "大阪",
    count: 81,
    left: "65%",
    top: "65.5%",
    regionColor: "#ef4444",
    region: "近畿",
  },
  {
    id: "fukuoka",
    name: "福岡",
    count: 60,
    left: "28%",
    top: "73%",
    regionColor: "#f97316",
    region: "九州",
  },
];

/**
 * 5市を可視化する日本地図コンポーネント。
 *
 * 地図 SVG: geolonia/japanese-prefectures (GFDL)
 *   https://github.com/geolonia/japanese-prefectures
 *
 * 国会議員マップ（kokkaimap.jp）の地図セクションを参考にしたレイアウト。
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

      <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-lg bg-slate-50">
        {/* 日本地図 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/japan-map.svg"
          alt="日本地図（47都道府県）"
          className="block h-auto w-full"
        />

        {/* 5市のピン（absolute overlay）。dot を (left, top) % 位置の中心に置く */}
        {cities.map((c) => (
          <Link
            key={c.id}
            href={`/${c.id}`}
            aria-label={`${c.name}市の議員一覧へ（${c.count}名）`}
            className="group absolute z-10"
            style={{ left: c.left, top: c.top }}
          >
            {/* dot を中心に、バッジは右下に流す */}
            <div className="relative">
              <span
                className="block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-150"
                style={{ backgroundColor: c.regionColor }}
                aria-hidden
              />
              <span className="absolute left-2 top-1 flex items-center gap-1 whitespace-nowrap rounded border border-slate-200 bg-white/95 px-1.5 py-0.5 text-xs shadow-sm">
                <span className="font-bold text-slate-900">{c.name}</span>
                <span
                  className="rounded px-1 py-0.5 text-[9px] font-bold text-white"
                  style={{ backgroundColor: c.regionColor }}
                >
                  {c.count}
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* 凡例 */}
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

      {/* テキストリンク（地図が見づらい時の代替動線） */}
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

      {/* GFDL ライセンス表記 */}
      <p className="mt-3 text-[10px] text-slate-400">
        地図SVG:{" "}
        <a
          href="https://github.com/geolonia/japanese-prefectures"
          target="_blank"
          rel="noopener"
          className="underline-offset-2 hover:underline"
        >
          geolonia/japanese-prefectures
        </a>{" "}
        （
        <a
          href="https://www.gnu.org/licenses/fdl-1.3.html"
          target="_blank"
          rel="noopener"
          className="underline-offset-2 hover:underline"
        >
          GFDL
        </a>
        ）
      </p>
    </section>
  );
}
