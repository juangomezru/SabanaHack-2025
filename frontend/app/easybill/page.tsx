export default function EasyBillPage() {
  return (
    <main style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100vh", background: "#f4f6ff"
    }}>
      <h1 style={{ color: "#002F6C" }}>💙 EasyBill – Fidelización</h1>
      <p>Administra tus puntos, bonos y beneficios.</p>
      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
        <a href="/easybill/login" style={btn}>Iniciar sesión</a>
        <a href="/easybill/registro" style={btn}>Crear cuenta</a>
      </div>
    </main>
  );
}

const btn = {
  background: "#002F6C",
  color: "white",
  padding: "0.75rem 1.25rem",
  borderRadius: "8px",
  textDecoration: "none",
};
