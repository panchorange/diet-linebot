フォルダ構造と役割（ざっくり要点）
src/index.ts
Bunサーバのエントリ。/webhook を受けてプレゼンテーション層へ委譲。
src/config/
env.ts: 必須環境変数の検証と lineConfig の提供。
lineClient.ts: LINE SDKクライアント生成。
src/presentation/
controllers/lineWebhookController.ts: Webhookの入口。署名検証→イベント分岐→各ハンドラ呼び出し。
handlers/messageHandler.ts: メッセージイベント処理（テキスト/画像などの分岐、返信の起点）。
validators/lineEventValidator.ts: 署名検証。
wiring/serviceLocator.ts: 依存解決（UserService とリポジトリの組み立て）。
src/domain/
models/User.ts: ドメインモデル型。
interfaces/IUserRepository.ts: リポジトリIF（port）。
services/userService.ts: 業務手順（未登録なら作成/登録済みなら取得など）。
src/infrastructure/
prisma/client.ts: PrismaClient（DB接続）。
prisma/repositories/PrismaUserRepository.ts: リポジトリ実装（現状スタブ。スキーマ対応後に実装）。
line/lineMessageBuilder.ts: 返信メッセージのテンプレ。
src/interfaces/
将来用の空き（現状未使用）。