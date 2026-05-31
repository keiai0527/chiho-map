import Link from "next/link";

export const metadata = {
  title: "運営コンソール | 地方議員マップ",
  robots: { index: false, follow: false, nocache: true },
};

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="bg-slate-900 text-slate-100 rounded-md p-4 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs text-slate-400">ADMIN — 地方議員マップ</p>
            <p className="font-bold">運営コンソール</p>
          </div>
          <nav className="flex flex-wrap gap-1 text-xs">
            <Link
              href="/op-console-demo"
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700"
            >
              ダッシュボード
            </Link>
            <Link
              href="/op-console-demo/moderation"
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700"
            >
              事前審査キュー
            </Link>
            <Link
              href="/op-console-demo/takedowns"
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700"
            >
              削除依頼
            </Link>
            <Link
              href="/op-console-demo/logs"
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700"
            >
              判断ログ
            </Link>
          </nav>
        </div>
      </div>

      {/* 審査原則（共通仕様） */}
      <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-6 text-xs leading-relaxed">
        <p className="font-bold text-amber-900 mb-1">⚖️ 審査原則</p>
        <ul className="text-amber-900 space-y-0.5">
          <li>・迷ったら公開しない</li>
          <li>・批判はOK、断定はNG</li>
          <li>・政策批判はOK、人格攻撃はNG</li>
          <li>・公的活動への意見はOK、出自・家族・国籍・宗教はNG</li>
          <li>・違法・犯罪・利権・癒着は、証拠なしならNG</li>
          <li>・口コミの最終判断はAIではなく管理者が行う</li>
        </ul>
      </div>

      {children}
    </div>
  );
}
