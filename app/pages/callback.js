// pages/callback.js
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const { code } = router.query;
    if (!code) {
      router.replace("/login");
      return;
    }

    const exchange = async () => {
      const res = await fetch("/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        console.error("Token exchange failed");
        router.replace("/login");
        return;
      }

      const token = await res.json();
      localStorage.setItem("access_token", token.access_token);
      router.replace("/mypage");
    };

    exchange();
  }, [router]);

  return <p>Logging in...</p>;
}
