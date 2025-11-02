"use client";
import { useState, CSSProperties } from "react";

export default function RegistroPage() {
  const [form, setForm] = useState({
    name: "",
    tipo: "",
    documento: "",
    email: "",
    direccion: "",
    ciudad: "",
    departamento: "",
    codigo_postal: "",
    telefono: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://127.0.0.1:5001/easybill/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("Cuenta creada correctamente. 🎉");
      window.location.href = "/easybill/dashboard";
    } else {
      alert("Error al registrar usuario.");
    }
  };

  return (
    <main style={styles.main}>
      <h1>Registro EasyBill</h1>
      <form onSubmit={handleSubmit} style={styles.form}>
        {Object.keys(form).map((campo) => (
          <input
            key={campo}
            name={campo}
            placeholder={campo.replace("_", " ")}
            onChange={handleChange}
            style={styles.input}
          />
        ))}
        <button type="submit" style={styles.btn}>
          Crear cuenta
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
    background: "#eef3ff",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "2rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    width: "320px",
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
