# 開発・運用ドキュメント

## 継続的品質チェックの構成

### Vercel ビルド（常時実行）

`package.json` の `build` スクリプトは以下を順番に実行します。
いずれかが失敗すると Vercel 本番デプロイが停止します。

```
npm run audit   # データ品質監査（5市の議員データ整合性）
npm run typecheck  # TypeScript 型チェック
next build      # Next.js 本番ビルド + 型・基本チェック
```

ローカルで iCloud 同期の制約があるため、これら3つの実行は Vercel 側でのみ行います。

### ESLint（手動 or CI）

```
npm run lint
```

Vercel ビルドには含めていません（β版段階で軽微な warning でデプロイが止まることを避けるため）。
手動実行か、後述の GitHub Actions で継続的に走らせます。

### GitHub Actions（任意の追加CI）

`docs/github-actions-ci.yml.example` に audit/typecheck/lint を全部回すワークフローを置いています。
有効化したい場合の手順:

1. GitHub の Personal Access Token に `workflow` スコープを追加する
   (Settings → Developer settings → Personal access tokens → 該当トークンの Edit → Scopes に `workflow` を追加)
2. リポジトリ直下に `.github/workflows/ci.yml` を作成し、`docs/github-actions-ci.yml.example` の内容を貼り付ける
3. commit + push

PAT 更新が不要な代替: GitHub Web UI からファイルを直接作成しても OK（ただし CodeMirror エディタの自動インデントで YAML が壊れがちなので、Raw paste 推奨）。

## データ品質ポリシー

`scripts/audit/README.md` を参照。
- ERROR が1件でも出たらデプロイ不可
- WARNING は原因を記録して許容するか修正
- データ大量変更時は `npm run snapshot` → 変更 → `npm run diff` で急変確認

## DNS / カスタムドメインの運用

`lib/config.ts` の `SITE_URL` が canonical / OGP / sitemap / robots.txt の基準。

現在: `https://chiho-map.vercel.app`

DNS伝播 + SSL発行が完了し、`https://chihogiin.jp` で安定アクセスできるようになったら、
`lib/config.ts` の `SITE_URL` を `https://chihogiin.jp` に書き換えて再デプロイする。
