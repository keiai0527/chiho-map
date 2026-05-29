import Link from "next/link";
import { getCities } from "@/lib/data";

export const revalidate = false;

export const metadata = {
  title: "このサイトについて",
  description:
    "地方議員マップの運営者情報・データ出典・免責事項・訂正依頼窓口・中立性宣言。",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const cities = await getCities();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <nav className="mb-6 text-sm">
        <Link
          href="/"
          className="text-slate-500 underline-offset-2 hover:underline"
        >
          ← 地方議員マップ
        </Link>
      </nav>

      <div className="mb-6 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
        β版（2026年5月29日 公開）
      </div>

      <h1 className="text-3xl font-bold text-slate-900">このサイトについて</h1>
      <p className="mt-2 text-sm text-slate-500">最終更新: 2026年5月29日</p>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-slate-900">地方議員マップとは</h2>
        <p className="text-sm leading-relaxed text-slate-700">
          地方議員マップ（chihogiin.jp）は、政令指定都市の市議会議員を会派・選挙区・政党横断で
          一覧できる<strong>個人運営の非公式情報サイト</strong>です。
        </p>
        <p className="text-sm leading-relaxed text-slate-700">
          2026年5月時点で対応している市：大阪市・名古屋市・横浜市・福岡市・札幌市の5市。
          順次他の政令指定都市にも拡張予定です。
        </p>
        <p className="text-sm leading-relaxed text-slate-700">
          国会議員版は{" "}
          <a
            href="https://kokkaimap.jp"
            target="_blank"
            rel="noopener"
            className="text-slate-900 underline-offset-2 hover:underline"
          >
            kokkaimap.jp
          </a>{" "}
          で公開しています。
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-slate-900">運営者情報</h2>
        <dl className="divide-y divide-slate-200 border-y border-slate-200 text-sm">
          <div className="grid grid-cols-3 gap-2 py-3">
            <dt className="text-slate-500">運営</dt>
            <dd className="col-span-2 text-slate-900">中島 真之助（個人）</dd>
          </div>
          <div className="grid grid-cols-3 gap-2 py-3">
            <dt className="text-slate-500">連絡</dt>
            <dd className="col-span-2 text-slate-900">
              <a
                href="https://x.com/kokkai_map"
                target="_blank"
                rel="noopener"
                className="underline-offset-2 hover:underline"
              >
                X: @kokkai_map
              </a>
              （DMで受け付けます）
            </dd>
          </div>
          <div className="grid grid-cols-3 gap-2 py-3">
            <dt className="text-slate-500">運営方針</dt>
            <dd className="col-span-2 text-slate-900">
              現時点では広告・スポンサーを掲載していません。今後、運営継続のためにクラウドファンディング等の市民支援を検討する場合があります。
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-slate-900">データ出典</h2>
        <p className="text-sm leading-relaxed text-slate-700">
          掲載している議員データはすべて各市議会の公式ウェブサイトから取得しています。
          下記が一次情報源です。
        </p>
        <ul className="space-y-2 text-sm">
          {cities.map((c) => (
            <li key={c.id}>
              <span className="font-medium text-slate-900">{c.name}</span>：{" "}
              <a
                href={c.sources.byKaiha}
                target="_blank"
                rel="noopener"
                className="text-slate-700 underline-offset-2 hover:underline"
              >
                {c.councilName} 会派別名簿
              </a>
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-500">
          各議員ページにも個別の取得元URLと取得日を記載しています。
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          データ精度の現状（β版）
        </h2>
        <p className="text-sm leading-relaxed text-slate-700">
          公式名簿からの抽出時点で、一部のデータは暫定値を含みます。今後のアップデートで段階的に精度を上げていきます。
        </p>
        <ul className="list-inside list-disc space-y-1 text-sm leading-relaxed text-slate-700">
          <li>
            氏名・選挙区・所属会派：5市すべて公式名簿から完全取得済み（362名／362名）
          </li>
          <li>
            <strong>政党所属（partyId）</strong>：複数政党の合同会派に所属する議員（合計約60名）については、
            会派名から推定した暫定値を表示しています。今後、各議員の本人発信情報等と照合のうえ修正します。
            該当する会派: 大阪「自由民主党・市民クラブ」「自由民主党・国民民主党・市民とつながる・くらしが第一」、
            札幌「民主市民連合」、名古屋「名古屋民主市会議員団」、福岡「福岡市民クラブ」。
          </li>
          <li>
            <strong>ふりがな</strong>：公式名簿に振り仮名が掲載されていない議員（5市合計約20〜30名）については、
            一般的な読みを推定で表示しています。誤りがあればご指摘ください。
          </li>
          <li>
            <strong>当選回数</strong>：現時点で札幌市のみ掲載。他4市は順次追加予定。
          </li>
          <li>
            <strong>公式プロフィールへのリンク</strong>：現時点で会派別名簿ページへのリンクのみ。個別議員ページへのリンクは順次追加予定。
          </li>
          <li>
            <strong>福岡市</strong>：公式名簿上の現職議員60名を掲載。議員定数62（欠員2の可能性）の差は次回追跡。
          </li>
        </ul>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-slate-900">中立性宣言</h2>
        <p className="text-sm leading-relaxed text-slate-700">
          本サイトは特定の政党・会派・議員・支援団体・宗教団体の影響を受けず、中立な立場で情報を整理しています。
          現在の運営資金は運営者個人が負担しています。
        </p>
        <p className="text-sm leading-relaxed text-slate-700">
          現時点では広告・スポンサーを掲載していません。
          今後、運営継続のためにクラウドファンディング等の市民支援を検討する場合があります。
          その場合も、<strong>編集方針・掲載基準に影響を与える支援は受け付けません</strong>。
          特定の政党・会派・議員に有利または不利な扱いを依頼する条件付きの支援は、金額の多寡にかかわらずお断りします。
        </p>
        <p className="text-sm leading-relaxed text-slate-700">
          特定の議員を有利または不利に扱う意図はありません。
          すべての議員を機械的・公平に表示しています。
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-slate-900">免責事項</h2>
        <p className="text-sm leading-relaxed text-slate-700">
          本サイトの情報は公式名簿をもとに作成していますが、最新の情報と一致しない場合があります
          （会派変更・離党・補欠選挙等は反映が遅れる可能性があります）。
          掲載情報に誤りがあった場合、本サイト運営者は<strong>その結果生じたいかなる損害についても責任を負いません</strong>。
        </p>
        <p className="text-sm leading-relaxed text-slate-700">
          投票・支持判断などの最終的な意思決定は、各市議会の公式情報や本人発信情報を直接ご確認のうえ行ってください。
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-slate-900">訂正・削除依頼</h2>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">専用訂正依頼フォーム 準備中</p>
          <p className="mt-1">
            現在、誰でも訂正依頼を出せる Google フォーム形式の専用窓口を準備中です。
            開設までの当面の間、下記の X DM での受付を継続します。
          </p>
        </div>
        <p className="text-sm leading-relaxed text-slate-700">
          掲載情報の訂正・削除・追加のご依頼は、X の{" "}
          <a
            href="https://x.com/kokkai_map"
            target="_blank"
            rel="noopener"
            className="text-slate-900 underline-offset-2 hover:underline"
          >
            @kokkai_map
          </a>{" "}
          までDMでご連絡ください。可能な限り速やかに確認・対応します。
        </p>
        <p className="text-sm leading-relaxed text-slate-700">
          議員ご本人および関係者からのご連絡を優先的に対応します。
          一次情報源（公式ページのURL等）を併せてお送りいただけると確認がスムーズです。
        </p>
      </section>

      <section className="mt-10 space-y-3">
        <h2 className="text-xl font-bold text-slate-900">プライバシー</h2>
        <p className="text-sm leading-relaxed text-slate-700">
          本サイトは閲覧者の個人情報を収集しません。
          サーバーホスティング（Vercel）が技術的に必要な範囲でアクセスログを保持しますが、
          運営者がそれを閲覧することはありません。Cookie や追跡タグは使用していません。
        </p>
      </section>

      <p className="mt-12 text-xs text-slate-400">
        ソースコードは{" "}
        <a
          href="https://github.com/keiai0527/chiho-map"
          target="_blank"
          rel="noopener"
          className="underline-offset-2 hover:underline"
        >
          GitHub
        </a>{" "}
        で公開しています。
      </p>
    </main>
  );
}
