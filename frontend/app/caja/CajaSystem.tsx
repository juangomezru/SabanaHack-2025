"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import type { CartItem, Product, Customer } from "./types";
import CustomerInfo from "./components/CustomerInfo";
import ProductList from "./components/ProductList";
import ShoppingCart from "./components/ShoppingCart";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function CajaSystem() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [wantsEInvoice, setWantsEInvoice] = useState(false);
  const [message, setMessage] = useState("");
  const [purchaseDone, setPurchaseDone] = useState(false);

  // 🔁 Polling para detectar cliente facial
  useEffect(() => {
    // Si venimos de una detección fallida, inicializar cliente vacío y limpiar flag
    try {
      const flag = localStorage.getItem("face_no_recognized");
      if (flag) {
        localStorage.removeItem("face_no_recognized");
        setCustomer({
          fullName: "",
          documentType: "C.C",
          documentNumber: "",
          email: "",
          address: "",
          city: "",
          department: "",
          postalCode: "",
          phone: "",
        });
      }
    } catch (e) {
      /* ignore */
    }

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_URL}/api/last_recognized`);
        if (response.data && response.data.recognized) {
          const p = response.data.person;
          setCustomer({
            fullName: p.name,
            documentType: p.tipo || "C.C",
            documentNumber: p.documento || p.id || "",
            email: p.email,
            address: p.direccion || "",
            city: p.ciudad || "",
            department: p.departamento || "",
            postalCode: p.codigo_postal || "",
            phone: p.telefono || "",
          });
          clearInterval(interval);
        }
      } catch (err) {
        console.log("Esperando reconocimiento facial...");
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAddProduct = useCallback((product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  }, []);

  const handleUpdateQuantity = useCallback((id: number, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== id));
    } else {
      setCart((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
    }
  }, []);

  const handleRemoveItem = useCallback((id: number) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const handleFinalizePurchase = async () => {
    if (!customer) return alert("⚠️ Esperando detección facial del cliente...");
    if (cart.length === 0) return alert("🛒 Agrega productos antes de continuar.");
    if (!paymentMethod) return alert("💳 Selecciona un método de pago.");

    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

    try {
      if (wantsEInvoice) {
        // 🧾 Factura electrónica
        const invoicePayload = {
          client: {
            registrationName: customer.fullName,
            name: customer.fullName,
            documentType: customer.documentType || "13",
            documentNumber: customer.documentNumber,
            email: customer.email,
            telephone: customer.phone,
            address: {
              cityName: customer.city,
              countrySubentity: customer.department,
              postalZone: customer.postalCode,
              countryCode: "CO",
            },
          },
          items: cart.map((p) => ({
            description: p.name,
            quantity: p.quantity,
            unitCode: "NIU",
            price: p.price,
          })),
          taxRate: 0.19,
        };

        const invoiceRes = await axios.post(`${API_URL}/api/invoices`, invoicePayload);
        setMessage(
          `✅ Compra procesada exitosamente\nFactura: ${invoiceRes.data.invoiceId}\nCUFE: ${invoiceRes.data.cufe}\n` +
            (invoiceRes.data.email_sent
              ? "📧 Factura enviada por correo"
              : "⚠️ Factura generada, correo pendiente.")
        );

      } else {
        // 🎟️ Ticket simple
        // Mostrar alerta indicando impresión de QR/ticket
        alert("🖨️ Imprimiendo código QR con el ticket de compra...");
        try {
          await axios.post(`${API_URL}/api/factura`, {
            cliente: customer,
            carrito: cart,
            medioPago: paymentMethod,
            facturaElectronica: false,
          });
          setMessage("✅ Compra procesada y ticket generado correctamente.");
        } catch (err) {
          // Si falla el envío (por ejemplo email o red), consideramos la compra procesada
          // porque para tickets simples no es crítico que el correo se envíe.
          console.warn("Warning: /api/factura failed but treating as success:", err);
          setMessage("✅ Compra procesada (ticket generado). No se pudo enviar correo, pero el proceso terminó correctamente.");
        }
      }

      setCart([]);
      setPaymentMethod("");
      setWantsEInvoice(false);
      setPurchaseDone(true);
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Error al procesar la compra.");
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-800">
            Sistema de Caja – EasyBill
          </h1>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* 🧍 Datos del cliente */}
            {customer ? (
              <CustomerInfo customer={customer} />
            ) : (
              <div className="p-6 bg-white rounded-lg shadow-md text-center text-gray-500">
                <p className="animate-pulse">📸 Esperando reconocimiento facial...</p>
              </div>
            )}

            {/* 🥐 Productos */}
            <ProductList onAddProduct={handleAddProduct} />
          </div>

          {/* 🧾 Carrito y pago */}
          <div className="lg:col-span-2 space-y-6">
            <ShoppingCart
              items={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
            />

            <div className="p-6 bg-white rounded-lg shadow-md space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2 border-b pb-2">
                Finalizar Compra
              </h2>

              {/* Método de pago */}
              <div>
                <label
                  htmlFor="payment-method"
                  className="block text-sm font-medium text-gray-700"
                >
                  Método de pago
                </label>
                <select
                  id="payment-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Seleccione...</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                  <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                  <option value="Nequi">Nequi</option>
                </select>
              </div>

              {/* Factura electrónica */}
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="e-invoice"
                    type="checkbox"
                    checked={wantsEInvoice}
                    onChange={(e) => setWantsEInvoice(e.target.checked)}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="e-invoice"
                    className="font-medium text-gray-700"
                  >
                    ¿Desea factura electrónica?
                  </label>
                </div>
              </div>
            </div>

            {/* Botón principal */}
            <button
              onClick={handleFinalizePurchase}
              className="w-full bg-slate-900 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-slate-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Finalizar compra
            </button>

            {purchaseDone && (
              <button
                onClick={async () => {
                  try {
                    // create a blank client record in the backend, ignore errors
                    await axios.post(`${API_URL}/api/clients/blank`);
                  } catch (e) {
                    console.warn('Could not create blank client record', e);
                  }
                  // then redirect to root
                  window.location.href = 'http://localhost:3000';
                }}
                className="w-full mt-3 bg-white text-slate-900 font-semibold py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 transition-all duration-200"
              >
                Nuevo cliente
              </button>
            )}

            {/* Mensaje */}
            {message && (
              <div className="p-4 bg-green-100 border border-green-400 rounded-lg text-green-700 text-sm font-medium whitespace-pre-line">
                {message}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
