# 機能一覧（ドメイン）

2人開発向けの最小ドキュメントです。各機能から対応するフロー図（.mmd）へ辿って実装に着手できます。

- 実装レイヤ: Presentation → Domain → Infrastructure（単方向）
- データ: `prisma/schema.prisma`（ERDは `docs/database/ERD.svg`）

---

## 1. ユーザー登録・認証
- 説明: LINEの`userId`で自動識別。初回メッセージ時に登録/更新。
- シーケンス: なし（メッセージ投稿フロー内で内包）
- 関連ファイル: `src/presentation/handlers/messageHandler.ts`, `src/domain/services/userService.ts`

## 2. 食事アドバイス
- 説明: 画像/テキストを解析して食事アドバイスを返す（LLM利用予定）。
- シーケンス: `docs/se`
- 関連ファイル: 準備中

## 3. 運動アドバイス
- 説明: 「運動 〜」投稿を解析し`exercise_records`へ保存、返信。
- シーケンス図: `docs/sequence/exercise-post-sequence.mmd`
- 関連ファイル: 
    - `src/presentation/controllers/lineWebhookController.ts`
    - `src/presentation/handlers/messageHandler.ts`
    - `src/domain/services/exerciseService.ts`

## 4. 体重記録アドバイス
- 説明: 体重記録の投稿を解析し、`weight_records`へ保存、返信。
- シーケンス図: `docs/sequence/weight-post-sequence.mmd`
- 関連ファイル: `src/presentation/controllers/lineWebhookController.ts`


## 5. 週次レポート（計画）
- 説明: 1週間の運動、食事、体重の記録に対するアドバイスを返す。
- シーケンス図: `docs/sequence/weekly-report-sequence.mmd`
- 関連ファイル: 準備中

## 6. 通知・リマインダー（計画）
- 説明: 食事/体重のリマインド、励ましメッセージ。
- シーケンス図: 準備中
- 関連ファイル: 準備中

## 7. データ分析・レポート（週次レポート含む）
- 説明: 週次運動レポートを生成してPush。今後は収支/傾向分析も拡張。
- シーケンス図: `docs/flows/weekly-report.mmd`
- 関連ファイル: `src/presentation/scheduler/weeklyReportScheduler.ts`, `src/domain/services/exerciseWeeklyReportService.ts`

---

## 参考
- Webhookエンドポイント: `src/presentation/controllers/lineWebhookController.ts`
- LINEクライアント: `src/config/lineClient.ts`
- サーバ起点: `src/index.ts`

更新ルール
- 新しい機能や挙動変更が入るPRでは、対応する`.mmd`（`docs/flows/`配下）を追加/更新し、本一覧にリンクを追記してください。
