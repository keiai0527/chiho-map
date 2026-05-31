import Link from "next/link";
import { getStats } from "@/lib/server-store";

export const dynamic = "force-dynamic";

function Card({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: number | string;
  href?: string;
  accent?: boolean;
}) {
  const inner = (
    <div
      className={`bg-surface border rounded p-4 ${
        accent ? "border-accent" : "border-border"
      }`}
    >
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`text-2xl font-bold ${
          accent ? "text-accent" : "text-primary"
        }`}
      >
        {value}
      </p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function DashboardPage() {
  const stats = await getStats();
  const openTakedowns =
    stats.takedownsByStatus.received +
    stats.takedownsByStatus.under_review +
    stats.takedownsByStatus.consultation_started;

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-base font-bold text-primary mb-3">概況</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card label="今月の新規投稿" value={stats.last30Days.newReviews} />
          <Card
            label="事前審査待ち"
            value={stats.queuePending}
            href="/op-console-demo/moderation"
            accent={stats.queuePending > 0}
          />
          <Card
            label="削除依頼（受付中）"
            value={openTakedowns}
            href="/op-console-demo/takedowns"
            accent={openTakedowns > 0}
          />
          <Card label="平均TAT（時間）" value={stats.avgTurnaroundHours} />
        </div>
      </section>

      <section>
        <h2 className="text-base font-bold text-primary mb-3">
          削除依頼の状況別件数
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          {[
            ["受付", stats.takedownsByStatus.received],
            ["審査中", stats.takedownsByStatus.under_review],
            ["意見照会中", stats.takedownsByStatus.consultation_started],
            ["承認", stats.takedownsByStatus.approved],
            ["却下", stats.takedownsByStatus.rejected],
          ].map(([label, value]) => (
            <div
              key={label as string}
              className="bg-surface border border-border rounded p-3"
            >
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-bold text-primary">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-base font-bold text-primary mb-3">累計</h2>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="bg-surface border border-border rounded p-3">
            <p className="text-xs text-muted-foreground">公開済み口コミ</p>
            <p className="text-lg font-bold text-primary">{stats.publishedReviews}</p>
          </div>
          <div className="bg-surface border border-border rounded p-3">
            <p className="text-xs text-muted-foreground">削除済み口コミ</p>
            <p className="text-lg font-bold text-primary">{stats.removedReviews}</p>
          </div>
          <div className="bg-surface border border-border rounded p-3">
            <p className="text-xs text-muted-foreground">判断ログ累計</p>
            <p className="text-lg font-bold text-primary">{stats.totalLogs}</p>
          </div>
        </div>
      </section>

      <nav className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <Link
          href="/op-console-demo/moderation"
          className="bg-surface border border-border rounded p-3 hover:border-accent"
        >
          → 事前審査キュー
        </Link>
        <Link
          href="/op-console-demo/takedowns"
          className="bg-surface border border-border rounded p-3 hover:border-accent"
        >
          → 削除依頼一覧
        </Link>
        <Link
          href="/op-console-demo/logs"
          className="bg-surface border border-border rounded p-3 hover:border-accent"
        >
          → 判断ログ
        </Link>
      </nav>
    </div>
  );
}
