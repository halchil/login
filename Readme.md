ログイン機能の最適構成のみ実装

ディレクトリ構成
```
login
├─ docker-compose.yml
├─ nginx/
│  └─ default.conf
└─ app/
   ├─ package.json
   └─ index.js
```

順に起動する

```
docker compose up keycloak -d
http://192.168.56.137:8081
```

`admin`,`admin`でログイン

KeycloakのRealmとClientを作成する。
`redirect URI`を設定する。
`redirect URI`とは、ログインが終わったあと、Keycloakがブラウザを戻す先のURLである。
つまり、アプリケーション側の画面のURLとなる。


認証フローは以下のようになる。
```
① ユーザが /login を押す
② ブラウザが Keycloak に飛ぶ
③ ユーザが ID/Password 入力
④ Keycloak「認証OK」
⑤ ブラウザを “redirect URI” に戻す
⑥ アプリが「ログイン成功」を処理
```

Keycloakの設定（Realm / Client / User）は「KeycloakのDB」に保存される
今の構成だと、docker compose down -v をすると消える

realmの作成→すぐ終わる
次にclientの作成
Client-Type,Client ID,を設定

Step 2: Capability config（重要）
🔹 Client authentication
ON
👉 Confidential client（安全）

🔹 Authorization
OFF

（今回は使わない）
🔹 Standard flow
ON


Valid redirect URIsは、
`http://192.168.56.137:8080/*`
実際にそのURLが存在する必要はない

Web originsは*

でsave


次にClient Secret を確認する。

ここまでを整理する。

結論
Keycloakで「認証される」のは「ユーザ」
Client は「誰がその認証を使っていいか」を示す「アプリの身分証」


Client ≠ ユーザであり、Clientはログインしない

Keycloakの世界には 3種類の主体 がある。
・ユーザ 人間
・Clinet(アプリケーション)　ユーザの代わりに Keycloak と会話する
・Realm(世界) ユーザ・Client・Role をまとめる箱

つまり、「認証」とは「このユーザは本当に本人か？」を Keycloak が保証することである。

ステップは以下
```
① ユーザがアプリで「ログイン」押す
② アプリが Keycloak に「この人を認証して」と頼む
③ Keycloak がログイン画面を出す
④ ユーザが ID / パスワードを入力
⑤ Keycloak が DB に照合
⑥ OKなら「このユーザは本物」と判断
⑦ Keycloak が「証明書（トークン）」を発行
⑧ アプリがそれを受け取る
```
Client は「誰」ではなく「どのアプリ」か　である。


# Keycloakでユーザを一人作成する

左メニューの`Users`から作成

これを作っただけでは まだログインできない。

ユーザ情報のCredentialからパスワードを設定。

# Node.jsの/loginからKeycloakログイン画面まで通す

Node.jsのコンテナを立ち上げる

```
[実行コマンド]
docker compose up -d app

[確認コマンド]
docker ps

[結果]
CONTAINER ID   IMAGE                            COMMAND                  CREATED          STATUS          PORTS                                                             NAMES
268d4e4900ca   node:20                          "docker-entrypoint.s…"   23 seconds ago   Up 2 seconds    0.0.0.0:3000->3000/tcp, [::]:3000->3000/tcp                       login-app-1
24d5d5f333b5   quay.io/keycloak/keycloak:25.0   "/opt/keycloak/bin/k…"   24 minutes ago   Up 24 minutes   8443/tcp, 9000/tcp, 0.0.0.0:8081->8080/tcp, [::]:8081->8080/tcp   login-keycloak-1
```

現在は3000ポートを通しているが、Nginxでリバースプロキシする場合、そのタイミングで消してOK

```
http://192.168.56.137:3000/login
```


# 通信経路




# セッション管理調査
Keycloakのセッションは 2層構造 である

```
① ブラウザ側
   └─ Cookie（KEYCLOAK_SESSION / AUTH_SESSION_ID）

② Keycloak側
   └─ ユーザセッション情報（DB）
```


# 本番におけるDBのセッション管理
現在はvolumeで行っている


ログのリアルタイム監視
```
docker logs -f login-nginx-1
docker logs --tail 50 -f login-nginx-1

```


# ページ作成
マイページの作成とログアウト機能を実装

画面の推移

```
未ログイン
  └─ /mypage に来た
        ↓
      /login に強制遷移
        ↓
   Keycloakログイン
        ↓
      /callback
        ↓
      /mypage

ログイン済
  └─ /mypage 表示
        └─ Logout ボタン
              ↓
          Keycloakログアウト
              ↓
            /login
```

必要なエンドポイント一覧


```
/login ログイン入口（Keycloakへ飛ばす）
/callback Keycloakから戻る
/mypage ログイン後ページ
/logout ログアウト
```

アクセス
```
http://192.168.56.137:3000/mypage
```

正しい流れ
```
/mypage
 ↓ Logout
/logout
 ↓
Keycloak（id_token でセッション特定）
 ↓
Keycloakセッション破棄
 ↓
/login

```

ログアウト仕様について

ログイン
```
redirect_uri        ← OK
```
ログアウト
```
id_token_hint       ← 必須
post_logout_redirect_uri ← 必須
```

# サービスを増やしてもSSOを通すイメージ

metabaseを例に、全体の流れを示す。
```
[ ブラウザ ]
     |
     | ① Metabaseにアクセス
     v
[ Metabase ]
     |
     | ② 「この人、誰？」→ Keycloakに聞く
     v
[ Keycloak ]
     |
     | ③ すでにログイン済み？（SSO）
     |    Yes → 即OK / No → ログイン画面
     v
[ ブラウザ ]
     |
     | ④ 認証結果（トークン）を持って Metabase に戻る
     v
[ Metabase ]

```

必要な設定は2か所
```
Keycloak	「Metabaseを信用していいか」
Metabase	「認証はKeycloakに任せる」
```



OIDC の流れを整理


```
/login
  ↓
Keycloak
  ↓
/callback?code=XXXX   ← ★ code はここだけ
  ↓（token交換）
/mypage               ← ★ code はもう無い

```

# まとめ
全体像

```
[Browser]
   |
   | ① /login（自作）
   v
[Keycloak]  ← 認証の本体
   |
   | ② 認証成功（code発行）
   v
[Browser]
   |
   | ③ /callback（code受信）
   v
[Next.js API]  ← サーバ側
   |
   | ④ code → token交換
   v
[Browser]
   |
   | ⑤ /mypage（ログイン後）

```

## ① /login（認証の入口）

役割

「ログインを開始する」だけ

認証は まだしていない

やっていること
```
window.location.href = 
  http://KEYCLOAK/auth
    ?client_id=demo-app
    &response_type=code
    &redirect_uri=/callback

```

URLの意味
```
client_id Keycloakに登録したアプリ名
response_type=code 「あとで token に交換する券（code）」をください
redirect_uri 認証後に戻ってくる先
```
ここでは Keycloak に丸投げしているだけ

## ② Keycloak（認証の本体）

役割

ユーザーID / パスワード確認

SSOセッション作成

成功するとKeycloak が ブラウザをリダイレクトする：

```
/callback?code=XXXXX&session_state=YYYY
```

## ③ /callback（認証結果の受け取り口）

役割

Keycloak が返した code を受け取る
でも token交換はまだしない（ブラウザではNG）

```
const { code } = router.query;
```

重要な理解
code は callback にしか来ない
/mypage や /login では 絶対に見てはいけない


## ④ /api/token（サーバ側での token 交換）

なぜ必要？
token endpoint は CORS非対応
client_secret を扱うので ブラウザNG
👉 Next.js API Route が代理人になる

/api/token がやっていること
```
POST /token
  grant_type=authorization_code
  client_id=demo-app
  client_secret=****
  code=XXXXX
  redirect_uri=/callback
```

成功すると返るもの

```
{
  "access_token": "...",
  "refresh_token": "...",
  "id_token": "...",
  "expires_in": 300
}

```

## ⑤ /callback → /mypage

callback の最後
```
localStorage.setItem("access_token", token.access_token);
router.replace("/mypage");
```

ここでやっていること
「ログイン済みの印」を保存
画面を切り替えるだけ


## ⑥ /mypage（ログイン後ページ）
やるべき判定
❌ ダメな例

```
router.query.code を見る
```

✅ 正解

```
localStorage.getItem("access_token")

```

なぜ？

/mypage に code は来ない

token が「ログイン済み」の証拠だから

## ログアウトの流れ

最低限

```
localStorage.removeItem("access_token")
→ /login
```

完全ログアウト（SSO含む）

```
Keycloak /logout
  ?redirect_uri=/login

```

