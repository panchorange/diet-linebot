# 機能一覧（ドメイン）

2人開発向けの最小ドキュメントです。各機能から対応するフロー図（.mmd）へ辿って実装に着手できます。

- 実装レイヤ: Presentation → Domain → Infrastructure（単方向）
- データ: `prisma/schema.prisma`（ERDは `docs/database/ERD.svg`）

---

## 1. ユーザー登録・認証
- 説明: LINEの`userId`で自動識別。初回メッセージ時に登録/更新。
- ブランチ名: `feature/userAuth`
- シーケンス: なし（メッセージ投稿フロー内で内包）
- 関連ファイル: `src/presentation/handlers/messageHandler.ts`, `src/domain/services/userService.ts`

## 2. 食事アドバイス
- 説明: 「食事 〜」投稿（将来は画像も）を解析し`meal_records`へ保存、助言を返信。
- ブランチ名: `feature/mealAdvice`
- シーケンス図: `docs/sequence/meal-post-sequence.mmd`
- 関連ファイル: （設計中）
    - `src/presentation/controllers/lineWebhookController.ts`
    - `src/presentation/handlers/messageHandler.ts`
    - `src/domain/services/mealAdvice.ts`            # LLM抽出・マスタ照合・INSERT（予定）
    - `src/infrastructure/prisma/client.ts`

## 3. 運動アドバイス
- 説明: 「運動 〜」投稿を解析し`exercise_records`へ保存、返信。
- ブランチ名: `feature/exercise-advice`
- シーケンス図: `docs/sequence/exercise-post-sequence.mmd`
- 関連ファイル: 
    - `src/presentation/controllers/lineWebhookController.ts`
    - `src/presentation/handlers/messageHandler.ts`
    - `src/domain/services/exerciseAdvice.ts`

## 4. 体重記録アドバイス
- 説明: 体重記録の投稿を解析し、`weight_records`へ保存、返信。
- ブランチ名: `feature/weightTracking`
- シーケンス図: `docs/sequence/weight-post-sequence.mmd`
- 関連ファイル:
    - `src/presentation/controllers/lineWebhookController.ts`
    - `src/presentation/validators/lineEventValidator.ts`
    - `src/presentation/handlers/messageHandler.ts`
    - `src/domain/services/weightAdvice.ts`            # LLM解析・異常判定・INSERT
    - `src/domain/services/prompts/weightAdvice.ts`   # プロンプト構築
    - `src/infrastructure/prisma/client.ts`
    - `src/infrastructure/line/lineMessageBuilder.ts`


## 5. 週次レポート
- 説明: 1週間の運動、食事、体重の記録に対するアドバイスを返す。
- 出力内容
    - アドバイスの文章
    - 体重の推移（開始してから送信日まで)のグラフ。1週間の記録回数(3/7日)も載せる。
- レポート送信タイミング
    - 日曜(JST)の20:00
- ブランチ名: `feature/weeklyReport` ✅ 実装中（運動のみ対応済み）
- シーケンス図: `docs/sequence/weekly-report.mmd`
- 関連ファイル: `src/presentation/scheduler/weeklyReportScheduler.ts`, `src/domain/services/weeklyReportService.ts`

## 6. 通知・リマインダー
- 説明: 食事/体重のリマインド、励ましメッセージ。
- ブランチ名: `feature/notification-reminder`
- シーケンス図: 準備中
- 関連ファイル: 準備中

## 7. データ分析・レポート拡張
- 説明: カロリー収支/傾向分析の追加。週次レポートの食事・体重対応。
- ブランチ名: `feature/analyticsEnhancement`
- シーケンス図: `docs/sequence/weekly-report.mmd`
- 関連ファイル: `src/presentation/scheduler/weeklyReportScheduler.ts`, `src/domain/services/exerciseWeeklyReportService.ts`

---

## 参考
- Webhookエンドポイント: `src/presentation/controllers/lineWebhookController.ts`
- LINEクライアント: `src/config/lineClient.ts`
- サーバ起点: `src/index.ts`

更新ルール
- 新しい機能や挙動変更が入るPRでは、対応する`.mmd`（`docs/sequence/`配下）を追加/更新し、本一覧にリンクを追記してください。
