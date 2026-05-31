"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createDonationCheckout } from "@/app/actions/donate";

const PRESET_AMOUNTS = [
  { value: 500, label: "¥500", desc: "お試し応援" },
  { value: 1000, label: "¥1,000", desc: "基本応援", recommended: true },
  { value: 3000, label: "¥3,000", desc: "中堅応援" },
  { value: 5000, label: "¥5,000", desc: "がっつり応援" },
];

export default function SupportPage() {
  const [selected, setSelected] = useState<number | null>(1000);
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const finalAmount = customAmount.trim()
    ? parseInt(customAmount, 10) || 0
    : selected ?? 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (finalAmount < 100) {
      setError("最低100円から応援いただけます");
      return;
    }
    if (finalAmount > 100000) {
      setError("一度の応援は10万円までとさせていただいています");
      return;
    }
    if (!agreed) {
      setError("ご注意事項の確認にチェックを入れてください");
      return;
    }
    startTransition(async () => {
      try {
        await createDonationCheckout({
          amount: finalAmount,
          donorName: name,
          message,
        });
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "決済セッションの作成に失敗しました",
        );
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-3">
        <p className="text-xs text-accent font-medium">サイトを応援する</p>
        <h1 className="text-2xl font-bold text-primary leading-tight">
          地方議員マップの開発を応援してください
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          ※これは「地方議員マップ」というサービス全体の運営・データ整備への応援です。
          <strong>特定の議員・政党・候補者への寄付ではありません。</strong>
        </p>
      </header>

      {/* 運営者メッセージ */}
      <section className="bg-surface border border-border rounded-md p-5 space-y-3 text-sm leading-relaxed">
        <p>こんにちは。本サイトの運営者です。</p>
        <p>
          「地方議員マップ」は、私（中島 真之助）が
          <strong> 個人で1人 </strong>
          開発・運営しています。
          国会議員マップ（kokkaimap.jp）の地方版として、
          政令指定都市の市議会議員を会派・選挙区・政党横断で検索できるデータベースを目指しています。
        </p>
        <p>
          中立性を保つため、特定の政党・団体・候補者・関連企業・宗教団体・労働組合からの資金提供は一切受けていません。
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900 leading-relaxed space-y-1.5">
          <p className="font-bold">応援金の独立性に関する宣言</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              <strong>応援金の有無や金額</strong>が、議員プロフィール・政策・賛否・口コミ表示・表示順位・検索順位、
              <strong>口コミ審査・訂正対応・編集方針</strong>などに
              <strong>優遇・変更が生じることは一切ありません</strong>。
            </li>
            <li>
              <strong>広告は現時点で一切掲載していません</strong>
              。将来的に必要が生じた場合も、特定政党・候補者・関連企業の広告は掲載せず、導入する際は事前にお知らせします。
            </li>
            <li>
              応援者の方の氏名やメッセージは、ご希望があった場合を除き、公開・第三者提供を行いません。
            </li>
            <li>
              <strong>特定の議員ページや市単位への応援は受け付けていません</strong>
              。サービス全体への応援としてのみ受け付けています（公職選挙法・政治資金規正法上の誤解を避けるため）。
            </li>
          </ul>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded p-4 space-y-2">
          <p className="font-bold text-rose-900">
            運営にかかる主なコスト
          </p>
          <ul className="list-disc pl-5 space-y-0.5 text-rose-900/90 text-xs leading-relaxed">
            <li>サーバー維持費（ホスティング・データベース・ドメイン）</li>
            <li>議員データ整備のためのリサーチ時間</li>
            <li>議事録収集・要約等のための各種ツール利用料</li>
            <li>運営・メンテナンス管理費（更新作業・障害対応）</li>
            <li>その他諸経費（法務確認・通信費 等）</li>
          </ul>
          <p className="text-xs text-rose-900/80 pt-1">
            対応自治体を増やしたり機能を改善するほど、月額の固定費は増えていきます。
          </p>
        </div>
        <p>
          このサイトを使ってよかった、続いてほしい・自治体を増やしてほしいと思っていただけたら、
          無理のない範囲で応援していただけると嬉しいです。
        </p>
      </section>

      {/* 応援フォーム */}
      <form
        onSubmit={submit}
        className="bg-surface border border-border rounded-md p-5 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-primary mb-3">
            応援金額を選んでください
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_AMOUNTS.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => {
                  setSelected(p.value);
                  setCustomAmount("");
                }}
                className={`relative py-3 px-2 rounded border-2 text-center transition ${
                  selected === p.value && !customAmount
                    ? "border-accent bg-accent/10"
                    : "border-border bg-white hover:border-accent/50"
                }`}
              >
                {p.recommended && (
                  <span className="absolute top-0 right-0 -translate-y-1/2 translate-x-1 bg-accent text-white text-[9px] px-1.5 py-0.5 rounded">
                    おすすめ
                  </span>
                )}
                <p className="font-bold text-primary">{p.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {p.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            自由金額（100円〜100,000円）
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">¥</span>
            <input
              type="number"
              min={100}
              max={100000}
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                if (e.target.value) setSelected(null);
              }}
              placeholder="任意の金額を入力"
              className="flex-1 border border-border rounded px-3 py-2 text-sm bg-white"
            />
          </div>
        </div>

        <div className="bg-accent/5 border border-accent/30 rounded p-3 text-center">
          <p className="text-xs text-muted-foreground">応援金額</p>
          <p className="text-2xl font-bold text-accent">
            ¥{finalAmount.toLocaleString()}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            お名前（任意・匿名可）
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="（匿名で応援する場合は空欄でOK）"
            className="w-full border border-border rounded px-3 py-2 text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            運営者へのメッセージ（任意）
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="励まし・要望・追加してほしい自治体・改善提案など、自由にどうぞ"
            className="w-full border border-border rounded px-3 py-2 text-sm bg-white resize-y"
          />
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900 leading-relaxed">
          <p className="font-bold mb-1">ご注意</p>
          <ul className="list-disc pl-5 space-y-0.5">
            <li>
              これは寄付ではなく、地方議員マップというサービス運営への「応援」として受け付けています。
              何らかの返礼や対価をお約束するものではありません。
            </li>
            <li>
              いただいた応援金は<strong>サイト全体の運営費</strong>（サーバー・データ整備・法務等）に充てます。
              <strong>特定の政党・候補者・議員への支援には一切使用しません</strong>。
            </li>
            <li>
              決済はクレジットカードで、Stripe（決済代行）経由となります。当サイトはカード番号を一切保持しません。
            </li>
            <li>
              原則として返金はいたしません。慎重にご判断ください。
            </li>
          </ul>
        </div>

        <label className="flex items-start gap-2 text-xs">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5"
          />
          <span>上記のご注意事項を確認しました。</span>
        </label>

        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded p-3 text-sm text-rose-900">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-accent text-white py-3 rounded text-sm font-bold hover:bg-accent/90 disabled:opacity-60"
          >
            {isPending
              ? "決済画面に移動中…"
              : `¥${finalAmount.toLocaleString()} で応援する`}
          </button>
          <p className="text-[11px] text-center text-muted-foreground">
            決済画面（Stripe）に移動します。Stripe決済のあと、応援完了画面に戻ります。
          </p>
        </div>

        <div className="text-center pt-2 border-t border-border">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-primary"
          >
            応援せずにサイトに戻る
          </Link>
        </div>
      </form>

      {/* 銀行振込での応援 */}
      <section className="bg-surface border border-border rounded-md p-5 space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-primary">
            銀行振込で応援する
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            クレジットカード情報の登録に抵抗がある方は、こちらの口座への直接振込でも応援を受け付けています。
            口座名義人は、特定商取引法ページにも記載している運営者本人（中島 真之助）です。
            国会議員マップ（kokkaimap.jp）と運営者・口座は同一です。
          </p>
        </div>

        <dl className="bg-amber-50 border border-amber-200 rounded p-4 text-sm divide-y divide-amber-200">
          <div className="grid grid-cols-[110px_1fr] gap-2 py-1.5">
            <dt className="font-medium text-amber-900">銀行名</dt>
            <dd className="text-amber-950">PayPay銀行</dd>
          </div>
          <div className="grid grid-cols-[110px_1fr] gap-2 py-1.5">
            <dt className="font-medium text-amber-900">支店名</dt>
            <dd className="text-amber-950">はやぶさ支店</dd>
          </div>
          <div className="grid grid-cols-[110px_1fr] gap-2 py-1.5">
            <dt className="font-medium text-amber-900">口座種別</dt>
            <dd className="text-amber-950">普通預金</dd>
          </div>
          <div className="grid grid-cols-[110px_1fr] gap-2 py-1.5">
            <dt className="font-medium text-amber-900">口座番号</dt>
            <dd className="text-amber-950 font-mono">3285614</dd>
          </div>
          <div className="grid grid-cols-[110px_1fr] gap-2 py-1.5">
            <dt className="font-medium text-amber-900">口座名義</dt>
            <dd className="text-amber-950">
              ナカジマシンノスケ
              <span className="text-xs text-amber-900/80 ml-2">
                （中島 真之助）
              </span>
            </dd>
          </div>
        </dl>

        <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground leading-relaxed">
          <li>振込金額は任意です。無理のない範囲でお願いいたします。</li>
          <li>振込手数料はお客様のご負担となります。</li>
          <li>
            お名前・メッセージを残したい場合は、振込後に
            <a
              href="mailto:info@kokkaimap.jp"
              className="underline mx-0.5"
            >
              info@kokkaimap.jp
            </a>
            までご一報いただけると励みになります（任意）。
          </li>
          <li>領収書の発行はしておりません。振込明細をご保管ください。</li>
          <li>
            いただいた応援金はサイト全体の運営費に充てます。
            <strong>特定の政党・候補者・議員への支援には一切使用しません</strong>。
          </li>
          <li>性質上、原則として返金はいたしません。慎重にご判断ください。</li>
        </ul>
      </section>

      {/* よくある質問 */}
      <section className="bg-surface border border-border rounded-md p-5 text-sm space-y-4">
        <h2 className="font-bold text-primary">よくある質問</h2>
        <div>
          <p className="font-medium text-primary text-xs mb-1">
            Q. 応援したら何かもらえますか？
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A. いいえ、対価や返礼はありません。「サイトに価値を感じて続いてほしい」という気持ちのみで受け付けています。
          </p>
        </div>
        <div>
          <p className="font-medium text-primary text-xs mb-1">
            Q. 特定の議員を応援することはできますか？
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A. <strong>できません</strong>。公職選挙法・政治資金規正法上の誤解を避けるため、応援はサービス全体への応援としてのみ受け付けています。特定議員への寄付をお考えの場合は、その議員の事務所・政党に直接お問い合わせください。
          </p>
        </div>
        <div>
          <p className="font-medium text-primary text-xs mb-1">
            Q. 私の名前や応援額が公表されますか？
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A. いいえ、名前・金額・メッセージは外部に公開しません。運営者のみが拝見します。
          </p>
        </div>
        <div>
          <p className="font-medium text-primary text-xs mb-1">
            Q. 政治団体への寄付になりますか？
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A. なりません。本サイトは政治団体ではなく、特定の政党・議員への支援を目的としていません。応援金は全額がサイト運営費に充てられます。
          </p>
        </div>
        <div>
          <p className="font-medium text-primary text-xs mb-1">
            Q. 国会議員マップでも応援していますが、両方必要ですか？
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            A. 同じ運営者（中島 真之助）が両サイトを運営しているため、どちらかへの応援で構いません。地方議員マップへの応援は、地方議員マップの開発・データ整備に優先的に充てます。
          </p>
        </div>
      </section>
    </div>
  );
}
