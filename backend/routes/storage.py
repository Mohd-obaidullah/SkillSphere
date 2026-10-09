from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
import datetime
from bson.objectid import ObjectId
from database import get_db
import uuid
import os
from werkzeug.utils import secure_filename
from services.b2_service import upload_to_b2, get_b2_url
from services.cloudinary_service import upload_to_cloudinary

storage_bp = Blueprint('storage_bp', __name__)

ALLOWED_DOC_EXTENSIONS = {'pdf', 'txt', 'md', 'docx'}
ALLOWED_IMG_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
MAX_DOC_SIZE = 10 * 1024 * 1024 # 10MB
MAX_IMG_SIZE = 5 * 1024 * 1024 # 5MB

def allowed_file(filename, allowed_set):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_set

@storage_bp.route('/upload/document', methods=['POST'])
@jwt_required()
def upload_document():
    if 'file' not in request.files:
        return jsonify({"msg": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"msg": "No selected file"}), 400
        
    if not allowed_file(file.filename, ALLOWED_DOC_EXTENSIONS):
        return jsonify({"msg": f"File type not allowed. Allowed: {', '.join(ALLOWED_DOC_EXTENSIONS)}"}), 400
        
    # Check size by reading into memory (for simplicity)
    file_content = file.read()
    file_size = len(file_content)
    file.seek(0)
    
    if file_size > MAX_DOC_SIZE:
        return jsonify({"msg": "File size exceeds 10MB limit."}), 400

    if not current_app.config.get('B2_APPLICATION_KEY'):
        return jsonify({"msg": "B2 integration unverified. Missing configuration."}), 503

    user_id = get_jwt_identity()
    room_id_str = request.form.get("room_id")
    
    db = get_db()
    if db is None:
        return jsonify({"msg": "Database not configured."}), 503
        
    if room_id_str:
        room = db.rooms.find_one({"_id": ObjectId(room_id_str)})
        if not room or ObjectId(user_id) not in room.get('members', []):
            return jsonify({"msg": "Not authorized to upload to this room."}), 403

    filename = secure_filename(file.filename)
    unique_key = f"docs/{user_id}/{uuid.uuid4().hex}_{filename}"
    
    success, result = upload_to_b2(file_content, unique_key, file.content_type)
    if not success:
        return jsonify({"msg": result}), 500
        
    # Save metadata to DB
    db = get_db()
    if db is not None:
        file_doc = {
            "original_filename": filename,
            "provider": "b2",
            "storage_key": unique_key,
            "uploader_id": ObjectId(user_id),
            "room_id": ObjectId(room_id_str) if room_id_str else None,
            "file_type": file.content_type,
            "size_bytes": file_size,
            "status": "active",
            "timestamp": datetime.datetime.utcnow(),
            "url": get_b2_url(unique_key)
        }
        res = db.files.insert_one(file_doc)
        file_doc["_id"] = str(res.inserted_id)
        file_doc["uploader_id"] = str(file_doc["uploader_id"])
        if file_doc["room_id"]:
            file_doc["room_id"] = str(file_doc["room_id"])
        return jsonify(file_doc), 201
    
    return jsonify({"msg": "Database not configured."}), 503

@storage_bp.route('/upload/image', methods=['POST'])
@jwt_required()
def upload_image():
    if 'file' not in request.files:
        return jsonify({"msg": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"msg": "No selected file"}), 400
        
    if not allowed_file(file.filename, ALLOWED_IMG_EXTENSIONS):
        return jsonify({"msg": f"File type not allowed. Allowed: {', '.join(ALLOWED_IMG_EXTENSIONS)}"}), 400
        
    file_content = file.read()
    file_size = len(file_content)
    file.seek(0)
    
    if file_size > MAX_IMG_SIZE:
        return jsonify({"msg": "Image size exceeds 5MB limit."}), 400

    if not current_app.config.get('CLOUDINARY_API_KEY'):
        return jsonify({"msg": "Cloudinary integration unverified. Missing configuration."}), 503

    user_id = get_jwt_identity()
    
    success, result = upload_to_cloudinary(file_content, folder=f"skillsphere/{user_id}")
    if not success:
        return jsonify({"msg": f"Upload failed: {result}"}), 500
        
    # Save metadata to DB
    db = get_db()
    if db is not None:
        file_doc = {
            "original_filename": secure_filename(file.filename),
            "provider": "cloudinary",
            "storage_key": result.get("public_id"),
            "uploader_id": ObjectId(user_id),
            "file_type": file.content_type,
            "size_bytes": file_size,
            "status": "active",
            "timestamp": datetime.datetime.utcnow(),
            "url": result.get("secure_url")
        }
        res = db.files.insert_one(file_doc)
        file_doc["_id"] = str(res.inserted_id)
        file_doc["uploader_id"] = str(file_doc["uploader_id"])
        
        # If it's a profile update request
        if request.form.get("update_profile") == "true":
            db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"avatar": file_doc["url"]}})
            
        return jsonify(file_doc), 201
        
    return jsonify({"msg": "Database not configured."}), 503
