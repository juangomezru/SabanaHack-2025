from flask import Flask, request, jsonify, Response
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
from typing import Any, cast

from database import SessionLocal, init_db
from models import Client, Invoice
from xml_utils import build_ubl_invoice

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

# Default supplier (emisor) info for DIAN UBL
SUPPLIER = {
    "name": "JUAN PÉREZ GÓMEZ",
    "registrationName": "JUAN PÉREZ GÓMEZ",
    "documentType": "13",  # Cédula de ciudadanía
    "documentNumber": "1234567890",
    "countryCode": "CO",
    "cityName": "BOGOTÁ",
    "countrySubentity": "11",
    "postalZone": None,
    "email": None,
    "telephone": None,
}

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


def _get_db_session():
    return SessionLocal()


@app.route('/api/clients', methods=['GET'])
def list_clients():
    session = _get_db_session()
    try:
        clients = session.query(Client).order_by(Client.created_at.desc()).all()
        return jsonify({
            "clients": [
                {
                    "id": c.id,
                    "registrationName": c.registration_name,
                    "name": c.name,
                    "documentType": c.document_type,
                    "documentNumber": c.document_number,
                    "email": c.email,
                    "telephone": c.telephone,
                    "address": {
                        "cityName": c.city_name,
                        "countrySubentity": c.country_subentity,
                        "postalZone": c.postal_zone,
                        "countryCode": c.country_code,
                    },
                    "createdAt": c.created_at.isoformat(),
                } for c in clients
            ]
        })
    finally:
        session.close()


@app.route('/api/clients', methods=['POST'])
def create_client():
    """Create or update a client (upsert by documentNumber)."""
    payload: dict[str, Any] = request.get_json(force=True, silent=False)
    required = ["registrationName", "name", "documentType", "documentNumber"]
    missing = [k for k in required if not payload.get(k)]
    if missing:
        return jsonify({"error": f"Faltan campos requeridos del cliente: {', '.join(missing)}"}), 400

    session = _get_db_session()
    try:
        client = session.query(Client).filter(Client.document_number == payload["documentNumber"]).first()
        if not client:
            client = Client(
                registration_name=payload["registrationName"],
                name=payload["name"],
                document_type=payload["documentType"],
                document_number=payload["documentNumber"],
                email=payload.get("email"),
                telephone=payload.get("telephone"),
                city_name=(payload.get("address") or {}).get("cityName"),
                country_subentity=(payload.get("address") or {}).get("countrySubentity"),
                postal_zone=(payload.get("address") or {}).get("postalZone"),
                country_code=(payload.get("address") or {}).get("countryCode", "CO"),
            )
            session.add(client)
        else:
            setattr(client, "registration_name", payload["registrationName"])
            setattr(client, "name", payload["name"])
            setattr(client, "document_type", payload["documentType"])
            setattr(client, "email", payload.get("email"))
            setattr(client, "telephone", payload.get("telephone"))
            setattr(client, "city_name", (payload.get("address") or {}).get("cityName"))
            setattr(client, "country_subentity", (payload.get("address") or {}).get("countrySubentity"))
            setattr(client, "postal_zone", (payload.get("address") or {}).get("postalZone"))
            setattr(client, "country_code", (payload.get("address") or {}).get("countryCode", client.country_code or "CO"))

        session.commit()
        session.refresh(client)

        return jsonify({
            "id": client.id,
            "registrationName": client.registration_name,
            "name": client.name,
            "documentType": client.document_type,
            "documentNumber": client.document_number,
            "email": client.email,
            "telephone": client.telephone,
            "address": {
                "cityName": client.city_name,
                "countrySubentity": client.country_subentity,
                "postalZone": client.postal_zone,
                "countryCode": client.country_code,
            },
            "createdAt": client.created_at.isoformat(),
        }), 201
    except Exception as e:
        session.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()


@app.route('/api/invoices', methods=['GET'])
def list_invoices():
    session = _get_db_session()
    try:
        invoices = session.query(Invoice).order_by(Invoice.created_at.desc()).all()
        return jsonify({
            "invoices": [
                {
                    "id": inv.id,
                    "invoiceId": inv.invoice_id,
                    "clientId": inv.client_id,
                    "currency": inv.currency,
                    "issueDate": inv.issue_date.isoformat(),
                    "payableAmount": inv.payable_amount,
                    "cufe": inv.cufe,
                } for inv in invoices
            ]
        })
    finally:
        session.close()


@app.route('/api/invoices', methods=['POST'])
def create_invoice():
    """
    Create a DIAN UBL 2.1 invoice using CLIENTE (persona natural) information.
    Expected JSON body:
      {
        "client": {
          "registrationName": str, "name": str,
          "documentType": str, "documentNumber": str,
          "email": str?, "telephone": str?,
          "address": {"cityName": str?, "countrySubentity": str?, "postalZone": str?, "countryCode": str?}
        },
        "items": [{"description": str, "quantity": number, "unitCode": str, "price": number}]?,
        "paymentDueDate": "YYYY-MM-DD"?,
        "taxRate": number?  # default 0.19
      }
    """
    payload: dict[str, Any] = request.get_json(force=True, silent=False)
    client_in = payload.get("client", {})
    items_in = payload.get("items", [])
    payment_due = payload.get("paymentDueDate")
    tax_rate = float(payload.get("taxRate", 0.19))

    # Validate client required fields
    required = ["registrationName", "name", "documentType", "documentNumber"]
    missing = [k for k in required if not client_in.get(k)]
    if missing:
        return jsonify({"error": f"Faltan campos requeridos del cliente: {', '.join(missing)}"}), 400

    # Default items if none provided
    if not items_in:
        items_in = [
            {
                "description": "Servicio de asesoría técnica",
                "quantity": 1,
                "unitCode": "NIU",
                "price": 150000.00,
            }
        ]

    session = _get_db_session()
    try:
        # Upsert client by document number
        client = session.query(Client).filter(Client.document_number == client_in["documentNumber"]).first()
        if not client:
            client = Client(
                registration_name=client_in["registrationName"],
                name=client_in["name"],
                document_type=client_in["documentType"],
                document_number=client_in["documentNumber"],
                email=client_in.get("email"),
                telephone=client_in.get("telephone"),
                city_name=(client_in.get("address") or {}).get("cityName"),
                country_subentity=(client_in.get("address") or {}).get("countrySubentity"),
                postal_zone=(client_in.get("address") or {}).get("postalZone"),
                country_code=(client_in.get("address") or {}).get("countryCode", "CO"),
            )
            session.add(client)
            session.flush()

        # Generate or accept provided full invoice ID (e.g., "PN1001")
        provided_full = (payload.get("invoiceId") or "").strip()
        if provided_full:
            invoice_id_full = provided_full
        else:
            prefix_gen = "PN"
            numeric_gen = int(datetime.now().strftime("%H%M%S"))
            invoice_id_full = f"{prefix_gen}{numeric_gen}"

        # Extract prefix (letters) and numeric part
        prefix = "".join([ch for ch in invoice_id_full if ch.isalpha()]) or "PN"
        numeric_part = "".join([ch for ch in invoice_id_full if ch.isdigit()]) or invoice_id_full

        # Authorization placeholders (replace with real resolution data in production)
        authorization = {
            "prefix": prefix,
            "from": 1,
            "to": 999999,
            "startDate": f"{datetime.now().year}-01-01",
            "endDate": f"{datetime.now().year}-12-31",
            "authorizationNumber": "18760000001",
        }

        issue_dt = datetime.now()

        supplier = SUPPLIER.copy()

        client_payload = {
            "name": client.name,
            "registrationName": client.registration_name,
            "documentType": client.document_type,
            "documentNumber": client.document_number,
            "countryCode": client.country_code,
            "cityName": client.city_name,
            "countrySubentity": client.country_subentity,
            "postalZone": client.postal_zone,
            "email": client.email,
            "telephone": client.telephone,
        }

        xml_str, cufe, qrcode = build_ubl_invoice(
            invoice_id=numeric_part,
            profile_execution_id="2",
            currency="COP",
            issue_date=issue_dt,
            payment_due_date=payment_due,
            tax_rate=tax_rate,
            supplier=supplier,
            client=client_payload,
            items=items_in,
            authorization=authorization,
        )

        # Compute totals locally to persist
        subtotal = sum(float(i.get("quantity", 1)) * float(i.get("price", 0.0)) for i in items_in)
        tax_exclusive = subtotal
        tax_inclusive = round(tax_exclusive * (1 + tax_rate), 2)
        payable = tax_inclusive

        inv = Invoice(
            invoice_id=invoice_id_full,
            currency="COP",
            issue_date=issue_dt,
            line_extension_amount=round(tax_exclusive, 2),
            tax_exclusive_amount=round(tax_exclusive, 2),
            tax_inclusive_amount=tax_inclusive,
            payable_amount=payable,
            tax_rate=tax_rate,
            cufe=cufe,
            qrcode_url=qrcode,
            xml_content=xml_str,
            client_id=client.id,
        )
        session.add(inv)
        session.commit()

        return jsonify({
            "invoiceId": inv.invoice_id,
            "cufe": inv.cufe,
            "qrcode": inv.qrcode_url,
            "currency": inv.currency,
            "payableAmount": inv.payable_amount,
            "xml": inv.xml_content,
        }), 201
    except Exception as e:
        session.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()


@app.route('/api/invoices/<invoice_id>/xml', methods=['GET'])
def get_invoice_xml(invoice_id: str):
    """Return the stored UBL XML for a given invoice. Accepts invoiceId (e.g., PN1001) or numeric ID."""
    session = _get_db_session()
    try:
        inv = session.query(Invoice).filter(Invoice.invoice_id == invoice_id).first()
        if not inv and invoice_id.isdigit():
            inv = session.query(Invoice).filter(Invoice.id == int(invoice_id)).first()

        if inv is None or not (inv.xml_content or "").strip():
            return jsonify({"error": "Invoice not found"}), 404

        xml_text = cast(str, inv.xml_content)
        resp = Response(xml_text, status=200, mimetype='application/xml')
        resp.headers['Content-Disposition'] = f'inline; filename="{inv.invoice_id}.xml"'
        return resp
    finally:
        session.close()

if __name__ == '__main__':
    print("Initializing database...")
    init_db()
    print("Loading training images...")
    load_training_images()
    print(f"✅ {len(known_face_encodings)} rostros cargados.")
    print("🚀 Iniciando servidor Flask...")
    app.run(debug=True, host='0.0.0.0', port=5000)
