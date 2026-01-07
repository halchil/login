// pages/mypage.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}

export default function MyPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
    } else {
      const decoded = parseJwt(token);
      setUser(decoded);
      setReady(true);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    router.replace("/login");
  };

  if (!ready) return <p>Checking login...</p>;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#00ff88",
        fontFamily: "monospace",
        padding: 32,
      }}
    >
      <h1>$ mypage</h1>
      <p>ログイン済みユーザー画面</p>

      <hr style={{ margin: "24px 0", borderColor: "#00ff88" }} />

      <h3>User Info</h3>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(user, null, 2)}
      </pre>

      <p>ユーザー名: {user?.preferred_username}</p>
      <p>ユーザーID: {user?.sub}</p>
      <p>Email: {user?.email}</p>

      <button
        onClick={logout}
        style={{
          marginTop: 24,
          padding: "8px 16px",
          background: "transparent",
          border: "1px solid #00ff88",
          color: "#00ff88",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </main>
  );
}
