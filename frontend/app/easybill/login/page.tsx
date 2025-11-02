"use client";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [fakePassword, setFakePassword] = useState("");

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
      alert("Usuario no encontrado 😕");
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-100 to-blue-200">
      <div className="bg-white/90 backdrop-blur-sm p-8 sm:p-10 rounded-2xl shadow-xl w-full max-w-md transform transition-all hover:scale-[1.01]">
        {/* Encabezado */}
        <div className="text-center mb-6">
          <span className="text-4xl">💙</span>
          <h1 className="text-3xl font-bold text-blue-900 mt-2">EasyBill</h1>
          <p className="text-gray-600 mt-1">
            Inicia sesión para continuar
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              required
            />
          </div>

          {/* Contraseña (simulada) */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={fakePassword}
              onChange={(e) => setFakePassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
            <p className="text-xs text-gray-400 mt-1">
              (Solo visual, no se valida por ahora)
            </p>
          </div>

          {/* Botones */}
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              className="w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-blue-300 focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
            >
              Entrar
            </button>

            {/* 🔙 Volver al inicio */}
            <a
              href="http://localhost:3000/easybill"
              className="w-full text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-all duration-300"
            >
              Volver al inicio
            </a>
          </div>

          {/* Enlace crear cuenta */}
          <div className="text-center mt-4">
            <a
              href="/easybill/registro"
              className="text-blue-700 hover:underline text-sm"
            >
              ¿No tienes cuenta? Crear una nueva
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}
