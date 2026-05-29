import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8 text-xs leading-relaxed text-slate-600 sm:py-10">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
            β版
          </span>
          <span className="text-slate-500">2026年5月29日 公開・データ整備中</span>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">
              このサイトについて
            </h3>
            <p>
              地方議員マップ（chihogiin.jp）は、政令指定都市の市議会議員を会派・選挙区・政党横断で一覧できる
              <strong>個人運営の非公式情報サイト</strong>です。
            </p>
            <p>
              国会議員マップ（
              <a
                href="https://kokkaimap.jp"
                target="_blank"
                rel="noopener"
                className="underline-offset-2 hover:underline"
              >
                kokkaimap.jp
              </a>
              ）の地方議員バージョン。
            </p>
            <p className="text-slate-500">
              運営: 中島 真之助（X:{" "}
              <a
                href="https://x.com/kokkai_map"
                target="_blank"
                rel="noopener"
                className="underline-offset-2 hover:underline"
              >
                @kokkai_map
              </a>
              ）
            </p>
            <p>
              <Link
                href="/about"
                className="underline-offset-2 hover:underline"
              >
                運営者・データ出典・免責事項・訂正依頼の詳細 →
              </Link>
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900">
              中立性と訂正依頼
            </h3>
            <p>
              本サイトは特定の政党・会派・議員の影響を受けず、中立な立場で情報を整理しています。
            </p>
            <p>
              掲載情報は各市議会の公式名簿をもとに2026年5月29日時点で作成しています。
              一部、政党・ふりがな・期数等に暫定情報を含みます（詳細は{" "}
              <Link href="/about" className="underline-offset-2 hover:underline">
                このサイトについて
              </Link>
              ）。
            </p>
            <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
              <p className="font-medium">訂正依頼フォーム 準備中</p>
              <p className="mt-0.5">
                開設までの当面、X の{" "}
                <a
                  href="https://x.com/kokkai_map"
                  target="_blank"
                  rel="noopener"
                  className="underline-offset-2 hover:underline"
                >
                  @kokkai_map
                </a>{" "}
                DMで受付。
              </p>
            </div>
            <p className="text-slate-500">
              現時点では広告・スポンサーを掲載していません。将来クラウドファンディング等の市民支援を検討する場合があります（編集方針に影響する支援は受け付けません）。
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-4 text-slate-500">
          © 2026 地方議員マップ ｜
          このサイトは Vercel 上にホスティングされています ｜
          出典: 各市議会公式ウェブサイト
        </div>
      </div>
    </footer>
  );
}
