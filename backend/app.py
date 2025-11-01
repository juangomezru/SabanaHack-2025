from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
import cv2
import numpy as np
import os
import json
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random

app = Flask(__name__)
CORS(app)

# =============================
# 👥 BASE DE DATOS DE PERSONAS

PEOPLE = {
    "juan_diego": {
        "name": "JUAN DIEGO GOMEZ RUEDA",
        "tipo": "C.C",
        "documento": "1001286060",
        "email": "juandiego.gomez@example.com",
        "direccion": "Cra 192 f N 23",
        "ciudad": "Bogotá",
        "departamento": "Bogotá",
        "codigo_postal": "111161",
        "telefono": "3132478282"
    },
    "brayan_yesid": {
        "name": "BRAYAN YESID BAEZ",
        "tipo": "C.C",
        "documento": "1001223222",
        "email": "brayan.baez@example.com",
        "direccion": "Cra 192 f N 23",
        "ciudad": "Bogotá",
        "departamento": "Bogotá",
        "codigo_postal": "111161",
        "telefono": "3132478282"
    },
    
    "juan_mateus": {
        "name": "JUAN PABLO MATEUS PARDO",
        "id": "1000019437",
        "email": "juan.mateus@example.com"
    },
    "sofia_sanchez": {
        "name": "CLAUDIA SOFIA SANCHEZ TORRES",
        "id": "1001286059",
        "email": "claudia.sanchez@example.com"
    },
    "juan_villalobos": {
        "name": "JUAN ESTABAN VILLALOBOS CLAVIJO",
        "id": "1001286075",
        "email": "juan.villalobos@example.com"
    }
}

# ===========================================
# 📸 VARIABLES GLOBALES Y FUNCIONES AUXILIARES
# ===========================================
known_face_encodings = []
known_face_names = []
last_recognized = None  # 🔹 Guardará el último cliente reconocido


def load_training_images():
    """Carga todas las imágenes de entrenamiento y crea los encodings."""
    global known_face_encodings, known_face_names
    training_dir = os.path.join(os.path.dirname(__file__), '..', 'training_images')

    for person_key, person_data in PEOPLE.items():
        person_dir = os.path.join(training_dir, person_key)
        if os.path.exists(person_dir):
            for filename in os.listdir(person_dir):
                if filename.endswith(('.jpg', '.jpeg', '.png')):
                    image_path = os.path.join(person_dir, filename)
                    image = face_recognition.load_image_file(image_path)
                    encodings = face_recognition.face_encodings(image)

                    if encodings:
                        known_face_encodings.append(encodings[0])
                        known_face_names.append(person_key)
                        print(f"✅ Loaded: {filename} for {person_data['name']}")


def generate_mock_purchase():
    """Genera una compra simulada para pruebas."""
    products = [
        {"name": "Pan de bono", "price": 2000},
        {"name": "Croissant", "price": 3500},
        {"name": "Galleta de avena", "price": 2500},
        {"name": "Café americano", "price": 3000},
        {"name": "Chocolate caliente", "price": 3500},
    ]

    selected = random.sample(products, random.randint(1, 3))
    total = sum(p['price'] for p in selected)

    return {
        "purchase_id": f"PUR-{random.randint(100000, 999999)}",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "products": selected,
        "total": total,
        "payment_method": random.choice(["Efectivo", "Tarjeta", "Transferencia"])
    }


# ===========================
# 🚀 ENDPOINTS DEL SERVIDOR
# ===========================
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "faces_trained": len(known_face_encodings)})


@app.route('/api/recognize', methods=['POST'])
def recognize_face():
    """Detecta rostros en una imagen y devuelve los datos del cliente."""
    global last_recognized
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400

        file = request.files['image']
        image_bytes = file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        # Detección facial
        face_locations = face_recognition.face_locations(rgb_image)
        face_encodings = face_recognition.face_encodings(rgb_image, face_locations)

        if not face_encodings:
            return jsonify({"recognized": False, "message": "No se detectó ningún rostro"})

        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.6)
            distances = face_recognition.face_distance(known_face_encodings, face_encoding)

            if True in matches:
                best_match = np.argmin(distances)
                person_key = known_face_names[best_match]
                person_data = PEOPLE[person_key]
                confidence = float(1 - distances[best_match])

                # Guardar el último reconocido
                last_recognized = {
                    "recognized": True,
                    "person": person_data,
                    "confidence": confidence
                }

                purchase = generate_mock_purchase()

                return jsonify({
                    "recognized": True,
                    "person": person_data,
                    "purchase": purchase,
                    "confidence": confidence
                })

        return jsonify({"recognized": False, "message": "Rostro no reconocido"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/last_recognized', methods=['GET'])
def get_last_recognized():
    """Devuelve los datos del último cliente detectado."""
    global last_recognized
    if last_recognized:
        return jsonify(last_recognized)
    else:
        return jsonify({"recognized": False, "message": "No se ha detectado ningún cliente"})


@app.route('/api/factura', methods=['POST'])
def send_factura():
    """Procesa la compra y envía ticket/factura por correo."""
    data = request.get_json()

    if not data or 'cliente' not in data:
        return jsonify({"error": "Datos incompletos"}), 400

    cliente = data['cliente']
    carrito = data.get('carrito', [])
    medio = data.get('medioPago', 'Desconocido')
    factura_electronica = data.get('facturaElectronica', False)
    total = sum(p['precio'] for p in carrito)

    # Generar resumen de compra
    items = "\n".join([f"- {p['nombre']} (${p['precio']})" for p in carrito])
    mensaje = f"""
    Hola {cliente['name']},

    Gracias por tu compra en la Panadería Unisabana 🍞

    Detalles:
    Cédula: {cliente['id']}
    Correo: {cliente['email']}
    Método de pago: {medio}

    Productos:
    {items}

    Total: ${total}

    {"✅ Se ha enviado tu factura electrónica al correo." if factura_electronica else "🧾 Recibirás solo tu ticket de compra."}

    Fecha: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
    """

    # (Puedes activar el envío real con SMTP más adelante)
    print("=== FACTURA/TICKET GENERADO ===")
    print(mensaje)

    return jsonify({
        "success": True,
        "message": "Compra procesada correctamente",
        "email_sent": factura_electronica
    })


# ===========================
# 🧠 INICIO DEL SERVIDOR
# ===========================
if __name__ == '__main__':
    print("Cargando imágenes de entrenamiento...")
    load_training_images()
    print(f"✅ {len(known_face_encodings)} rostros cargados.")
    print("🚀 Iniciando servidor Flask...")
    app.run(debug=True, host='0.0.0.0', port=5001)
