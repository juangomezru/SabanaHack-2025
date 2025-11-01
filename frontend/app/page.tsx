"use client";

import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Person {
  name: string;
  id: string;
  email: string;
}

interface Product {
  name: string;
  price: number;
}

interface Purchase {
  purchase_id: string;
  timestamp: string;
  products: Product[];
  total: number;
  payment_method: string;
}

interface RecognitionResult {
  recognized: boolean;
  person?: Person;
  purchase?: Purchase;
  email_sent?: boolean;
  confidence?: number;
  message?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function Home() {
  const router = useRouter(); 
  const webcamRef = useRef<Webcam>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [error, setError] = useState<string>("");
  const [useCamera, setUseCamera] = useState(true);

  const capture = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        await processImage(imageSrc);
      }
    }
  }, [webcamRef]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageSrc = e.target?.result as string;
        await processImage(imageSrc);
      };
      reader.readAsDataURL(file);
    }
  };
  const processImage = async (imageSrc: string) => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("image", blob, "capture.jpg");

      const apiResponse = await axios.post(
        `${API_URL}/api/recognize`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(apiResponse.data);

      // 👇 si la persona fue reconocida, redirige a /caja
      if (apiResponse.data.recognized) {
        router.push("/caja");
      }

    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="bg-[#002661] shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src="/Unisabana.png"
                alt="Universidad de La Sabana"
                width={180}
                height={60}
                className="h-12 w-auto"
              />
            </div>
            <h1 className="text-xl font-bold text-white">
              Sistema de Reconocimiento Facial
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#002661] mb-3">
              Identificación y Procesamiento de Compras
            </h2>
            <p className="text-gray-600 text-lg">
              Captura o sube una fotografía para identificar al usuario
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-6">
            <div className="flex justify-center mb-6 space-x-4">
              <button
                onClick={() => setUseCamera(true)}
                className={`px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
                  useCamera
                    ? "bg-[#002661] text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Usar Cámara
              </button>
              <button
                onClick={() => setUseCamera(false)}
                className={`px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 ${
                  !useCamera
                    ? "bg-[#002661] text-white shadow-lg"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Subir Foto
              </button>
            </div>

            <div className="flex flex-col items-center">
              {useCamera ? (
                <div className="w-full max-w-2xl">
                  <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-[#002661]">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="w-full"
                      videoConstraints={{
                        facingMode: "user",
                      }}
                    />
                  </div>
                  <button
                    onClick={capture}
                    disabled={loading}
                    className="w-full mt-6 bg-[#CE1126] hover:bg-[#b00f20] disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:transform-none disabled:shadow-none"
                  >
                    {loading ? "Procesando..." : "Capturar y Reconocer"}
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-2xl">
                  <label className="flex flex-col items-center justify-center w-full h-72 border-3 border-dashed border-[#002661] rounded-2xl cursor-pointer hover:border-[#CE1126] transition-all bg-gradient-to-br from-slate-50 to-blue-50 hover:from-blue-50 hover:to-slate-50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-16 h-16 mb-4 text-[#002661]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="mb-2 text-base text-gray-700 font-semibold">
                        Haz clic para subir o arrastra la imagen
                      </p>
                      <p className="text-sm text-gray-500">PNG, JPG o JPEG</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={loading}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-[#CE1126] p-4 mb-6 rounded-r-xl">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-[#CE1126]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              {result.recognized ? (
                <div>
                  <div className="mb-8 pb-8 border-b-2 border-gray-100">
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                        <svg
                          className="w-8 h-8 text-white transform -rotate-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div className="ml-5">
                        <h2 className="text-3xl font-bold text-[#002661]">
                          ¡Persona Reconocida!
                        </h2>
                        <p className="text-sm text-gray-500 mt-1 font-medium">
                          Confianza:{" "}
                          <span className="text-green-600 font-bold">
                            {((result.confidence || 0) * 100).toFixed(1)}%
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-br from-blue-50 to-slate-50 p-6 rounded-xl">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                          Nombre Completo
                        </p>
                        <p className="font-bold text-[#002661] text-lg">
                          {result.person?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                          Número de Identificación
                        </p>
                        <p className="font-bold text-[#002661] text-lg">
                          {result.person?.id}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                          Correo Electrónico
                        </p>
                        <p className="font-bold text-[#002661] text-lg">
                          {result.person?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {result.purchase && (
                    <div className="mb-8 pb-8 border-b-2 border-gray-100">
                      <h3 className="text-2xl font-bold text-[#002661] mb-6 flex items-center">
                        <svg
                          className="w-7 h-7 mr-3 text-[#CE1126]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        Detalles de Compra
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                            ID de Compra
                          </p>
                          <p className="font-bold text-gray-800">
                            {result.purchase.purchase_id}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                            Fecha
                          </p>
                          <p className="font-bold text-gray-800">
                            {result.purchase.timestamp}
                          </p>
                        </div>
                        <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl">
                          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                            Método de Pago
                          </p>
                          <p className="font-bold text-gray-800">
                            {result.purchase.payment_method}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border-2 border-[#002661]">
                        <h4 className="font-bold text-[#002661] mb-4 text-lg">
                          Artículos Comprados
                        </h4>
                        <div className="space-y-3">
                          {result.purchase.products.map((product, index) => (
                            <div
                              key={index}
                              className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm"
                            >
                              <span className="text-gray-700 font-medium">
                                {product.name}
                              </span>
                              <span className="font-bold text-[#002661] text-lg">
                                ${product.price.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-6 pt-6 border-t-2 border-[#002661]">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-xl text-[#002661]">
                              Total
                            </span>
                            <span className="font-bold text-[#CE1126] text-3xl">
                              ${result.purchase.total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div
                    className={`flex items-center p-5 rounded-xl shadow-md ${
                      result.email_sent
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300"
                        : "bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300"
                    }`}
                  >
                    <svg
                      className={`w-7 h-7 mr-3 ${
                        result.email_sent ? "text-green-600" : "text-yellow-600"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span
                      className={`font-semibold text-base ${
                        result.email_sent ? "text-green-800" : "text-yellow-800"
                      }`}
                    >
                      {result.email_sent
                        ? "¡Notificación por correo enviada exitosamente!"
                        : "Notificación por correo en cola (revisar logs del servidor)"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform rotate-3">
                    <svg
                      className="w-10 h-10 text-[#CE1126] transform -rotate-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-[#002661] mb-3">
                    Rostro No Reconocido
                  </h3>
                  <p className="text-gray-600 text-lg">{result.message}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
