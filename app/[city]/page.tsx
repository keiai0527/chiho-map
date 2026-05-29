import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCities,
  getCity,
  getMembersByCity,
  getPartyMap,
} from "@/lib/data";
import type { CityId } from "@/lib/types";

export const revalidate = false;
export const dynamicParams = false;

export async function generateStaticParams() {
  const cities = await getCities();
  return cities.map((c) => ({ city: c.id }));
}

type Params = Promise<{ city: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { city } = await params;
  const c = await getCity(city as CityId);
  if (!c) return {};
  return {
    title: `${c.name}の市議会議員一覧 | 地方議員マップ`,
    description: `${c.councilName}の議員 約${c.approxMemberCount}名を会派・選挙区別に掲載。`,
  };
}

export default async function CityPage({ params }: { params: Params }) {
  const { city } = await params;
  const c = await getCity(city as CityId);
  if (!c) notFound();

  const members = await getMembersByCity(city as CityId);
  const partyMap = await getPartyMap();

  // 会派でグルーピング
  const byKaiha = new Map<string, typeof members>();
  for (const m of members) {
    const list = byKaiha.get(m.parliamentaryGroupId) ?? [];
    list.push(m);
    byKaiha.set(m.parliamentaryGroupId, list);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <nav className="mb-6 text-sm">
        <Link
          href="/"
          className="text-slate-500 underline-offset-2 hover:underline"
        >
          ← 地方議員マップ
        </Link>
      </nav>

      <header className="mb-8">
        <p className="text-xs font-medium tracking-widest text-slate-500">
          {c.councilName}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          {c.name}の市議会議員
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          掲載 {members.length} / 想定 {c.approxMemberCount} 名
        </p>
      </header>

      {members.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-medium">データ収集中</p>
          <p className="mt-1">
            {c.councilName}の議員データは現在収集中です。
            公式名簿:{" "}
            <a
              href={c.sources.byKaiha}
              target="_blank"
              rel="noopener"
              className="underline-offset-2 hover:underline"
            >
              {c.sources.byKaiha}
            </a>
          </p>
        </div>
      )}

      {members.length > 0 && (
        <div className="space-y-8">
          {[...byKaiha.entries()].map(([kaihaId, list]) => (
            <section key={kaihaId}>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                {kaihaId}
                <span className="ml-2 text-sm font-normal text-slate-500">
                  {list.length}名
                </span>
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((m) => {
                  const party = partyMap.get(m.partyId);
                  return (
                    <li key={m.id}>
                      <Link
                        href={`/giin/${m.id}`}
                        className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-slate-300"
                      >
                        <div
                          className="h-1 w-12 shrink-0 rounded"
                          style={{
                            backgroundColor: party?.color ?? "#94a3b8",
                          }}
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">
                            {m.name}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {party?.shortName ?? "不明"} ／{" "}
                            {m.electoralDistrict}
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
