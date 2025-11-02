"use client";
import { useState, ChangeEvent, FormEvent } from "react";

export default function RegistroPage() {
  const [form, setForm] = useState({
    name: "",
    tipo: "C.C",
    documento: "",
    email: "",
    direccion: "",
    ciudad: "",
    departamento: "",
    codigo_postal: "",
    telefono: "",
  });

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [foto, setFoto] = useState<File | null>(null);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFoto(e.target.files[0]);
  };

  const validar = (): boolean => {
    const nuevos: Partial<Record<string, string>> = {};
    if (!form.name.trim()) nuevos.name = "El nombre es obligatorio.";
    if (!form.documento.trim()) nuevos.documento = "El documento es obligatorio.";
    if (!form.email.trim()) nuevos.email = "El correo es obligatorio.";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      nuevos.email = "El formato de correo es inválido.";
    if (!form.direccion.trim()) nuevos.direccion = "La dirección es obligatoria.";
    if (!form.ciudad.trim()) nuevos.ciudad = "La ciudad es obligatoria.";
    if (!form.departamento.trim()) nuevos.departamento = "El departamento es obligatorio.";
    if (!form.telefono.trim()) nuevos.telefono = "El teléfono es obligatorio.";
    if (!aceptaTerminos)
      nuevos.terminos = "Debes aceptar los términos y condiciones para continuar.";

    setErrors(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validar()) return;

    setCargando(true);
    try {
      const res = await fetch("http://127.0.0.1:5001/easybill/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error registrando cliente");

      if (foto) {
        const formData = new FormData();
        formData.append("image", foto);

        const resFoto = await fetch(
          `http://127.0.0.1:5001/api/clients/${form.documento}/images`,
          { method: "POST", body: formData }
        );
        if (!resFoto.ok) throw new Error("Error subiendo foto");
      }

      alert("Cliente registrado correctamente 🎉");
      window.location.href = "/easybill/dashboard";
    } catch (err: any) {
      alert(err.message || "Error al registrar usuario.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 space-y-8 relative">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Registro EasyBill</h1>
          <p className="mt-2 text-gray-500">
            Crea una nueva cuenta de cliente y agrega tu foto facial
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <Input label="Nombre completo" name="name" value={form.name} onChange={handleChange} error={errors.name} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select label="Tipo de documento" name="tipo" value={form.tipo} onChange={handleChange} />
            <Input label="Número de documento" name="documento" value={form.documento} onChange={handleChange} error={errors.documento} />
          </div>

          <Input label="Correo electrónico" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Dirección" name="direccion" value={form.direccion} onChange={handleChange} error={errors.direccion} />
            <Input label="Ciudad" name="ciudad" value={form.ciudad} onChange={handleChange} error={errors.ciudad} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Departamento" name="departamento" value={form.departamento} onChange={handleChange} error={errors.departamento} />
            <Input label="Código postal" name="codigo_postal" value={form.codigo_postal} onChange={handleChange} />
          </div>

          <Input label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} error={errors.telefono} />

          {/* 📸 Campo de foto */}
          <div className="mt-6">
            <label className="font-semibold text-gray-700 mb-2 block">Foto del cliente</label>

            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer"
              onClick={() => document.getElementById("fotoInput")?.click()}
            >
              {!foto ? (
                <div className="flex flex-col items-center">
                  <span className="text-5xl mb-2">📸</span>
                  <p className="text-gray-600 font-medium">
                    Haz clic o toca para tomar o subir una foto
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Formatos permitidos: JPG, PNG
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center w-full">
                  <img
                    src={URL.createObjectURL(foto)}
                    alt="Previsualización"
                    className="rounded-xl shadow-md object-cover w-48 h-48 border border-gray-200"
                  />
                  <p className="text-gray-600 mt-3 text-sm truncate w-full text-center">
                    {foto.name}
                  </p>
                </div>
              )}
            </div>

            <input
              id="fotoInput"
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFotoChange}
              className="hidden"
            />
          </div>

          {/* ✅ Checkbox Términos */}
          <div className="flex items-start mt-4">
            <input
              type="checkbox"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded mr-2 mt-1"
            />
            <p className="text-gray-600 text-sm leading-snug">
              Acepto los{" "}
              <button
                type="button"
                className="text-blue-700 font-semibold hover:underline"
                onClick={() => setMostrarModal(true)}
              >
                términos y condiciones
              </button>{" "}
              de EasyBill.
            </p>
          </div>
          {errors.terminos && (
            <p className="text-red-500 text-sm mt-1">{errors.terminos}</p>
          )}

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <a
              href="http://localhost:3000/easybill/"
              className="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors duration-300 text-lg"
            >
              Volver al inicio
            </a>

            <button
              type="submit"
              disabled={cargando}
              className="flex-1 bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-700 transition-colors duration-300 text-lg"
            >
              {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </div>
        </form>
      </div>

      {/* 🪟 Modal de Términos */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-lg p-6 relative">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Términos y Condiciones de EasyBill
            </h2>
            <div className="text-gray-600 text-sm space-y-3 max-h-64 overflow-y-auto pr-2">
              <p>
                1️⃣ EasyBill recopila los datos personales del usuario únicamente
                con el fin de facilitar procesos de facturación electrónica y
                programas de fidelización.
              </p>
              <p>
                2️⃣ La información proporcionada será tratada conforme a la Ley
                1581 de 2012 sobre protección de datos personales en Colombia.
              </p>
              <p>
                3️⃣ Al aceptar estos términos, el usuario autoriza a EasyBill a
                almacenar y usar sus datos para mejorar la experiencia del
                servicio, enviar comunicaciones relevantes y generar facturas
                electrónicas.
              </p>
              <p>
                4️⃣ El usuario puede solicitar la eliminación de sus datos en
                cualquier momento escribiendo a soporte@easybill.co.
              </p>
              <p>
                5️⃣ EasyBill no comparte ni vende datos a terceros. Toda
                información es confidencial.
              </p>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setMostrarModal(false)}
                className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg font-semibold shadow-md"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 🧩 Subcomponentes
function Input({ label, name, value, onChange, type = "text", error }: any) {
  return (
    <div>
      <label className="font-semibold text-gray-700 mb-1 block">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full border rounded-lg p-3 text-gray-800 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

function Select({ label, name, value, onChange }: any) {
  return (
    <div>
      <label className="font-semibold text-gray-700 mb-1 block">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded-lg p-3 text-gray-800"
      >
        <option value="C.C">C.C</option>
        <option value="T.I">T.I</option>
        <option value="C.E">C.E</option>
        <option value="NIT">NIT</option>
      </select>
    </div>
  );
}
