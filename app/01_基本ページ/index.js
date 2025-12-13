// index.js
import express from "express";

const app = express();

const KEYCLOAK_BASE = "http://keycloak:8080";
const KEYCLOAK_BROWSER = "http://192.168.56.137:8081"; // ブラウザ用
const REALM = "myrealm";
const CLIENT_ID = "demo-app";

/*
app.get("/login", (req, res) => {
  const redirectUri = "http://localhost:8080/callback";

  const url =
    `${KEYCLOAK_BASE}/realms/${REALM}/protocol/openid-connect/auth` +
    `?client_id=${CLIENT_ID}` +
    `&response_type=code` +
    `&scope=openid` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}`;

  res.redirect(url);
});
*/

app.get("/login", (req, res) => {
    const redirectUri = "http://192.168.56.137:3000/callback";
  
    const url =
      `${KEYCLOAK_BROWSER}/realms/${REALM}/protocol/openid-connect/auth` +
      `?client_id=${CLIENT_ID}` +
      `&response_type=code` +
      `&scope=openid` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
    res.redirect(url);
  });


app.get("/", (req, res) => {
  res.send(`<a href="/login">Login</a>`);
});

app.get("/callback", (req, res) => {
    const code = req.query.code;
  
    res.send(`
      <h1>Login Success</h1>
      <p>Authorization Code:</p>
      <pre>${code}</pre>
    `);
  });

app.listen(3000, () => {
  console.log("App running on 3000");
});
