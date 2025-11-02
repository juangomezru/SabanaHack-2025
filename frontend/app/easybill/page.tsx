import React from "react";

export default function EasyBillPage() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #eef3ff 0%, #dbe9ff 40%, #e9e3ff 100%)",
        padding: "1rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(8px)",
          borderRadius: "16px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          padding: "2rem 3rem",
          textAlign: "center",
          maxWidth: "420px",
          transition: "transform 0.3s ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "1rem" }}>
          <span style={{ fontSize: "2.5rem", color: "#002F6C" }}>💙</span>
          <h1
            style={{
              marginLeft: "0.5rem",
              fontSize: "1.8rem",
              fontWeight: "bold",
              color: "#002F6C",
            }}
          >
            EasyBill
          </h1>
        </div>

        <p style={{ color: "#4a5568", fontSize: "1.1rem", marginBottom: "2rem" }}>
          Administra tus puntos, bonos y beneficios.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <a href="/easybill/login" style={btnPrimary}>
            Iniciar sesión
          </a>
          <a href="/easybill/registro" style={btnSecondary}>
            Crear cuenta
          </a>
        </div>
      </div>
    </main>
  );
}

const btnBase: React.CSSProperties = {
  padding: "0.9rem 1.25rem",
  borderRadius: "8px",
  textDecoration: "none",
  textAlign: "center",
  fontWeight: "bold",
  transition: "all 0.25s ease",
};

const btnPrimary: React.CSSProperties = {
  ...btnBase,
  background: "#002F6C",
  color: "#fff",
};

const btnSecondary: React.CSSProperties = {
  ...btnBase,
  background: "#e5ecff",
  color: "#002F6C",
  border: "2px solid #002F6C",
};
