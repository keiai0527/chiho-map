import Link from "next/link";

export const metadata = {
  title: "プライバシーポリシー | 地方議員マップ",
};

// ページキャッシュ固定（次回デプロイまで）
export const revalidate = false;

export default function PrivacyPage() {
  const basicItems = [
    {
      label: "収集する情報",
      value:
        "投稿内容、IPアドレスをハッシュ化した情報（原則として当該情報のみで個人を直接特定することはできませんが、他の情報と組み合わさることで個人関連情報・個人情報に近く扱われる可能性があります）、ブラウザ情報、Stripe 決済時の決済情報（カード番号は当サイトに保管されません）、訂正依頼・削除依頼フォームでご提供いただいた連絡先情報",
    },
    {
      label: "利用目的",
      value:
        "サービス運営、不正利用・スパム投稿の防止、法令に基づく開示請求への対応、訂正依頼・削除依頼への対応、サイト改善のための統計分析",
    },
    {
      label: "保存期間",
      value:
        "IPハッシュは6ヶ月間、投稿内容は削除依頼または運営判断により削除されるまで、決済関連情報は会計法令に従い保管、訂正・削除依頼の連絡先は対応完了後合理的な期間内に削除",
    },
    {
      label: "第三者提供",
      value:
        "原則として行いません。ただし、裁判所その他の権限ある機関からの法令に基づく正当な開示請求があった場合に限り、必要な範囲で開示します",
    },
    {
      label: "個人情報の管理責任者",
      value:
        "本サイトの運営責任者（詳細は特定商取引法に基づく表記をご参照ください）",
    },
    {
      label: "お問い合わせ",
      value: "keiai0527@gmail.com",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-primary">
          プライバシーポリシー
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          本サイト「地方議員マップ」における個人情報の取扱いについて、以下のとおり定めます。
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-primary border-l-4 border-accent pl-3">
          基本事項
        </h2>
        <dl className="space-y-3 text-sm bg-surface border border-border rounded p-5">
          {basicItems.map((i) => (
            <div
              key={i.label}
              className="border-b border-border last:border-b-0 pb-3 last:pb-0"
            >
              <dt className="font-bold text-primary">{i.label}</dt>
              <dd className="mt-1 leading-relaxed">{i.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-primary border-l-4 border-accent pl-3">
          発信者情報開示請求への対応方針
        </h2>
        <div className="bg-surface border border-border rounded p-5 space-y-3 text-sm leading-relaxed">
          <p>
            本サイトは、
            <strong>
              情報流通プラットフォーム対処法（旧プロバイダ責任制限法）
            </strong>
            に基づく発信者情報開示請求に対し、以下の方針で対応します。
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              裁判所からの正当な発信者情報開示命令には、運営者の判断により遅滞なく適切な範囲で開示します。
            </li>
            <li>
              法令上の要件を満たした任意開示請求（権利侵害が明白な場合等）については、必要に応じて投稿者へ意見照会を行ったうえで、運営者の判断により対応します。
            </li>
            <li>
              開示の対象となる情報は、投稿日時、IPアドレスのハッシュ値、決済記録（Stripe
              決済時に当サイトに保存される範囲）等です。
            </li>
            <li>
              請求は <strong>keiai0527@gmail.com</strong>{" "}
              宛にお寄せください。請求の受付・回答には個人運営の都合上、相応のお時間をいただく場合があります。
            </li>
          </ul>
          <p className="text-xs text-muted-foreground">
            ※ 投稿者の身元を運営者が完全に把握しているわけではありません。Stripe
            経由の決済情報を含めても個人特定には別途の手続が必要となる場合があります。
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-primary border-l-4 border-accent pl-3">
          Cookie・アクセス解析
        </h2>
        <div className="bg-surface border border-border rounded p-5 space-y-2 text-sm leading-relaxed">
          <p>
            本サイトは、サービスの利用状況の把握およびサイト改善のため、Cookie
            および類似の技術を使用することがあります。これにより収集される情報は、個人を特定できない統計情報として扱います。
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-primary border-l-4 border-accent pl-3">
          外部送信される情報について
        </h2>
        <div className="bg-surface border border-border rounded p-5 space-y-2 text-sm leading-relaxed">
          <p>
            本サイトでは、決済処理のため、Stripe Inc.（アメリカ合衆国）に決済情報を送信します。送信される情報はカード認証に必要な範囲に限られ、当サイトはカード番号を保持しません。
          </p>
          <p>
            また、訂正依頼・削除依頼の運営者通知メール送信のため、Resend Inc.（アメリカ合衆国）に運営者メールアドレスおよび依頼内容の写しを送信します。
          </p>
          <p>
            投稿コンテンツや個人情報を AI 等の外部サービスに送信して解析・要約することは現時点ではありません。将来的に AI 要約を導入する場合は、本ポリシーを改訂し、対象範囲を明示します。
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-primary border-l-4 border-accent pl-3">
          開示・訂正・削除・利用停止の請求
        </h2>
        <div className="bg-surface border border-border rounded p-5 space-y-2 text-sm leading-relaxed">
          <p>
            ご自身の投稿・問い合わせに関する情報の開示・訂正・削除・利用停止のご請求は、本人確認のうえ対応いたします。
            <strong>keiai0527@gmail.com</strong> までメールでご連絡いただくか、
            <Link
              href="/takedown"
              className="text-primary underline mx-0.5"
            >
              削除依頼フォーム
            </Link>
            ／
            <Link
              href="/correction"
              className="text-primary underline mx-0.5"
            >
              訂正依頼フォーム
            </Link>
            をご利用ください。個人運営の都合上、回答にはお時間をいただく場合があります。
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-primary border-l-4 border-accent pl-3">
          セキュリティ管理措置
        </h2>
        <div className="bg-surface border border-border rounded p-5 space-y-2 text-sm leading-relaxed">
          <p>
            本サイトは、HTTPS による通信暗号化、サーバー側でのアクセス制御、決済情報の外部代行委託（Stripe）、IPアドレスのハッシュ化保存、管理画面の認証保護等により、収集した情報の漏えい・改ざん・不正アクセスの防止に努めています。
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-primary border-l-4 border-accent pl-3">
          関連ページ
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <li>
            <Link
              href="/terms"
              className="block bg-surface border border-border rounded p-3 hover:border-accent"
            >
              利用規約
            </Link>
          </li>
          <li>
            <Link
              href="/guidelines"
              className="block bg-surface border border-border rounded p-3 hover:border-accent"
            >
              投稿ガイドライン
            </Link>
          </li>
          <li>
            <Link
              href="/takedown"
              className="block bg-surface border border-border rounded p-3 hover:border-accent"
            >
              削除依頼フォーム
            </Link>
          </li>
          <li>
            <Link
              href="/tokushoho"
              className="block bg-surface border border-border rounded p-3 hover:border-accent"
            >
              特定商取引法に基づく表記
            </Link>
          </li>
        </ul>
      </section>

      <p className="text-xs text-muted-foreground border-t border-border pt-4">
        本ポリシーは必要に応じて改訂されます。最終改訂日：2026-05-30
      </p>
    </div>
  );
}
