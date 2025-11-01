"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import "./CajaSystem.css";

interface Cliente {
  name: string;
  tipo: string;
  documento: string;
  email: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  codigo_postal: string;
  telefono: string;
}

interface Producto {
  id: number;
  nombre: string;
  precio: number;
}

interface CarritoItem extends Producto {}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function CajaSystem() {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [medioPago, setMedioPago] = useState("");
  const [facturaElectronica, setFacturaElectronica] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const productos: Producto[] = [
    { id: 1, nombre: "Pan de bono", precio: 2000 },
    { id: 2, nombre: "Croissant", precio: 3500 },
    { id: 3, nombre: "Galleta de avena", precio: 2500 },
    { id: 4, nombre: "Café americano", precio: 3000 },
    { id: 5, nombre: "Chocolate caliente", precio: 3500 },
  ];

  // Polling al backend para ver si hay cliente detectado
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_URL}/api/last_recognized`);
        if (response.data && response.data.recognized) {
          setCliente(response.data.person);
          clearInterval(interval);
        }
      } catch (error) {
        console.log("Esperando detección facial...");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const agregarProducto = (producto: Producto) => {
    setCarrito([...carrito, producto]);
  };

  const total = carrito.reduce((acc, p) => acc + p.precio, 0);

  const finalizarCompra = async () => {
    if (!cliente) {
      alert("Primero se debe detectar un cliente.");
      return;
    }
    if (!medioPago) {
      alert("Selecciona un método de pago.");
      return;
    }

    const payload = {
      cliente,
      carrito,
      medioPago,
      facturaElectronica,
    };

    try {
      const res = await axios.post(`${API_URL}/api/factura`, payload);
      setMensaje(res.data.message);
      setCarrito([]);
      setMedioPago("");
      setFacturaElectronica(false);
    } catch (err: any) {
      setMensaje(err.response?.data?.error || "Error al procesar la compra");
    }
  };

  return (
    <div className="caja-container">
      <h1>Sistema de Caja - Panadería Unisabana</h1>

      <section className="productos">
        <h2>Productos disponibles</h2>
        <div className="lista-productos">
          {productos.map((p) => (
            <button
              key={p.id}
              onClick={() => agregarProducto(p)}
              className="btn-producto"
            >
              {p.nombre} - ${p.precio}
            </button>
          ))}
        </div>
      </section>

      <section className="carrito">
        <h2>Carrito</h2>
        {carrito.length === 0 ? (
          <p>No hay productos agregados.</p>
        ) : (
          <ul>
            {carrito.map((p, i) => (
              <li key={i}>
                {p.nombre} - ${p.precio}
              </li>
            ))}
          </ul>
        )}
        <p className="total">Total: ${total}</p>
      </section>

      <section className="cliente">
        <h2>Datos del Cliente</h2>
        {cliente ? (
          <div className="datos">
            <p><b>Nombre:</b> {cliente.name}</p>
            <p><b>Tipo de documento:</b> {cliente.tipo}</p>
            <p><b>Número:</b> {cliente.documento}</p>
            <p><b>Correo:</b> {cliente.email}</p>
            <p><b>Teléfono:</b> {cliente.telefono}</p>
            <p><b>Dirección:</b> {cliente.direccion}</p>
            <p><b>Ciudad:</b> {cliente.ciudad}</p>
            <p><b>Departamento:</b> {cliente.departamento}</p>
            <p><b>Código postal:</b> {cliente.codigo_postal}</p>
          </div>
        ) : (
          <p className="espera">Esperando reconocimiento facial...</p>
        )}
      </section>

      <section className="pago">
        <h2>Método de pago</h2>
        <select value={medioPago} onChange={(e) => setMedioPago(e.target.value)}>
          <option value="">Seleccione</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Tarjeta">Tarjeta</option>
          <option value="Transferencia">Transferencia</option>
        </select>
      </section>

      <section className="factura">
        <label>
          <input
            type="checkbox"
            checked={facturaElectronica}
            onChange={() => setFacturaElectronica(!facturaElectronica)}
          />
          ¿Desea factura electrónica?
        </label>
      </section>

      <button className="btn-finalizar" onClick={finalizarCompra}>
        Finalizar compra
      </button>

      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
}
