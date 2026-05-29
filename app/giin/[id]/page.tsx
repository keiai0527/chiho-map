import Link from "next/link";
import { notFound } from "next/navigation";
import { CORRECTION_EMAIL, CORRECTION_FORM_URL, TWITTER_URL } from "@/lib/config";
import {
  getAllMembers,
  getCity,
  getKaihaMap,
  getMemberById,
  getPartyMap,
} from "@/lib/data";

export const revalidate = false;
export const dynamicParams = false;

export async function generateStaticParams() {
  const all = await getAllMembers();
  return all.map((m) => ({ id: m.id }));
}

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const m = await getMemberById(id);
  if (!m) return {};
  const c = await getCity(m.cityId);
  return {
    title: `${m.name}（${c?.name ?? ""}市議）`,
    description: `${c?.councilName ?? ""}議員 ${m.name}（${m.electoralDistrict}）のプロフィール`,
    alternates: { canonical: `/giin/${m.id}` },
  };
}

export default async function MemberPage({ params }: { params: Params }) {
  const { id } = await params;
  const m = await getMemberById(id);
  if (!m) notFound();

  const c = await getCity(m.cityId);
  const partyMap = await getPartyMap();
  const party = partyMap.get(m.partyId);
  const kaihaMap = await getKaihaMap(m.cityId);
  const kaiha = kaihaMap.get(m.parliamentaryGroupId);

  const hasAnyOfficialLink = Boolean(
    m.officialProfileUrl ||
      m.websiteUrl ||
      m.twitterUrl ||
      m.facebookUrl ||
      m.instagramUrl ||
      m.youtubeUrl,
  );
  const hasAnyActivity = Boolean(
    (m.committees && m.committees.length > 0) ||
      m.speechRecordUrl ||
      m.voteRecordUrl,
  );
  const hasAnyPolicyTag = Boolean(m.policyTags && m.policyTags.length > 0);
  const hasProfile = Boolean(
    m.birthDate ||
      m.birthPlace ||
      m.biography ||
      (m.education && m.education.length > 0) ||
      (m.career && m.career.length > 0),
  );
  const hasKeyPolicies = Boolean(m.keyPolicies && m.keyPolicies.length > 0);
  const hasNotableQuotes = Boolean(m.notableQuotes && m.notableQuotes.length > 0);

  // 混合会派 partyId 暫定処理に該当する会派ID（types.ts 拡張前の既存データに合わせる）
  const mixedKaihaIds = new Set([
    "osaka-ldp-shimin",
    "osaka-ldp-dpp-tsunagaru",
    "sapporo-minshu",
    "nagoya-minshu",
    "fukuoka-shimin",
  ]);
  const isProvisional =
    m.hasProvisionalData === true || mixedKaihaIds.has(m.parliamentaryGroupId);

  // 推定ふりがなかどうか（簡易判定: kana が name と同一の場合、推定の可能性が高い）
  const kanaSameAsName = m.nameKana && m.nameKana.replace(/\s+/g, "") === m.name.replace(/\s+/g, "");

  const confidence = m.dataConfidence ?? (isProvisional ? "partial" : "estimated");

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <nav className="mb-6 text-sm">
        <Link
          href={`/${m.cityId}`}
          className="text-slate-500 underline-offset-2 hover:underline"
        >
          ← {c?.name ?? ""}の議員一覧
        </Link>
      </nav>

      <div
        className="mb-6 h-2 rounded"
        style={{ backgroundColor: party?.color ?? "#94a3b8" }}
      />

      <header className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-xs">
          <span className="rounded bg-amber-100 px-2 py-0.5 font-semibold text-amber-900">
            β版
          </span>
          <span className="text-slate-500">
            データ整備中 ／ 多くの項目を順次追加予定
          </span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900">{m.name}</h1>
        {m.nameKana && (
          <p className="mt-1 text-sm text-slate-500">{m.nameKana}</p>
        )}
      </header>

      {/* ── 掲載中の情報 ── */}
      <section className="mb-8">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          掲載中の情報
        </h2>
        <dl className="divide-y divide-slate-200 border-y border-slate-200">
          <Row label="議会" value={c?.councilName ?? ""} />
          <Row label="政党" value={party?.name ?? "不明"} />
          <Row label="会派" value={kaiha?.name ?? m.parliamentaryGroupId} />
          <Row label="選挙区" value={m.electoralDistrict} />
          {m.termsServed != null ? (
            <Row label="当選回数" value={`${m.termsServed}期`} />
          ) : (
            <Row label="当選回数" value="未取得（収集中）" muted />
          )}
        </dl>
      </section>

      {/* ── プロフィール・経歴 ── */}
      {hasProfile && (
        <section className="mb-8">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
            プロフィール・経歴
          </h2>
          <dl className="divide-y divide-slate-200 border-y border-slate-200">
            {m.birthDate && <Row label="生年月日" value={m.birthDate} />}
            {m.birthPlace && <Row label="出身地" value={m.birthPlace} />}
            {m.education && m.education.length > 0 && (
              <Row
                label="学歴"
                value={
                  <ul className="space-y-0.5">
                    {m.education.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                }
              />
            )}
            {m.career && m.career.length > 0 && (
              <Row
                label="職歴"
                value={
                  <ul className="space-y-0.5">
                    {m.career.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                }
              />
            )}
          </dl>
          {m.biography && (
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
              {m.biography}
            </p>
          )}
        </section>
      )}

      {/* ── 公式リンク・SNS ── */}
      <section className="mb-8">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          公式リンク・SNS
        </h2>
        {hasAnyOfficialLink ? (
          <ul className="space-y-2 text-sm">
            {m.officialProfileUrl && (
              <LinkRow
                href={m.officialProfileUrl}
                label={`${c?.councilName ?? ""} 公式プロフィール`}
              />
            )}
            {m.websiteUrl && <LinkRow href={m.websiteUrl} label="個人サイト" />}
            {m.twitterUrl && <LinkRow href={m.twitterUrl} label="X (Twitter)" />}
            {m.facebookUrl && <LinkRow href={m.facebookUrl} label="Facebook" />}
            {m.instagramUrl && <LinkRow href={m.instagramUrl} label="Instagram" />}
            {m.youtubeUrl && <LinkRow href={m.youtubeUrl} label="YouTube" />}
          </ul>
        ) : (
          <PendingBlock
            title="公式リンクは収集中です"
            items={[
              `${c?.councilName ?? "市議会"} 公式プロフィール`,
              "個人サイト・事務所サイト",
              "X (Twitter) / Facebook / Instagram / YouTube",
            ]}
          />
        )}
      </section>

      {/* ── 委員会・活動記録 ── */}
      <section className="mb-8">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          委員会・活動記録
        </h2>
        {hasAnyActivity ? (
          <div className="space-y-3 text-sm">
            {m.committees && m.committees.length > 0 && (
              <div>
                <p className="mb-1 text-xs text-slate-500">所属委員会</p>
                <ul className="flex flex-wrap gap-1.5">
                  {m.committees.map((cm) => (
                    <li
                      key={cm}
                      className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                    >
                      {cm}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {m.speechRecordUrl && (
              <LinkRow href={m.speechRecordUrl} label="発言・質問の議事録" />
            )}
            {m.voteRecordUrl && (
              <LinkRow href={m.voteRecordUrl} label="議案への賛否記録" />
            )}
          </div>
        ) : (
          <PendingBlock
            title="活動記録は収集中です"
            items={[
              "所属委員会",
              "本会議・委員会での発言・質問の入口リンク",
              "議案への賛否記録（市議会公式の採決結果）",
            ]}
          />
        )}
      </section>

      {/* ── 主張・政策（深掘り） ── */}
      {hasKeyPolicies && (
        <section className="mb-8">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
            主張・政策
          </h2>
          <ul className="space-y-3 text-sm">
            {m.keyPolicies!.map((p, i) => (
              <li
                key={`${p.category}-${p.title}-${i}`}
                className="rounded-lg border border-slate-200 bg-white p-3"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-900">
                    {p.category}
                  </span>
                  <span className="font-semibold text-slate-900">{p.title}</span>
                </div>
                <p className="text-slate-700">{p.description}</p>
                {p.sourceUrl && (
                  <a
                    href={p.sourceUrl}
                    target="_blank"
                    rel="noopener"
                    className="mt-2 inline-block text-xs text-slate-500 underline-offset-2 hover:underline"
                  >
                    出典 →
                  </a>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-slate-500">
            本人の公式発信・市議会議事録・党公式情報からの要約です。出典URLを各項目に併記しています。
          </p>
        </section>
      )}

      {/* ── 注目発言・実績 ── */}
      {hasNotableQuotes && (
        <section className="mb-8">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
            注目発言・実績
          </h2>
          <ul className="space-y-3 text-sm">
            {m.notableQuotes!.map((q, i) => (
              <li
                key={`${q.date}-${i}`}
                className="rounded-lg border-l-2 border-slate-300 bg-slate-50 p-3"
              >
                <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{q.date}</span>
                  <span>·</span>
                  <span>{q.source}</span>
                </div>
                <p className="text-slate-800">{q.content}</p>
                {q.context && (
                  <p className="mt-1 text-xs text-slate-500">{q.context}</p>
                )}
                {q.sourceUrl && (
                  <a
                    href={q.sourceUrl}
                    target="_blank"
                    rel="noopener"
                    className="mt-2 inline-block text-xs text-slate-500 underline-offset-2 hover:underline"
                  >
                    出典リンク →
                  </a>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-slate-500">
            市議会本会議・委員会議事録、本人公式発信からの引用・要約です。
          </p>
        </section>
      )}

      {/* ── 政策タグ ── */}
      <section className="mb-8">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          政策タグ
        </h2>
        {hasAnyPolicyTag ? (
          <div>
            <ul className="flex flex-wrap gap-1.5">
              {m.policyTags!.map((t) => (
                <li
                  key={t}
                  className="rounded bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-900"
                >
                  #{t}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-slate-500">
              本人の公式ページ・発言・公約に基づくタグです。出典は議員ご本人の公式情報に依拠しています。
              （運営者が自動推定で付与したタグは「暫定」と明示します）
            </p>
          </div>
        ) : (
          <PendingBlock
            title="政策タグは未実装です（運用ポリシー策定中）"
            items={[
              "本人の公式ページ・発言・公約に出典がある内容のみをタグ化",
              "出典URLを各タグに併記",
              "運営者が自動推定したものは「暫定」と明示",
              "（偏向・評価付けを避けるため慎重に運用します）",
            ]}
          />
        )}
      </section>

      {/* ── データ品質 ── */}
      <section className="mb-8">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          データ品質
        </h2>
        <dl className="divide-y divide-slate-200 border-y border-slate-200">
          <Row
            label="信頼度"
            value={
              <ConfidenceBadge value={confidence} />
            }
          />
          <Row
            label="暫定情報"
            value={
              isProvisional ? (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
                  あり（{mixedKaihaIds.has(m.parliamentaryGroupId)
                    ? "合同会派所属、政党は暫定"
                    : kanaSameAsName
                      ? "ふりがな推定"
                      : "暫定要素あり"}
                  ）
                </span>
              ) : (
                <span className="text-slate-500">なし</span>
              )
            }
          />
          <Row
            label="最終確認日"
            value={m.lastVerifiedAt ?? `公式名簿取得日: ${m.source.fetchedAt}`}
          />
        </dl>
      </section>

      {/* ── 出典 ── */}
      <section className="mb-8">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          出典
        </h2>
        <p className="text-xs text-slate-500">
          <a
            href={m.source.url}
            target="_blank"
            rel="noopener"
            className="break-all text-slate-700 underline-offset-2 hover:underline"
          >
            {m.source.url}
          </a>
          {" "}（取得日: {m.source.fetchedAt}）
        </p>
      </section>

      {/* ── 訂正窓口 ── */}
      <aside className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
        <p className="font-medium">この議員の情報に誤り・追加情報があれば</p>
        <ul className="mt-2 space-y-1">
          {CORRECTION_FORM_URL ? (
            <li>
              ・
              <a
                href={CORRECTION_FORM_URL}
                target="_blank"
                rel="noopener"
                className="underline-offset-2 hover:underline"
              >
                訂正依頼フォーム
              </a>
            </li>
          ) : (
            <li>・訂正依頼フォーム（準備中）</li>
          )}
          <li>
            ・
            <a
              href={`mailto:${CORRECTION_EMAIL}?subject=${encodeURIComponent(`【訂正依頼】${m.name}（${c?.name ?? ""}）`)}`}
              className="underline-offset-2 hover:underline"
            >
              {CORRECTION_EMAIL}
            </a>{" "}
            にメール
          </li>
          <li>
            ・X{" "}
            <a
              href={TWITTER_URL}
              target="_blank"
              rel="noopener"
              className="underline-offset-2 hover:underline"
            >
              @kokkai_map
            </a>{" "}
            にDM
          </li>
        </ul>
        <p className="mt-2 text-amber-800">
          一次情報源（公式ページのURL等）を併せてお送りいただけると確認がスムーズです。
        </p>
      </aside>
    </main>
  );
}

// ──── 内部ヘルパー ────

function Row({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 py-3 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className={muted ? "col-span-2 text-slate-400" : "col-span-2 text-slate-900"}>
        {value}
      </dd>
    </div>
  );
}

function LinkRow({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener"
        className="text-slate-700 underline-offset-2 hover:underline"
      >
        {label} →
      </a>
    </li>
  );
}

function PendingBlock({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-xs text-slate-600">
      <p className="font-medium text-slate-700">{title}</p>
      <p className="mt-1 text-slate-500">追加予定の項目:</p>
      <ul className="mt-1 list-inside list-disc space-y-0.5">
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

function ConfidenceBadge({ value }: { value: "verified" | "partial" | "estimated" }) {
  const conf = {
    verified: {
      label: "確認済",
      cls: "bg-emerald-100 text-emerald-900",
      desc: "公式情報と照合済",
    },
    partial: {
      label: "一部暫定",
      cls: "bg-amber-100 text-amber-900",
      desc: "一部のフィールドが暫定（合同会派の政党表示・推定ふりがな等）",
    },
    estimated: {
      label: "初版推定",
      cls: "bg-slate-200 text-slate-700",
      desc: "β初版段階。今後の更新で精度を上げます",
    },
  }[value];
  return (
    <span>
      <span className={`rounded px-2 py-0.5 text-xs ${conf.cls}`}>
        {conf.label}
      </span>
      <span className="ml-2 text-xs text-slate-500">{conf.desc}</span>
    </span>
  );
}
