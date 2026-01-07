// pages/login.js
export default function Login() {
    const login = () => {
      const url =
        "http://localhost:8081/realms/myrealm/protocol/openid-connect/auth" +
        "?client_id=demo-app" +
        "&response_type=code" +
        "&scope=openid" +
        "&redirect_uri=http://localhost:3000/callback";
  
      console.log("REDIRECT URL:", url);
      window.location.href = url;
    };
  
    return (
      <main style={styles.main}>
        <div style={styles.box}>
          <h1>$ OSS Portal</h1>
          <p>ログインが必要です</p>
          <button onClick={login} style={styles.button}>
            Login with Keycloak
          </button>
        </div>
      </main>
    );
  }
  
  const styles = {
    main: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#000",
      color: "#00ff88",
      fontFamily: "monospace",
    },
    box: {
      border: "1px solid #00ff88",
      padding: 32,
    },
    button: {
      marginTop: 16,
      padding: "8px 16px",
      background: "transparent",
      border: "1px solid #00ff88",
      color: "#00ff88",
      cursor: "pointer",
    },
  };
  