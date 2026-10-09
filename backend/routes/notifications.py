from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import get_db
from bson.objectid import ObjectId
import datetime

notifications_bp = Blueprint('notifications_bp', __name__)

@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    db = get_db()
    if db is None: return jsonify({"msg": "Database not configured."}), 503
    
    user_id = get_jwt_identity()
    notifs = list(db.notifications.find({"user_id": ObjectId(user_id)}).sort("created_at", -1).limit(50))
    for n in notifs:
        n['_id'] = str(n['_id'])
        n['user_id'] = str(n['user_id'])
    
    return jsonify(notifs), 200

@notifications_bp.route('/', methods=['POST'])
@jwt_required()
def create_notification():
    # Only allow internal creation or validated creation. For simplicity, we allow the user to create their own notifications (e.g. actions trigger them on the frontend).
    db = get_db()
    if db is None: return jsonify({"msg": "Database not configured."}), 503
    
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data.get('title') or not data.get('message'):
        return jsonify({"msg": "Title and message are required"}), 400
        
    new_notif = {
        "user_id": ObjectId(user_id),
        "title": data.get('title'),
        "message": data.get('message'),
        "type": data.get('type', 'info'),
        "read": False,
        "created_at": datetime.datetime.utcnow(),
        "timestamp": "Just now" # Keep compatibility with frontend format
    }
    
    res = db.notifications.insert_one(new_notif)
    new_notif['_id'] = str(res.inserted_id)
    new_notif['user_id'] = str(new_notif['user_id'])
    return jsonify(new_notif), 201

@notifications_bp.route('/<notif_id>/read', methods=['PUT'])
@jwt_required()
def mark_read(notif_id):
    db = get_db()
    if db is None: return jsonify({"msg": "Database not configured."}), 503
    
    user_id = get_jwt_identity()
    
    res = db.notifications.update_one(
        {"_id": ObjectId(notif_id), "user_id": ObjectId(user_id)},
        {"$set": {"read": True}}
    )
    
    if res.matched_count == 0:
        return jsonify({"msg": "Notification not found or unauthorized"}), 404
        
    return jsonify({"msg": "Marked as read"}), 200

@notifications_bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_read():
    db = get_db()
    if db is None: return jsonify({"msg": "Database not configured."}), 503
    
    user_id = get_jwt_identity()
    
    db.notifications.update_many(
        {"user_id": ObjectId(user_id), "read": False},
        {"$set": {"read": True}}
    )
    
    return jsonify({"msg": "All marked as read"}), 200
