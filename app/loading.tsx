/**
 * グローバル loading 表示。
 * ページ遷移時にユーザーに「読み込み中」を即時表示し、真っ白画面を回避。
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div
            className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
            aria-hidden
          />
          <p className="text-sm text-slate-600">読み込み中…</p>
        </div>
      </div>
    </div>
  );
}
