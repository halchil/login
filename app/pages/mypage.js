// pages/mypage.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function MyPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
    } else {
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
