import express from "express";
import fetch from "node-fetch";

const app = express();

// ===== 設定 =====
const KEYCLOAK_BROWSER = "http://192.168.56.137:8081";
const REALM = "myrealm";
const CLIENT_ID = "demo-app";
const CLIENT_SECRET = "55qSPb8vM6OTj2tUqbnV691E6Sqseu3h";
const APP_BASE = "http://192.168.56.137:3000";

// Cookie を使う
app.use(express.urlencoded({ extended: true }));

// Cookieを手動で扱う（簡易）
function getToken(req) {
  const cookie = req.headers.cookie;
  if (!cookie) return null;

  const match = cookie.match(/access_token=([^;]+)/);
  return match ? match[1] : null;
}

// ===== トップ（ログイン or マイページへ）=====
app.get("/", (req, res) => {
  res.redirect("/mypage");
});

// ===== ログインページ =====
app.get("/login", (req, res) => {
  const redirectUri = `${APP_BASE}/callback`;

  const url =
    `${KEYCLOAK_BROWSER}/realms/${REALM}/protocol/openid-connect/auth` +
    `?client_id=${CLIENT_ID}` +
    `&response_type=code` +
    `&scope=openid` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;

  res.redirect(url);
});

// ===== Keycloak からの戻り =====
app.get("/callback", async (req, res) => {
  const code = req.query.code;

  const tokenRes = await fetch(
    `${KEYCLOAK_BROWSER}/realms/${REALM}/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: `${APP_BASE}/callback`,
        code,
      }),
    }
  );

  const token = await tokenRes.json();

  // access_token を Cookie に保存（簡易）
  res.setHeader("Set-Cookie", [
    `access_token=${token.access_token}; Path=/; HttpOnly`,
    `id_token=${token.id_token}; Path=/; HttpOnly`
  ]);  

  res.redirect("/mypage");
});

// ===== マイページ =====
app.get("/mypage", (req, res) => {
  const token = getToken(req);

  if (!token) {
    return res.redirect("/login");
  }

  res.send(`
    <h1>My Page</h1>
    <p>ログイン中</p>
    <a href="/logout">Logout</a>
  `);
});

// ===== ログアウト =====
app.get("/logout", (req, res) => {
    const cookie = req.headers.cookie || "";
    const match = cookie.match(/id_token=([^;]+)/);
    const idToken = match ? match[1] : "";
  
    // Cookie削除
    res.setHeader("Set-Cookie", [
      "access_token=; Path=/; Max-Age=0",
      "id_token=; Path=/; Max-Age=0"
    ]);
  
    const logoutUrl =
      `${KEYCLOAK_BROWSER}/realms/${REALM}/protocol/openid-connect/logout` +
      `?id_token_hint=${encodeURIComponent(idToken)}` +
      `&post_logout_redirect_uri=${encodeURIComponent(APP_BASE + "/login")}`;
  
    res.redirect(logoutUrl);
  });
  

// ===== 起動 =====
app.listen(3000, () => {
  console.log("App running on 3000");
});
