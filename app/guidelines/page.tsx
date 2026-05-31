export const metadata = {
  title: "投稿ガイドライン | 地方議員マップ",
};

export const revalidate = false;

export default function GuidelinesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 prose-sm">
      <h1 className="text-2xl font-bold text-primary mb-2">
        地方議員マップ 投稿ガイドライン
      </h1>
      <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
        本サイトは、市民の代表である市議会議員の公務に関する情報を市民が共有し、地域民主主義の議論を深めることを目的としています。投稿にあたっては以下のガイドラインを遵守してください。
      </p>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-base font-bold text-primary border-l-4 border-accent pl-3 mb-3">
            1. 投稿してよい内容
          </h2>
          <p>
            本サイトでは、市議会議員の以下の事項に関する投稿を受け付けます。
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>本会議・委員会等での発言内容に対する論評</li>
            <li>議案・条例案への賛否や質疑内容に対する評価</li>
            <li>議会活動における議事運営、政策提案、質疑内容への意見</li>
            <li>公的な発言・公約・政策に関する事実摘示と意見</li>
            <li>選挙公約と実際の議会活動との一致／不一致についての評価</li>
            <li>事務所対応・陳情対応・地域活動への評価</li>
            <li>公開情報に基づく経歴・公的活動への論評</li>
          </ul>
          <p className="mt-2">
            これらは公人としての公務に関する事項であり、民主主義社会において自由な批評が認められる対象です。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-primary border-l-4 border-accent pl-3 mb-3">
            2. 投稿してはならない内容
          </h2>
          <p>以下に該当する投稿は削除対象とします。</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              議員の私生活に関する言及（家族構成、配偶者、子供、住所、健康状態、宗教、性的指向等）
            </li>
            <li>公務と無関係な事柄への言及（議員になる前の私的な経歴、家族の動向等）</li>
            <li>ヘイト表現、罵詈雑言、人格否定の表現（「死ね」「ゴミ」「クズ」等）</li>
            <li>出自、人種、性別、障害などへの差別的言及</li>
            <li>明らかな虚偽事実の摘示（証拠なき犯罪行為の指摘等）</li>
            <li>他の利用者への攻撃、嫌がらせ</li>
            <li>営業目的、政治活動目的の宣伝、勧誘、選挙運動への誘導</li>
            <li>他者の著作物の無断転載</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-primary border-l-4 border-accent pl-3 mb-3">
            2-2. 選挙運動の禁止（公職選挙法 第142条の3・第142条の4対応）
          </h2>
          <p>
            本サイトは「ウェブサイト等を利用する方法」による情報提供を中立的・客観的に行うものであり、選挙運動を目的とする場ではありません。以下の投稿は公職選挙法（特に第142条の3・第142条の4）に抵触するおそれがあり、削除対象とします。
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              特定の候補者・議員への投票または不投票を呼びかける投稿（例：「○○さんに投票しましょう」「△党を支持してください」「××に投票しないで」）
            </li>
            <li>
              選挙期間中に、特定の議員・候補者の有利・不利を意図した内容を表示・拡散させる目的の投稿
            </li>
            <li>
              本サイト上での有料機能（応援金・口コミ投稿手数料）を、特定議員の選挙運動費用に充当する旨を示唆・要請する投稿
            </li>
            <li>
              選挙運動用ウェブサイト・電子メール等への誘導を目的とした投稿
            </li>
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            ※ 本サイトに掲載される議員情報・口コミの掲載順位・表示位置は、有料機能の購入により変動するものではなく、有料表示・バナー広告等の選挙運動（第142条の4）には該当しないよう中立的に運営しています。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-primary border-l-4 border-accent pl-3 mb-3">
            3. 投稿の最低要件
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              投稿は100文字以上とします。一行の罵倒や中身のない投稿は受け付けません。
            </li>
            <li>
              具体的な事実関係への言及（いつ、どの委員会で、どの議案について等）を含めてください。
            </li>
            <li>事実と意見を区別してください。</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-primary border-l-4 border-accent pl-3 mb-3">
            4. 投稿の事前審査
          </h2>
          <p>
            <strong>投稿は原則として全件、運営者による確認後に公開します。</strong>
            確認には最大72時間程度かかる場合があります。地方議員に関する口コミは法的・中立性のリスクが高いため、
            β版運営期間中は自動公開を行わず、全件を運営者が確認します。
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            機微なキーワード（犯罪・違法・贈収賄・家族・健康・不倫など、運営者が事前に定めたリスト）が含まれる場合は、
            特に慎重に内容を確認します。確認時の自動検出フラグは運営者の判断材料として参考的に利用しますが、
            公開判断は常に運営者の人的確認を経て行います。
          </p>
        </section>

        <section id="fee" className="scroll-mt-20">
          <h2 className="text-base font-bold text-primary border-l-4 border-accent pl-3 mb-3">
            5. 投稿手数料について
          </h2>
          <p>
            地方議員に関する口コミは、政治的な意見や批判を含むため、誹謗中傷、虚偽情報、差別的表現、私生活への言及、脅迫的表現などが投稿されるリスクがあります。
          </p>
          <p className="mt-2">
            そのため、本サイトでは、投稿内容を公開前に確認し、ガイドライン違反の投稿を防ぐため、<strong>1投稿につき100円（税込）の審査・管理手数料</strong>をいただいています。
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded p-4 my-3">
            <p className="font-bold text-blue-900 mb-1">投稿手数料：100円（税込）</p>
            <p className="text-blue-900 text-xs">
              用途：投稿内容の事前審査、不正投稿防止、運営管理のため
            </p>
          </div>
          <p>
            この手数料は、<strong>口コミの掲載を保証するものではありません</strong>。投稿内容がガイドラインに違反する場合、決済後であっても非公開または削除となる場合があります。
          </p>
          <p className="mt-2">
            100円の手数料を設けることで、匿名での大量投稿、荒らし、無責任な誹謗中傷投稿を抑制し、健全な公務評価の場を維持することを目的としています。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-primary border-l-4 border-accent pl-3 mb-3">
            6. 削除と通報
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              公開された投稿について、ガイドラインに違反する内容を発見した場合、
              <a href="/takedown" className="underline mx-0.5">削除依頼フォーム</a>
              から報告できます。
            </li>
            <li>
              議員本人または代理人からの削除依頼も、削除依頼フォームから受け付けます。
            </li>
            <li>
              削除依頼があった場合、運営者は本ガイドラインに照らして判断し、結果を依頼者に通知します。
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-primary border-l-4 border-accent pl-3 mb-3">
            7. 公人としての受忍限度
          </h2>
          <p>
            市議会議員は公人であり、その公務に関する正当な批判は本サイトでは原則として削除しません。批判の語気が強いことのみを理由とした削除は行いません。
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-primary border-l-4 border-accent pl-3 mb-3">
            8. 発信者情報の取扱い
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              投稿時、IPアドレスをハッシュ化して6ヶ月間保存します。これは法令に基づく開示請求への対応のためであり、それ以外の目的では使用しません。
            </li>
            <li>裁判所からの正当な発信者情報開示命令には適切に応じます。</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-primary border-l-4 border-accent pl-3 mb-3">
            9. ガイドラインの改訂
          </h2>
          <p>
            本ガイドラインは必要に応じて改訂されます。重要な変更時は本ページ上部に告知します。
          </p>
        </section>

        <p className="text-xs text-muted-foreground border-t border-border pt-4">
          最終改訂日：2026-05-31
        </p>
      </div>
    </div>
  );
}
