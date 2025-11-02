"use client";

import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import axios from "axios";
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

export default function FacialRecognitionPage() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [error, setError] = useState<string>("");

  const capture = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        await processImage(imageSrc);
      }
    }
  }, [webcamRef]);

  const processImage = async (imageSrc: string) => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("image", blob, "capture.jpg");

      const apiResponse = await axios.post(`${API_URL}/api/recognize`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(apiResponse.data);
      if (apiResponse.data.recognized) {
        router.push("/caja");
      } else {
        // Mostrar alerta visual en la UI (se muestra en el bloque result)
        // Además redirigir a /caja después de ~4s y pedir que el número de documento quede vacío
        // Usamos localStorage como señal para que /caja inicialice un cliente vacío
        try {
          localStorage.setItem("face_no_recognized", "1");
        } catch (e) {
          /* ignore */
        }
        setTimeout(() => {
          router.push("/caja");
        }, 4000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#001E4D] to-[#00388B] text-white px-6 relative">
      {/* Header */}
      <div className="absolute top-6 left-6">
        <h1 className="text-lg font-semibold tracking-tight">
          EasyBill – Sistema de Reconocimiento Facial
        </h1>
      </div>

      {/* Tarjeta central */}
      <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8 w-full max-w-2xl text-center">
        <h2 className="text-3xl font-bold mb-2">Identificación de Cliente</h2>
        <p className="text-gray-200 mb-8">
          Captura tu rostro para continuar con la facturación
        </p>

        {/* Cámara */}
        <div className="flex flex-col items-center justify-center">
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 max-w-lg w-full relative">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full"
              videoConstraints={{ facingMode: "user" }}
            />
          </div>

          <button
            onClick={capture}
            disabled={loading}
            className={`mt-8 px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
              loading
                ? "bg-gray-400 cursor-wait"
                : "bg-[#CE1126] hover:bg-[#b00f20] text-white hover:scale-105"
            }`}
          >
            {loading ? "Procesando..." : "Capturar y reconocer"}
          </button>
        </div>

        {/* Mensajes */}
        {error && (
          <p className="mt-6 bg-red-500/80 px-4 py-2 rounded-lg text-sm font-semibold">
            {error}
          </p>
        )}

        {result && !loading && (
          <div className="mt-10 transition-all animate-fade-in">
            {result.recognized ? (
              <div className="bg-green-100/20 border-2 border-green-400 rounded-2xl p-6 text-green-100">
                <h3 className="text-2xl font-bold mb-2 text-green-300">
                  ✅ Cliente reconocido
                </h3>
                <p className="text-sm text-green-100 mb-3">
                  Confianza del sistema:{" "}
                  <span className="font-bold">
                    {((result.confidence || 0) * 100).toFixed(1)}%
                  </span>
                </p>
                <p className="text-lg font-semibold">
                  {result.person?.name} — {result.person?.id}
                </p>
                <p className="text-sm opacity-80">{result.person?.email}</p>
              </div>
            ) : (
              <div className="bg-red-100/20 border-2 border-red-400 rounded-2xl p-6 text-red-100">
                <h3 className="text-2xl font-bold mb-2 text-red-300">
                  ❌ Rostro no reconocido
                </h3>
                <p className="text-sm text-red-100">{result.message}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="absolute bottom-4 text-sm text-white/70">
        EasyBill • Sistema de Facturación Inteligente
      </footer>
    </div>
  );
}
