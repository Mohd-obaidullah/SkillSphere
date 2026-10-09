from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import get_db
from bson.objectid import ObjectId
import datetime

rooms_bp = Blueprint('rooms_bp', __name__)

@rooms_bp.route('/', methods=['GET'])
@jwt_required()
def get_rooms():
    db = get_db()
    rooms = list(db.rooms.find({}))
    for r in rooms:
        r['_id'] = str(r['_id'])
        r['owner_id'] = str(r['owner_id'])
        r['members'] = [str(m) for m in r.get('members', [])]
    return jsonify(rooms), 200

@rooms_bp.route('/', methods=['POST'])
@jwt_required()
def create_room():
    db = get_db()
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('title'):
        return jsonify({"msg": "Title is required"}), 400
        
    room = {
        "title": data.get('title'),
        "description": data.get('description', ''),
        "subject": data.get('subject', 'General'),
        "owner_id": ObjectId(user_id),
        "members": [ObjectId(user_id)],
        "created_at": datetime.datetime.utcnow(),
        "active": True
    }
    
    res = db.rooms.insert_one(room)
    room['_id'] = str(res.inserted_id)
    room['owner_id'] = str(room['owner_id'])
    room['members'] = [str(m) for m in room['members']]
    
    return jsonify(room), 201

@rooms_bp.route('/<room_id>/join', methods=['POST'])
@jwt_required()
def join_room(room_id):
    db = get_db()
    user_id = get_jwt_identity()
    
    room = db.rooms.find_one({"_id": ObjectId(room_id)})
    if not room: return jsonify({"msg": "Room not found"}), 404
    
    if ObjectId(user_id) in room.get('members', []):
        return jsonify({"msg": "Already a member"}), 400
        
    db.rooms.update_one({"_id": ObjectId(room_id)}, {"$push": {"members": ObjectId(user_id)}})
    return jsonify({"msg": "Joined room"}), 200

@rooms_bp.route('/<room_id>/questions', methods=['GET'])
@jwt_required()
def get_questions(room_id):
    db = get_db()
    user_id = get_jwt_identity()
    room = db.rooms.find_one({"_id": ObjectId(room_id)})
    if not room or ObjectId(user_id) not in room.get('members', []):
        return jsonify({"msg": "Not authorized"}), 403
    questions = list(db.discussions.find({"room_id": ObjectId(room_id)}))
    for q in questions:
        q['_id'] = str(q['_id'])
        q['room_id'] = str(q['room_id'])
        q['author_id'] = str(q['author_id'])
        # expand author
        author = db.users.find_one({"_id": ObjectId(q['author_id'])}, {"name":1, "avatar":1})
        q['author'] = {"name": author.get('name') if author else "Unknown", "avatar": author.get('avatar') if author else None}
    return jsonify(questions), 200

@rooms_bp.route('/<room_id>/questions', methods=['POST'])
@jwt_required()
def create_question(room_id):
    db = get_db()
    user_id = get_jwt_identity()
    data = request.get_json()
    
    room = db.rooms.find_one({"_id": ObjectId(room_id)})
    if not room or ObjectId(user_id) not in room.get('members', []):
        return jsonify({"msg": "Not authorized to post in this room"}), 403
        
    q = {
        "room_id": ObjectId(room_id),
        "author_id": ObjectId(user_id),
        "title": data.get('title'),
        "content": data.get('content', ''),
        "replies": [],
        "created_at": datetime.datetime.utcnow()
    }
    
    res = db.discussions.insert_one(q)
    q['_id'] = str(res.inserted_id)
    return jsonify({"msg": "Question created"}), 201

@rooms_bp.route('/<room_id>/resources', methods=['GET'])
@jwt_required()
def get_resources(room_id):
    db = get_db()
    user_id = get_jwt_identity()
    room = db.rooms.find_one({"_id": ObjectId(room_id)})
    if not room or ObjectId(user_id) not in room.get('members', []):
        return jsonify({"msg": "Not authorized"}), 403
    # Assume file metadata has 'room_id' if uploaded specifically for a room
    files = list(db.files.find({"room_id": ObjectId(room_id)}))
    for f in files:
        f['_id'] = str(f['_id'])
        f['uploader_id'] = str(f['uploader_id'])
        f['room_id'] = str(f['room_id'])
        uploader = db.users.find_one({"_id": ObjectId(f['uploader_id'])}, {"name":1})
        f['uploader_name'] = uploader.get('name') if uploader else "Unknown"
    return jsonify(files), 200

from services.ai_service import get_doubt_solution

@rooms_bp.route('/<room_id>/ai-help', methods=['POST'])
@jwt_required()
def ask_ai_help(room_id):
    db = get_db()
    user_id = get_jwt_identity()
    data = request.get_json()
    
    room = db.rooms.find_one({"_id": ObjectId(room_id)})
    if not room or ObjectId(user_id) not in room.get('members', []):
        return jsonify({"msg": "Not authorized to ask questions in this room"}), 403
        
    question = data.get('question')
    context = data.get('context', f'Subject: {room.get("subject", "General")}, Room: {room.get("title", "")}')
    
    success, result = get_doubt_solution(question, context)
    
    if not success:
        # If it's a configuration error or invalid format, return 400 or 503
        if "missing" in result.lower():
            return jsonify({"msg": result}), 503
        return jsonify({"msg": result}), 400
        
    return jsonify(result), 200
