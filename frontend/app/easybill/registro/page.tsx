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
  const [foto, setFoto] = useState<File | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      // 1️⃣ Crear o actualizar cliente
      const resCliente = await fetch("http://127.0.0.1:5001/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!resCliente.ok) throw new Error("Error creando cliente");

      // 2️⃣ Subir foto si existe
      if (foto) {
        const formData = new FormData();
        formData.append("image", foto);

        const resFoto = await fetch(
          `http://127.0.0.1:5001/api/clients/${form.documento}/images`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!resFoto.ok) throw new Error("Error subiendo foto");
      }

      alert("Cuenta creada correctamente con foto 🎉");
      window.location.href = "/easybill/dashboard";
    } catch (err: any) {
      alert(err.message || "Error al registrar usuario.");
    } finally {
      setCargando(false);
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
            required
          />
        ))}

        {/* 📸 Campo para tomar o subir foto */}
        <label style={{ fontWeight: "bold" }}>Foto del cliente:</label>
        <input
          type="file"
          accept="image/*"
          capture="user" // abre la cámara en móvil
          onChange={handleFotoChange}
          style={styles.input}
        />

        {foto && (
          <img
            src={URL.createObjectURL(foto)}
            alt="Previsualización"
            style={{ width: "100%", borderRadius: "8px", marginTop: "0.5rem" }}
          />
        )}

        <button type="submit" style={styles.btn} disabled={cargando}>
          {cargando ? "Creando cuenta..." : "Crear cuenta"}
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
