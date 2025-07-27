# diet-linebot
ダイエット継続を目的としたLINEbot

# デプロイ方法（テストbot）

1. サーバーを立てる
```bash
bun run src/test_bot.ts
```

2. ngrokでローカルサーバーにトンネリング接続できるようにする
```bash
ngrok http 3000
```
