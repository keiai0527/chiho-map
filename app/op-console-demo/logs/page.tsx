import { getLogs } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const logs = await getLogs();

  return (
    <div className="space-y-3">
      <h2 className="text-base font-bold text-primary">判断ログ（直近500件）</h2>
      {logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">ログはまだありません。</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {logs.map((l) => (
            <li
              key={l.id}
              className="bg-surface border border-border rounded p-3"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs px-2 py-0.5 bg-muted rounded">
                  {l.actionType}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(l.createdAt).toLocaleString("ja-JP")}
                </span>
              </div>
              <p className="text-sm leading-relaxed mt-1">{l.decisionReason}</p>
              <p className="text-xs text-muted-foreground mt-1">
                操作者: {l.operator}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
