import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-900">
        ページが見つかりません
      </h1>
      <p className="mt-3 text-sm text-slate-600">
        指定された議員または市が登録されていないようです。
      </p>
      <Link
        href="/"
        className="mt-6 inline-block text-sm text-slate-700 underline-offset-2 hover:underline"
      >
        トップページへ戻る
      </Link>
    </main>
  );
}
