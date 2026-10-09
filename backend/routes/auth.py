from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import datetime
from database import get_db
import re

auth_bp = Blueprint('auth_bp', __name__)

def is_valid_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

@auth_bp.route('/register', methods=['POST'])
def register():
    db = get_db()
    if db is None:
        return jsonify({"msg": "Database not configured."}), 503
        
    data = request.get_json()
    if not data:
        return jsonify({"msg": "Missing JSON in request"}), 400
        
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    university = data.get('university', '').strip()
    major = data.get('major', '').strip()

    if not name or not email or not password:
        return jsonify({"msg": "Missing required fields (name, email, password)."}), 400
        
    if not is_valid_email(email):
        return jsonify({"msg": "Invalid email format."}), 400
        
    if len(password) < 6:
        return jsonify({"msg": "Password must be at least 6 characters."}), 400

    if db.users.find_one({"email": email}):
        return jsonify({"msg": "Email already registered."}), 409

    hashed_pw = generate_password_hash(password)
    new_user = {
        "name": name,
        "email": email,
        "password": hashed_pw,
        "university": university,
        "major": major,
        "bio": f"Hi! I'm {name} studying {major} at {university}.",
        "skills": [],
        "created_at": datetime.datetime.utcnow(),
        "updated_at": datetime.datetime.utcnow(),
        "xp": 0,
        "level": 1,
        "levelTitle": "New Member",
        "avatar": None,
        "stats": {
            "projectsCompleted": 0,
            "collaborations": 0,
            "skillSwaps": 0,
            "endorsements": 0
        },
        "verifiedBadges": []
    }
    
    result = db.users.insert_one(new_user)
    
    access_token = create_access_token(identity=str(result.inserted_id), expires_delta=datetime.timedelta(days=7))
    return jsonify({"msg": "User created successfully", "token": access_token}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    db = get_db()
    if db is None:
        return jsonify({"msg": "Database not configured."}), 503
        
    data = request.get_json()
    if not data:
        return jsonify({"msg": "Missing JSON in request"}), 400
        
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    user = db.users.find_one({"email": email})
    if not user or not check_password_hash(user['password'], password):
        return jsonify({"msg": "Invalid credentials."}), 401
        
    user['_id'] = str(user['_id'])
    if 'verifiedBadges' not in user:
        user['verifiedBadges'] = []
    access_token = create_access_token(identity=str(user['_id']), expires_delta=datetime.timedelta(days=7))
    return jsonify({"msg": "Login successful", "token": access_token, "user": user}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    db = get_db()
    if db is None:
        return jsonify({"msg": "Database not configured."}), 503
        
    from bson.objectid import ObjectId
    current_user_id = get_jwt_identity()
    user = db.users.find_one({"_id": ObjectId(current_user_id)})
    
    if not user:
        return jsonify({"msg": "User not found."}), 404
        
    user['_id'] = str(user['_id'])
    if 'verifiedBadges' not in user:
        user['verifiedBadges'] = []
    del user['password']
    
    return jsonify({"user": user}), 200
