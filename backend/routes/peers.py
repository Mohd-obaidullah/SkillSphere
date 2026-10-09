from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import get_db
from bson.objectid import ObjectId
import datetime

peers_bp = Blueprint('peers_bp', __name__)

def calculate_match_score(user1, user2):
    score = 0
    # Common skills
    u1_skills = {s.get('name').lower() for s in user1.get('skills', [])}
    u2_skills = {s.get('name').lower() for s in user2.get('skills', [])}
    common = u1_skills.intersection(u2_skills)
    score += len(common) * 10
    
    # Same university
    if user1.get('university') and user1.get('university') == user2.get('university'):
        score += 20
        
    return min(score, 100)

@peers_bp.route('/', methods=['GET'])
@jwt_required()
def get_peers():
    db = get_db()
    if db is None: return jsonify({"msg": "Database not configured."}), 503
    
    user_id = get_jwt_identity()
    current_user = db.users.find_one({"_id": ObjectId(user_id)})
    
    search_query = request.args.get('q', '').lower()
    
    # Basic filtering
    query = {"_id": {"$ne": ObjectId(user_id)}}
    if search_query:
        query["$or"] = [
            {"name": {"$regex": search_query, "$options": "i"}},
            {"major": {"$regex": search_query, "$options": "i"}},
            {"university": {"$regex": search_query, "$options": "i"}},
            {"skills.name": {"$regex": search_query, "$options": "i"}}
        ]
        
    peers = list(db.users.find(query, {"password": 0}))
    
    # Calculate deterministic match score
    for p in peers:
        p['_id'] = str(p['_id'])
        p['match_score'] = calculate_match_score(current_user, p)
        # Explain match
        common = {s.get('name') for s in p.get('skills', [])}.intersection({s.get('name') for s in current_user.get('skills', [])})
        if common:
            p['match_reason'] = f"Shares skills: {', '.join(common)}"
        elif current_user.get('university') == p.get('university'):
            p['match_reason'] = "Same university"
        else:
            p['match_reason'] = "General discovery"
            
    # Sort by match score descending
    peers.sort(key=lambda x: x['match_score'], reverse=True)
    
    return jsonify(peers), 200

@peers_bp.route('/request/<target_id>', methods=['POST'])
@jwt_required()
def request_connection(target_id):
    db = get_db()
    user_id = get_jwt_identity()
    
    # Prevent self request
    if user_id == target_id: return jsonify({"msg": "Cannot connect to yourself"}), 400
    
    target = db.users.find_one({"_id": ObjectId(target_id)})
    if not target: return jsonify({"msg": "User not found"}), 404
    
    conn = {
        "requester": ObjectId(user_id),
        "target": ObjectId(target_id),
        "status": "pending",
        "created_at": datetime.datetime.utcnow()
    }
    
    # Upsert to prevent duplicates
    db.connections.update_one(
        {"requester": ObjectId(user_id), "target": ObjectId(target_id)},
        {"$set": conn},
        upsert=True
    )
    return jsonify({"msg": "Connection request sent"}), 200
