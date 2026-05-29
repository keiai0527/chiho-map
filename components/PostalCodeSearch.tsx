"use client";

import Link from "next/link";
import { useState } from "react";

interface ZipResult {
  address1: string; // 都道府県
  address2: string; // 市区町村
  address3: string; // 町域
}

interface CityMatch {
  cityId: "osaka" | "nagoya" | "yokohama" | "fukuoka" | "sapporo";
  cityName: string;
  district: string;
}

/**
 * zipcloud API のレスポンス address2 から、本サイト対応5市の (cityId, district) を判定。
 * 5市外は null。
 */
function parseAddress(address2: string): CityMatch | null {
  const cityMap: Record<string, CityMatch["cityId"]> = {
    "大阪市": "osaka",
    "名古屋市": "nagoya",
    "横浜市": "yokohama",
    "福岡市": "fukuoka",
    "札幌市": "sapporo",
  };
  for (const [prefix, cityId] of Object.entries(cityMap)) {
    if (address2.startsWith(prefix)) {
      // 表記揺れ吸収（保土ヶ谷↔保土ケ谷）
      const district = address2.replace(prefix, "").replace("ヶ", "ケ");
      return {
        cityId,
        cityName: prefix.replace("市", "") + "市",
        district,
      };
    }
  }
  return null;
}

export function PostalCodeSearch() {
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [match, setMatch] = useState<CityMatch | null>(null);
  const [outside, setOutside] = useState<{ pref: string; city: string } | null>(
    null,
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMatch(null);
    setOutside(null);
    const digits = raw.replace(/[^0-9]/g, "");
    if (digits.length !== 7) {
      setError("郵便番号は7桁の数字で入力してください（例: 530-0001）");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${digits}`,
        { cache: "force-cache" },
      );
      const json = (await res.json()) as {
        status: number;
        message: string | null;
        results: ZipResult[] | null;
      };
      if (json.status !== 200) {
        setError(json.message ?? "検索に失敗しました");
        return;
      }
      if (!json.results || json.results.length === 0) {
        setError("該当する住所が見つかりませんでした");
        return;
      }
      const top = json.results[0];
      const m = parseAddress(top.address2);
      if (m) {
        setMatch(m);
      } else {
        setOutside({ pref: top.address1, city: top.address2 });
      }
    } catch {
      setError("通信に失敗しました。時間をおいて再試行してください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      aria-label="郵便番号からあなたの街の議員を検索"
      className="mb-10 rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
    >
      <h2 className="mb-1 text-lg font-bold text-slate-900">
        郵便番号から あなたの街の議員を探す
      </h2>
      <p className="mb-2 text-xs text-slate-500">
        7桁の郵便番号を入力すると、その住所の市区を推定して該当議員一覧へ案内します。
        対応は5市（大阪・名古屋・横浜・福岡・札幌）のみ。
      </p>
      <p className="mb-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
        ⚠️ 本機能は<strong>郵便番号から「市区」を推定</strong>するもので、
        選挙区そのものを確定するものではありません。
        郵便番号と行政区の関係には境界・複数区にまたがる地域もあり得ます。
        <strong>選挙区の最終確認は、各市議会公式情報・選挙管理委員会公式情報をご確認ください</strong>。
      </p>

      <form onSubmit={onSubmit} className="flex flex-wrap gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="例: 530-0001"
          aria-label="郵便番号"
          className="flex-1 min-w-[12rem] rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {loading ? "検索中…" : "検索"}
        </button>
      </form>

      {error && (
        <p className="mt-3 rounded bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      {match && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p>
            該当地域: <strong>{match.cityName} {match.district}</strong>
          </p>
          <p className="mt-2">
            <Link
              href={`/${match.cityId}?district=${encodeURIComponent(match.district)}`}
              className="font-medium text-emerald-800 underline-offset-2 hover:underline"
            >
              {match.cityName}の議員一覧で {match.district} 選出議員を見る →
            </Link>
          </p>
        </div>
      )}

      {outside && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p>
            <strong>{outside.pref}{outside.city}</strong>{" "}
            は本サイトの現在の対応範囲外です。
          </p>
          <p className="mt-1 text-xs">
            本サイトは2026年5月時点で大阪市・名古屋市・横浜市・福岡市・札幌市の5市のみ対応しています。
            他の政令指定都市は順次拡張予定です。
          </p>
        </div>
      )}

      <p className="mt-3 text-[10px] text-slate-400">
        住所判定: zipcloud API（株式会社アイビス）を使用。郵便番号のみ送信、個人情報は送信しません。
      </p>
    </section>
  );
}
