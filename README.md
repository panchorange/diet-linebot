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

3. line botの設定ページでwebhookurlを変更
* 2. の実行で出てきたForwardingの部分を入力
```bash
                                                                               
Session Status                online                                             
Account                       panchorange2203@gmail.com (Plan: Free)             
Update                        update available (version 3.26.0, Ctrl-U to update)
Version                       3.25.0                                             
Region                        Japan (jp)                                         
Latency                       11ms                                               
Web Interface                 http://127.0.0.1:4040                              
Forwarding                    https://89db444694f2.ngrok-free.app -> http://local
```