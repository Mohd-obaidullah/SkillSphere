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
    
    if user_id == target_id: return jsonify({"msg": "Cannot connect to yourself"}), 400
    
    target = db.users.find_one({"_id": ObjectId(target_id)})
    if not target: return jsonify({"msg": "User not found"}), 404

    requester = db.users.find_one({"_id": ObjectId(user_id)})
    
    # Check if already connected or pending
    existing = db.connections.find_one({
        "$or": [
            {"requester": ObjectId(user_id), "target": ObjectId(target_id)},
            {"requester": ObjectId(target_id), "target": ObjectId(user_id)}
        ]
    })
    
    if existing:
        return jsonify({"msg": "Connection already exists or is pending"}), 400
    
    conn = {
        "requester": ObjectId(user_id),
        "target": ObjectId(target_id),
        "status": "pending",
        "created_at": datetime.datetime.utcnow()
    }
    
    res = db.connections.insert_one(conn)
    
    # Create notification for target
    new_notif = {
        "user_id": ObjectId(target_id),
        "title": "New Connection Request",
        "message": f"{requester.get('name', 'Someone')} sent you a connection request.",
        "type": "connection_request",
        "read": False,
        "created_at": datetime.datetime.utcnow(),
        "timestamp": "Just now",
        "related_id": str(res.inserted_id)
    }
    db.notifications.insert_one(new_notif)
    
    return jsonify({"msg": "Connection request sent"}), 200

@peers_bp.route('/requests/incoming', methods=['GET'])
@jwt_required()
def get_incoming_requests():
    db = get_db()
    user_id = get_jwt_identity()
    
    reqs = list(db.connections.find({"target": ObjectId(user_id), "status": "pending"}))
    result = []
    for r in reqs:
        requester = db.users.find_one({"_id": r["requester"]}, {"password": 0})
        if requester:
            requester["_id"] = str(requester["_id"])
            r_data = {
                "_id": str(r["_id"]),
                "requester": requester,
                "created_at": r["created_at"]
            }
            result.append(r_data)
            
    return jsonify(result), 200

@peers_bp.route('/request/<req_id>/accept', methods=['POST'])
@jwt_required()
def accept_request(req_id):
    db = get_db()
    user_id = get_jwt_identity()
    
    req = db.connections.find_one({"_id": ObjectId(req_id), "target": ObjectId(user_id), "status": "pending"})
    if not req: return jsonify({"msg": "Request not found"}), 404
    
    db.connections.update_one({"_id": ObjectId(req_id)}, {"$set": {"status": "accepted"}})
    
    target = db.users.find_one({"_id": ObjectId(user_id)})
    
    # Notify requester
    new_notif = {
        "user_id": req["requester"],
        "title": "Connection Accepted",
        "message": f"{target.get('name', 'Someone')} accepted your connection request.",
        "type": "connection_accepted",
        "read": False,
        "created_at": datetime.datetime.utcnow(),
        "timestamp": "Just now"
    }
    db.notifications.insert_one(new_notif)
    
    return jsonify({"msg": "Request accepted"}), 200

@peers_bp.route('/request/<req_id>/reject', methods=['POST'])
@jwt_required()
def reject_request(req_id):
    db = get_db()
    user_id = get_jwt_identity()
    
    req = db.connections.find_one({"_id": ObjectId(req_id), "target": ObjectId(user_id), "status": "pending"})
    if not req: return jsonify({"msg": "Request not found"}), 404
    
    db.connections.update_one({"_id": ObjectId(req_id)}, {"$set": {"status": "rejected"}})
    
    return jsonify({"msg": "Request rejected"}), 200
