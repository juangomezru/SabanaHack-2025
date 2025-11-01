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

PEOPLE = {
    "juan_diego": {
        "name": "JUAN DIEGO GOMEZ RUEDA",
        "id": "1001286060",
        "email": "juandiego.gomez@example.com"
    },
    "brayan_yesid": {
        "name": "BRAYAN YESID BAEZ",
        "id": "100126736",
        "email": "brayan.baez@example.com"
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

known_face_encodings = []
known_face_names = []

def load_training_images():
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
                        print(f"Loaded training image: {filename} for {person_data['name']}")

def generate_mock_purchase():
    products = [
        {"name": "Laptop Dell XPS 13", "price": 1299.99},
        {"name": "iPhone 14 Pro", "price": 999.99},
        {"name": "Sony WH-1000XM5 Headphones", "price": 399.99},
        {"name": "iPad Pro 11-inch", "price": 799.99},
        {"name": "Samsung Galaxy Watch", "price": 249.99},
        {"name": "Kindle Paperwhite", "price": 139.99},
        {"name": "Logitech MX Master 3 Mouse", "price": 99.99},
        {"name": "AirPods Pro", "price": 249.99}
    ]
    
    selected_products = random.sample(products, random.randint(1, 3))
    total = sum(p['price'] for p in selected_products)
    
    return {
        "purchase_id": f"PUR-{random.randint(100000, 999999)}",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "products": selected_products,
        "total": round(total, 2),
        "payment_method": random.choice(["Credit Card", "Debit Card", "PayPal"])
    }


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "trained_faces": len(known_face_encodings)
    })

@app.route('/api/recognize', methods=['POST'])
def recognize_face():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image provided"}), 400
        
        file = request.files['image']
        
        # Read image
        image_bytes = file.read()
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        face_locations = face_recognition.face_locations(rgb_image)
        face_encodings = face_recognition.face_encodings(rgb_image, face_locations)
        
        if not face_encodings:
            return jsonify({"error": "No face detected in image"}), 400
        
        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.6)
            face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
            
            if True in matches:
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index]:
                    person_key = known_face_names[best_match_index]
                    person_data = PEOPLE[person_key]
                    
                    purchase_data = generate_mock_purchase()
                                        
                    return jsonify({
                        "recognized": True,
                        "person": person_data,
                        "purchase": purchase_data,
                        "confidence": float(1 - face_distances[best_match_index])
                    })
        
        return jsonify({
            "recognized": False,
            "message": "Face not recognized"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/people', methods=['GET'])
def get_people():
    """Get list of registered people"""
    return jsonify({
        "people": list(PEOPLE.values())
    })

if __name__ == '__main__':
    print("Loading training images...")
    load_training_images()
    print(f"Loaded {len(known_face_encodings)} face encodings")
    print("Starting Flask server...")
    app.run(debug=True, host='0.0.0.0', port=5000)
