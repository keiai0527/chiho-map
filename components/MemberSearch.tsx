"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface PartyView {
  id: string;
  name: string;
  shortName: string;
  color: string;
}

interface KaihaView {
  id: string;
  name: string;
  shortName: string;
}

interface MemberView {
  id: string;
  name: string;
  nameKana?: string;
  partyId: string;
  parliamentaryGroupId: string;
  electoralDistrict: string;
  termsServed?: number;
  hasOfficialLink: boolean;
  hasSnsLink: boolean;
}

interface Props {
  members: MemberView[];
  parties: PartyView[];
  kaihaList: KaihaView[];
  districts: string[];
}

/**
 * 名前/政党/会派/選挙区/SNSあり/プロフィールあり で議員を絞り込む。
 * 完全クライアントサイドのフィルタ。データ件数 < 100 なので十分に高速。
 */
export function MemberSearch({ members, parties, kaihaList, districts }: Props) {
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");
  const [partyId, setPartyId] = useState<string>("");
  const [kaihaId, setKaihaId] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [snsOnly, setSnsOnly] = useState(false);
  const [profileOnly, setProfileOnly] = useState(false);

  // URL クエリパラメータから初期値を読み込む（郵便番号検索からの遷移用）
  useEffect(() => {
    const d = searchParams.get("district");
    const p = searchParams.get("party");
    const k = searchParams.get("kaiha");
    const qq = searchParams.get("q");
    if (d && districts.includes(d)) setDistrict(d);
    if (p && parties.some((x) => x.id === p)) setPartyId(p);
    if (k && kaihaList.some((x) => x.id === k)) setKaihaId(k);
    if (qq) setQ(qq);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const partyMap = useMemo(
    () => new Map(parties.map((p) => [p.id, p])),
    [parties],
  );
  const kaihaMap = useMemo(
    () => new Map(kaihaList.map((k) => [k.id, k])),
    [kaihaList],
  );

  const filtered = useMemo(() => {
    const qq = q.trim();
    return members.filter((m) => {
      if (qq) {
        const hay = `${m.name} ${m.nameKana ?? ""}`.toLowerCase();
        if (!hay.includes(qq.toLowerCase())) return false;
      }
      if (partyId && m.partyId !== partyId) return false;
      if (kaihaId && m.parliamentaryGroupId !== kaihaId) return false;
      if (district && m.electoralDistrict !== district) return false;
      if (snsOnly && !m.hasSnsLink) return false;
      if (profileOnly && !m.hasOfficialLink) return false;
      return true;
    });
  }, [members, q, partyId, kaihaId, district, snsOnly, profileOnly]);

  const reset = () => {
    setQ("");
    setPartyId("");
    setKaihaId("");
    setDistrict("");
    setSnsOnly(false);
    setProfileOnly(false);
  };

  const hasAnyFilter =
    q || partyId || kaihaId || district || snsOnly || profileOnly;

  return (
    <div>
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="mb-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">
              氏名・ふりがな
            </span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="例: 山田 / やまだ"
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">
              政党
            </span>
            <select
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              className="w-full rounded border border-slate-300 px-2 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              <option value="">すべて</option>
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">
              会派
            </span>
            <select
              value={kaihaId}
              onChange={(e) => setKaihaId(e.target.value)}
              className="w-full rounded border border-slate-300 px-2 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              <option value="">すべて</option>
              {kaihaList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.shortName}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">
              選挙区
            </span>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full rounded border border-slate-300 px-2 py-2 text-sm focus:border-slate-500 focus:outline-none"
            >
              <option value="">すべて</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={profileOnly}
              onChange={(e) => setProfileOnly(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span>公式プロフィールあり</span>
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={snsOnly}
              onChange={(e) => setSnsOnly(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span>SNSあり</span>
          </label>
          {hasAnyFilter && (
            <button
              type="button"
              onClick={reset}
              className="ml-auto rounded border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50"
            >
              条件をリセット
            </button>
          )}
        </div>

        <p className="mt-3 text-xs text-slate-500">
          {filtered.length}名 該当 / 全{members.length}名
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
          該当する議員が見つかりませんでした。
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => {
            const party = partyMap.get(m.partyId);
            const kaiha = kaihaMap.get(m.parliamentaryGroupId);
            return (
              <li key={m.id}>
                <Link
                  href={`/giin/${m.id}`}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-slate-300"
                >
                  <div
                    className="h-1 w-12 shrink-0 rounded"
                    style={{ backgroundColor: party?.color ?? "#94a3b8" }}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {m.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {party?.shortName ?? "不明"} ／ {m.electoralDistrict}
                    </p>
                    <p className="truncate text-[10px] text-slate-400">
                      {kaiha?.shortName ?? ""}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
