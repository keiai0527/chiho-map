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
