// pages/api/token.js
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();
  
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "code missing" });
  
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", process.env.KEYCLOAK_CLIENT_ID);
    params.append("client_secret", process.env.KEYCLOAK_CLIENT_SECRET); // ★追加
    params.append("code", code);
    params.append(
      "redirect_uri",
      "http://localhost:3000/callback"
    );
  
    const kcRes = await fetch(
      "http://keycloak:8080/realms/myrealm/protocol/openid-connect/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      }
    );
  
    const text = await kcRes.text();
  
    if (!kcRes.ok) {
      console.error("Keycloak token error:", text);
      return res.status(500).json({ error: text });
    }
  
    return res.status(200).json(JSON.parse(text));
  }
  