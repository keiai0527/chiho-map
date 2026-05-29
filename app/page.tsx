import Link from "next/link";
import { getCities, getMembersByCity } from "@/lib/data";
import type { CityId } from "@/lib/types";

export const revalidate = false;

export default async function Home() {
  const cities = await getCities();
  const counts = await Promise.all(
    cities.map(async (c) => {
      const members = await getMembersByCity(c.id as CityId);
      return { id: c.id, count: members.length };
    }),
  );
  const totalReal = counts.reduce((sum, c) => sum + c.count, 0);
  const totalApprox = cities.reduce((sum, c) => sum + c.approxMemberCount, 0);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
      <header className="mb-10 sm:mb-14">
        <p className="mb-2 text-xs font-medium tracking-widest text-slate-500">
          CHIHOGIIN.JP
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          地方議員マップ
        </h1>
        <p className="mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
          あなたの街の市議会議員を、会派・選挙区・政党横断で一覧。
          まずは政令指定都市5市から。
        </p>
        <p className="mt-2 text-sm text-slate-500">
          国会議員マップ（
          <a
            href="https://kokkaimap.jp"
            target="_blank"
            rel="noopener"
            className="text-slate-700 underline-offset-2 hover:underline"
          >
            kokkaimap.jp
          </a>
          ）の地方議員バージョンです。
        </p>
      </header>

      <section
        aria-label="サイトの状態"
        className="mb-10 rounded-xl border border-amber-200 bg-amber-50 p-5 sm:mb-12"
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-900">
            β版
          </span>
          <span className="text-sm font-semibold text-amber-900">
            このサイトの現状
          </span>
        </div>
        <ul className="space-y-1.5 text-sm text-amber-900">
          <li className="flex gap-2">
            <span aria-hidden>•</span>
            <span>
              <strong>対応は5市のみ</strong>（大阪・名古屋・横浜・福岡・札幌）。
              他の政令指定都市は順次拡張予定です。
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden>•</span>
            <span>
              <strong>各市議会公式名簿をもとに作成</strong>しています（取得日:
              2026年5月29日）。
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden>•</span>
            <span>
              <strong>一部に暫定表示があります</strong>。
              複数政党の合同会派に所属する議員の政党表示、公式名簿に振り仮名が無い議員のふりがな等は推定値を含みます（
              <Link
                href="/about"
                className="underline-offset-2 hover:underline"
              >
                詳細
              </Link>
              ）。
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden>•</span>
            <span>
              <strong>誤りを見つけたら訂正依頼を</strong>。
              専用フォームを準備中。当面は X の{" "}
              <a
                href="https://x.com/kokkai_map"
                target="_blank"
                rel="noopener"
                className="underline-offset-2 hover:underline"
              >
                @kokkai_map
              </a>{" "}
              DMで受付。
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden>•</span>
            <span>
              <strong>非公式・個人運営の情報サイト</strong>です。各市議会・自治体が運営する公式サイトではありません。
            </span>
          </li>
        </ul>
      </section>

      <section className="mb-6 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-slate-900">対応市</h2>
        <p className="text-sm text-slate-500">
          掲載 {totalReal} / 想定 {totalApprox} 名
        </p>
      </section>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((c) => {
          const count = counts.find((x) => x.id === c.id)?.count ?? 0;
          return (
            <li key={c.id}>
              <Link
                href={`/${c.id}`}
                className="block rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-sm"
              >
                <p className="text-xs font-medium tracking-widest text-slate-500">
                  {c.councilName}
                </p>
                <h3 className="mt-1 text-xl font-bold text-slate-900">
                  {c.name}
                </h3>
                <p className="mt-3 text-sm text-slate-600">
                  掲載 {count} / 全 {c.approxMemberCount} 名
                </p>
              </Link>
            </li>
          );
        })}
      </ul>

    </main>
  );
}
