import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MemberSearch } from "@/components/MemberSearch";
import {
  getCities,
  getCity,
  getKaihaMap,
  getMembersByCity,
  getParties,
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
    title: `${c.name}の市議会議員一覧`,
    description: `${c.councilName}の議員 約${c.approxMemberCount}名を会派・選挙区別に検索・絞り込み。`,
    alternates: { canonical: `/${c.id}` },
  };
}

export default async function CityPage({ params }: { params: Params }) {
  const { city } = await params;
  const c = await getCity(city as CityId);
  if (!c) notFound();

  const members = await getMembersByCity(city as CityId);
  const parties = await getParties();
  const kaihaMap = await getKaihaMap(city as CityId);

  // 選挙区一覧（公式名簿に出てきた順を保ちつつ重複除去）
  const districtSet = new Set<string>();
  for (const m of members) districtSet.add(m.electoralDistrict);
  const districts = [...districtSet];

  // 会派一覧（マスタ順）
  const kaihaList = [...kaihaMap.values()].map((k) => ({
    id: k.id,
    name: k.name,
    shortName: k.shortName,
  }));

  // データを client component に渡せる形に変換
  const memberViews = members.map((m) => ({
    id: m.id,
    name: m.name,
    nameKana: m.nameKana,
    partyId: m.partyId,
    parliamentaryGroupId: m.parliamentaryGroupId,
    electoralDistrict: m.electoralDistrict,
    termsServed: m.termsServed,
    hasOfficialLink: Boolean(m.officialProfileUrl || m.websiteUrl),
    hasSnsLink: Boolean(
      m.twitterUrl || m.facebookUrl || m.instagramUrl || m.youtubeUrl,
    ),
    hasCareerMilestones: Boolean(
      m.careerMilestones && m.careerMilestones.length > 0,
    ),
  }));

  const partyViews = parties.map((p) => ({
    id: p.id,
    name: p.name,
    shortName: p.shortName,
    color: p.color,
  }));

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

      <header className="mb-6">
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

      <aside className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        <p>
          <span className="mr-1 rounded bg-amber-200 px-1.5 py-0.5 font-bold">
            β版
          </span>
          {c.councilName}の公式名簿（取得日: 2026年5月29日）をもとに作成しています。
          <strong>
            複数政党の合同会派に所属する議員の政党表示、ふりがな、当選回数等に暫定情報を含む場合があります
          </strong>
          。 公式名簿:{" "}
          <a
            href={c.sources.byKaiha}
            target="_blank"
            rel="noopener"
            className="underline-offset-2 hover:underline"
          >
            {c.councilName} 会派別名簿 →
          </a>
          {" / "}
          <Link href="/about" className="underline-offset-2 hover:underline">
            データの注意点
          </Link>
        </p>
      </aside>

      {members.length === 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          <p className="font-medium">データ収集中</p>
        </div>
      ) : (
        <Suspense fallback={<StaticMemberList members={memberViews} parties={partyViews} kaihaList={kaihaList} />}>
          <MemberSearch
            members={memberViews}
            parties={partyViews}
            kaihaList={kaihaList}
            districts={districts}
          />
        </Suspense>
      )}

      {/* SEO / クローラ用：JS 無効環境でも議員一覧が見えるよう noscript で出力 */}
      {members.length > 0 && (
        <noscript>
          <StaticMemberList
            members={memberViews}
            parties={partyViews}
            kaihaList={kaihaList}
          />
        </noscript>
      )}
    </main>
  );
}

// Server-rendered fallback：MemberSearch（client）が読み込まれるまでに表示。
// SEO/SNSクローラ・JS無効環境でも議員一覧を可視化する役割を兼ねる。
function StaticMemberList({
  members,
  parties,
  kaihaList,
}: {
  members: {
    id: string;
    name: string;
    partyId: string;
    parliamentaryGroupId: string;
    electoralDistrict: string;
    hasCareerMilestones?: boolean;
  }[];
  parties: { id: string; shortName: string; color: string }[];
  kaihaList: { id: string; shortName: string }[];
}) {
  const partyMap = new Map(parties.map((p) => [p.id, p]));
  const kaihaMap = new Map(kaihaList.map((k) => [k.id, k]));
  return (
    <div>
      <p className="mb-2 text-xs text-slate-500">
        {members.length}名 該当 / 全{members.length}名（読み込み中。検索機能はJavaScript有効化後に利用可能）
      </p>
      <ul className="space-y-1.5 text-sm">
        {members.map((m) => {
          const party = partyMap.get(m.partyId);
          const kaiha = kaihaMap.get(m.parliamentaryGroupId);
          return (
            <li key={m.id}>
              <Link
                href={`/giin/${m.id}`}
                className="flex items-center gap-2 rounded border border-slate-200 bg-white p-2 hover:border-slate-300"
              >
                <span
                  className="h-1 w-8 shrink-0 rounded"
                  style={{ backgroundColor: party?.color ?? "#94a3b8" }}
                />
                <span className="font-medium text-slate-900">{m.name}</span>
                {m.hasCareerMilestones && (
                  <span className="rounded bg-emerald-100 px-1 py-0.5 text-[10px] text-emerald-800">
                    整備済
                  </span>
                )}
                <span className="text-xs text-slate-500">
                  {party?.shortName ?? "不明"} ／ {m.electoralDistrict}
                </span>
                <span className="text-[10px] text-slate-400">
                  {kaiha?.shortName ?? ""}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
