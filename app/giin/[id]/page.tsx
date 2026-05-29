import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllMembers,
  getCity,
  getKaihaMap,
  getMemberById,
  getPartyMap,
} from "@/lib/data";

export const revalidate = false;
export const dynamicParams = false;

export async function generateStaticParams() {
  const all = await getAllMembers();
  return all.map((m) => ({ id: m.id }));
}

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const m = await getMemberById(id);
  if (!m) return {};
  const c = await getCity(m.cityId);
  return {
    title: `${m.name}（${c?.name ?? ""}市議）`,
    description: `${c?.councilName ?? ""}議員 ${m.name}（${m.electoralDistrict}）のプロフィール`,
    alternates: { canonical: `/giin/${m.id}` },
  };
}

export default async function MemberPage({ params }: { params: Params }) {
  const { id } = await params;
  const m = await getMemberById(id);
  if (!m) notFound();

  const c = await getCity(m.cityId);
  const partyMap = await getPartyMap();
  const party = partyMap.get(m.partyId);
  const kaihaMap = await getKaihaMap(m.cityId);
  const kaiha = kaihaMap.get(m.parliamentaryGroupId);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <nav className="mb-6 text-sm">
        <Link
          href={`/${m.cityId}`}
          className="text-slate-500 underline-offset-2 hover:underline"
        >
          ← {c?.name ?? ""}の議員一覧
        </Link>
      </nav>

      <div
        className="mb-6 h-2 rounded"
        style={{ backgroundColor: party?.color ?? "#94a3b8" }}
      />

      <h1 className="text-3xl font-bold text-slate-900">{m.name}</h1>
      {m.nameKana && (
        <p className="mt-1 text-sm text-slate-500">{m.nameKana}</p>
      )}

      <dl className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
        <div className="grid grid-cols-3 gap-2 py-3 text-sm">
          <dt className="text-slate-500">議会</dt>
          <dd className="col-span-2 text-slate-900">{c?.councilName ?? ""}</dd>
        </div>
        <div className="grid grid-cols-3 gap-2 py-3 text-sm">
          <dt className="text-slate-500">政党</dt>
          <dd className="col-span-2 text-slate-900">
            {party?.name ?? "不明"}
          </dd>
        </div>
        <div className="grid grid-cols-3 gap-2 py-3 text-sm">
          <dt className="text-slate-500">会派</dt>
          <dd className="col-span-2 text-slate-900">
            {kaiha?.name ?? m.parliamentaryGroupId}
          </dd>
        </div>
        <div className="grid grid-cols-3 gap-2 py-3 text-sm">
          <dt className="text-slate-500">選挙区</dt>
          <dd className="col-span-2 text-slate-900">{m.electoralDistrict}</dd>
        </div>
        {m.termsServed != null && (
          <div className="grid grid-cols-3 gap-2 py-3 text-sm">
            <dt className="text-slate-500">当選回数</dt>
            <dd className="col-span-2 text-slate-900">{m.termsServed}</dd>
          </div>
        )}
      </dl>

      <div className="mt-6 space-y-2 text-sm">
        {m.officialProfileUrl && (
          <p>
            <a
              href={m.officialProfileUrl}
              target="_blank"
              rel="noopener"
              className="text-slate-700 underline-offset-2 hover:underline"
            >
              {c?.councilName ?? ""} 公式プロフィール →
            </a>
          </p>
        )}
        {m.websiteUrl && (
          <p>
            <a
              href={m.websiteUrl}
              target="_blank"
              rel="noopener"
              className="text-slate-700 underline-offset-2 hover:underline"
            >
              個人サイト →
            </a>
          </p>
        )}
        {m.twitterUrl && (
          <p>
            <a
              href={m.twitterUrl}
              target="_blank"
              rel="noopener"
              className="text-slate-700 underline-offset-2 hover:underline"
            >
              X (Twitter) →
            </a>
          </p>
        )}
      </div>

      <p className="mt-10 text-xs text-slate-400">
        出典: {m.source.url} ({m.source.fetchedAt})
      </p>
    </main>
  );
}
