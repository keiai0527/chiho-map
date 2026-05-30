import Link from "next/link";
import { JapanMap } from "@/components/JapanMap";
import { PostalCodeSearch } from "@/components/PostalCodeSearch";
import { getCities, getMembersByCity } from "@/lib/data";
import type { CityId } from "@/lib/types";

export const revalidate = false;

export default async function Home() {
  const cities = await getCities();
  const counts = await Promise.all(
    cities.map(async (c) => {
      const members = await getMembersByCity(c.id as CityId);
      const cmCount = members.filter(
        (m) => m.careerMilestones && m.careerMilestones.length > 0,
      ).length;
      return { id: c.id, count: members.length, cmCount };
    }),
  );
  const totalReal = counts.reduce((sum, c) => sum + c.count, 0);
  const totalApprox = cities.reduce((sum, c) => sum + c.approxMemberCount, 0);
  const totalCm = counts.reduce((sum, c) => sum + c.cmCount, 0);

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
        className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5"
      >
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded bg-amber-200 px-2 py-0.5 text-xs font-bold text-amber-900">
            β版（機能拡張中・データ整備中）
          </span>
        </div>
        <p className="mb-3 text-sm text-amber-900">
          本サイトは現在β版です。「β版＝情報が薄い」という意味ではなく、
          <strong>基礎データから段階的に機能・情報を拡張中</strong>の意味です。
          下記の「現在掲載中／今後追加予定」をご参照ください。
        </p>
        <ul className="space-y-1.5 text-sm text-amber-900">
          <li className="flex gap-2">
            <span aria-hidden>•</span>
            <span>
              <strong>対応は5市のみ</strong>（大阪・名古屋・横浜・福岡・札幌）。
              他の政令指定都市は順次拡張予定。
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden>•</span>
            <span>
              <strong>各市議会公式名簿をもとに作成</strong>（取得日: 2026年5月29日）。
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden>•</span>
            <span>
              <strong>一部に暫定表示があります</strong>。
              合同会派の政党表示・推定ふりがな等（
              <Link href="/about" className="underline-offset-2 hover:underline">
                詳細
              </Link>
              ）。
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden>•</span>
            <span>
              <strong>誤りを見つけたら訂正依頼を</strong>。各議員ページに窓口あり。
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden>•</span>
            <span>
              <strong>非公式・個人運営の情報サイト</strong>です。各市議会・自治体の公式サイトではありません。
            </span>
          </li>
        </ul>
      </section>

      <div className="mb-10">
        <JapanMap />
      </div>

      <PostalCodeSearch />

      <section
        aria-label="掲載項目"
        className="mb-10 grid gap-4 sm:mb-12 sm:grid-cols-2"
      >
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="mb-2 text-sm font-semibold text-emerald-900">
            ✓ 現在掲載中の情報
          </h2>
          <ul className="space-y-1 text-sm text-emerald-900">
            <li>・氏名 / ふりがな</li>
            <li>・所属市議会 / 所属政党 / 所属会派 / 選挙区</li>
            <li>・当選回数（5市の主要議員 100名以上）</li>
            <li>・<strong>経歴・役職（議長歴・委員会・党/会派内役職）約118名分</strong></li>
            <li>・<strong>所属委員会（5市すべて全議員 362名分）</strong></li>
            <li>・公式SNS（X / Facebook / Instagram / YouTube）</li>
            <li>・本人公式サイト / 事務所サイト</li>
            <li>・市議会公式 議員プロフィールリンク</li>
            <li>・会議録検索リンク（議員名で本人発言を全件検索）</li>
            <li>・<strong>一次情報の出典リンク集（議会公式 / 政党公式 / 本人公式）約146名分・267件</strong></li>
            <li>・データ信頼度・最終確認日</li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">
            ◯ 今後追加予定の情報
          </h2>
          <ul className="space-y-1 text-sm text-slate-600">
            <li>・本人の議会質問・本会議発言・本人公式SNS投稿・本人ブログの<strong>直接引用</strong>（引用部分は引用として明示。現在の掲載要約とは別形式）</li>
            <li>・議案への賛否記録（市議会公式の採決結果）</li>
            <li>・政策タグ（本人公式発信に基づく分類）</li>
            <li>・経歴・役職カバー率の拡大（残り 約 171名分）</li>
            <li>・主要政策・公約（本人公式発信から）</li>
            <li>・対応市の追加（堺市・千葉市・新潟市など）</li>
          </ul>
        </div>
      </section>

      <section className="mb-6 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-slate-900">対応市</h2>
        <p className="text-sm text-slate-500">
          掲載 {totalReal} / 想定 {totalApprox} 名{" "}
          <span className="ml-1 text-emerald-700">
            （うち経歴・役職 整備済み {totalCm} 名）
          </span>
        </p>
      </section>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((c) => {
          const entry = counts.find((x) => x.id === c.id);
          const count = entry?.count ?? 0;
          const cmCount = entry?.cmCount ?? 0;
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
                {cmCount > 0 && (
                  <p className="mt-1 text-xs text-emerald-700">
                    経歴・役職 整備済み {cmCount} 名
                  </p>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

    </main>
  );
}
