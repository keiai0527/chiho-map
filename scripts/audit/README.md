# 地方議員マップ データ品質監査

国会議員マップ（diet-map）と同じ思想で運用する。

## コマンド

```bash
npm run audit       # 全監査（counts, unique_ids, party_consistency, required_fields, expected_party_counts, id_format）
npm run snapshot    # 現在のデータ状態を snapshot に保存
npm run diff        # 前回 snapshot との差分・急変警告
npm run audit:ci    # audit + next build（error あれば停止）
```

## 監査チェック

| check | level | 何を見るか |
|---|---|---|
| counts | error/warning/info | 市別の議員数が想定と一致するか（±5%まで warning、+5%超は error） |
| unique_ids | error | 議員IDの重複 |
| party_consistency | error | `partyId` が `parties.json` のマスタに存在するか |
| required_fields | error | name / electoralDistrict / parliamentaryGroupId / source.url の存在 |
| expected_party_counts | warning | `expected-party-counts.json` と市×政党別の議員数を比較。±3名以上で警告 |
| id_format | error | id が `{cityId}-{slug}` 形式か |

## 運用ルール（CLAUDE.md / AGENTS.md 参照）

- 議員データを変更したら **必ず `npm run audit` を実行**
- error が1件でも出たら **デプロイしない**
- 監査ログを構造化レポートにして残す（件数・修正前・修正後・原因・再発防止）
- 大量変更時は `npm run snapshot` → 変更 → `npm run diff` で急変確認
