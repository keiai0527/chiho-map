import Link from "next/link";

export const metadata = {
  title: "特定商取引法に基づく表記｜地方議員マップ",
  description:
    "地方議員マップの特定商取引法に基づく表記です。サイト応援金・有料機能（口コミ投稿手数料）の運営者情報を掲載しています。",
};

const ADDRESS_PLACEHOLDER = "（請求があった場合に遅滞なく開示いたします）";
const PHONE_PLACEHOLDER = "（請求があった場合に遅滞なく開示いたします）";
const EMAIL = "keiai0527+chiho-map@gmail.com";

// ページキャッシュ固定（次回デプロイまで）
export const revalidate = false;

export default function TokushohoPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">
          特定商取引法に基づく表記
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          特定商取引法第11条に基づき、当サイトの運営者情報・取引条件を以下のとおり表記いたします。
        </p>
      </header>

      <dl className="bg-surface border border-border rounded-md divide-y divide-border">
        <Row label="販売事業者">
          地方議員マップ運営事務局
        </Row>
        <Row label="運営責任者">
          中島 真之助
        </Row>
        <Row label="所在地">
          {ADDRESS_PLACEHOLDER}
          <p className="text-xs text-muted-foreground mt-1">
            ※ 個人事業者は、消費者からの請求があった場合に遅滞なく住所を提供することを条件に、サイトでの即時表示を省略できます（特商法施行規則）。請求は下記メールにてお寄せください。
          </p>
        </Row>
        <Row label="電話番号">
          {PHONE_PLACEHOLDER}
          <p className="text-xs text-muted-foreground mt-1">
            ※ 個人事業者は、消費者からの請求があった場合に遅滞なく電話番号を提供することを条件に、サイトでの即時表示を省略できます（特商法施行規則）。請求は下記メールよりお寄せください。
          </p>
        </Row>
        <Row label="メールアドレス">
          {EMAIL}
        </Row>
        <Row label="ホームページURL">
          https://chiho-map.vercel.app（公開予定の独自ドメイン: chihogiin.jp）
        </Row>
      </dl>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-primary border-l-4 border-accent pl-3">
          有料機能・サイト応援金について
        </h2>
        <dl className="bg-surface border border-border rounded-md divide-y divide-border">
          <Row label="サービス内容">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>口コミ投稿の審査・管理手数料</strong>：1投稿あたり ¥100（税込）。投稿内容の事前審査、誹謗中傷・荒らし投稿の抑止、運営管理を目的としています。
                <strong>本手数料は投稿の公開を保証するものではなく</strong>、審査の結果、投稿ガイドラインに違反すると判断された投稿は非公開または削除となる場合があります（その場合も原則として返金いたしません）。
                β版運営期間中は、投稿は原則として全件、運営者による事前確認後に公開します（最大72時間程度）。
              </li>
              <li>
                <strong>サイト応援（任意の運営支援金）</strong>：¥100 〜 ¥100,000 の範囲で任意の金額をお選びいただけます。
                <ul className="list-disc pl-5 mt-1 space-y-0.5 text-xs">
                  <li>特定政党・候補者・議員への支援ではありません。</li>
                  <li>政治活動資金ではありません。</li>
                  <li>サイト運営費（サーバー費用、データ整備費、法務確認費用、審査体制維持費等）に充てます。</li>
                  <li>応援の対価としての商品・サービスの提供はなく、寄附金控除の対象になることを保証するものではありません。</li>
                  <li><strong>応援金の支払いによって、掲載内容、表示順位、口コミ審査、訂正対応、編集方針が優遇・変更されることはありません。</strong></li>
                </ul>
              </li>
            </ul>
          </Row>
          <Row label="お支払い方法">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>クレジットカード</strong>（Visa／Mastercard／JCB／American Express／Diners）。決済代行サービス（Stripe）を利用し、当サイトでは<strong>カード番号を一切保持しません</strong>。
              </li>
              <li>
                <strong>銀行振込</strong>（サイト応援金のみ）：PayPay銀行 はやぶさ支店 普通預金 3285614 名義 ナカジマシンノスケ。詳細は
                <Link href="/support" className="underline mx-0.5">応援ページ</Link>
                をご覧ください。振込手数料はお客様のご負担となります。
              </li>
            </ul>
          </Row>
          <Row label="商品代金以外に必要な料金">
            なし。インターネット接続料金・通信費はお客様のご負担となります。
          </Row>
          <Row label="お支払い時期">
            投稿時／応援申込時に即時決済。
          </Row>
          <Row label="サービス提供時期">
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>口コミ投稿</strong>：決済完了後、運営者による事前審査（最大72時間以内目安）を経て公開。</li>
              <li><strong>サイト応援金</strong>：申込即時にサイト維持・運営費に充当。</li>
            </ul>
          </Row>
          <Row label="返品・キャンセル・返金について">
            <p>
              性質上、口コミ投稿料・サイト応援金ともに <strong>原則として返金は行いません</strong>。ただし以下の場合は個別対応します：
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>システム障害により投稿が反映されなかった場合 → 全額返金</li>
              <li>決済の二重課金が発生した場合 → 重複分を返金</li>
              <li>当サイトの判断で投稿を不掲載とした場合 → 投稿料は返金しません（事前審査の費用としてご了承ください）</li>
            </ul>
          </Row>
          <Row label="不良品・誤った決済への対応">
            上記事象が発生した場合、お客様にご返金または再提供いたします。お問い合わせ窓口よりご連絡ください。
          </Row>
        </dl>
      </section>

      <section className="bg-rose-50 border border-rose-200 rounded p-5 space-y-2 text-sm leading-relaxed text-rose-900">
        <p className="font-bold">お問い合わせ窓口</p>
        <p>
          サイトに関するお問い合わせは <strong>{EMAIL}</strong> までご連絡ください。
          投稿の削除や訂正のご依頼は専用フォーム（
          <Link href="/takedown" className="underline mx-0.5 font-medium">削除依頼フォーム</Link>
          ／
          <Link href="/correction" className="underline mx-0.5 font-medium">訂正依頼フォーム</Link>
          ）からも受け付けています。
        </p>
        <p className="text-xs">
          ※ 本サイトは個人で1人で運営しております。原則として5営業日以内にご返信しますが、業務状況により1〜2週間お時間をいただく場合があります。
        </p>
      </section>

      <section className="bg-amber-50 border border-amber-200 rounded p-5 space-y-2 text-sm leading-relaxed text-amber-900">
        <p className="font-bold">運営者へのご連絡について</p>
        <p>
          本サイトに関するご意見・お問い合わせ・苦情は、上記の <strong>{EMAIL}</strong> または各種フォームよりお寄せください。個人運営のサイトのため、運営者個人や関係者への過度な抗議・嫌がらせ等はご遠慮くださいますようお願い申し上げます。
        </p>
      </section>

      <p className="text-xs text-muted-foreground border-t border-border pt-4">
        最終更新：2026-05-30
      </p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 sm:gap-4 p-4 text-sm">
      <dt className="font-medium text-primary">{label}</dt>
      <dd className="text-foreground leading-relaxed">{children}</dd>
    </div>
  );
}
