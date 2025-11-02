"use client";
import { useState, CSSProperties } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://127.0.0.1:5001/easybill/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      localStorage.setItem("email", email);
      window.location.href = "/easybill/dashboard";
    } else {
      alert("Usuario no encontrado");
    }
  };

  return (
    <main style={styles.main}>
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.btn}>
          Entrar
        </button>
      </form>
    </main>
  );
}

const styles: {
  main: CSSProperties;
  form: CSSProperties;
  input: CSSProperties;
  btn: CSSProperties;
} = {
  main: {
    background: "#f4f6ff",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    width: "300px",
  },
  input: {
    padding: "0.75rem",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  btn: {
    background: "#002F6C",
    color: "white",
    padding: "0.75rem",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
