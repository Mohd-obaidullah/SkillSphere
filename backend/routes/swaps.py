from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import get_db
from bson.objectid import ObjectId
import datetime

swaps_bp = Blueprint('swaps_bp', __name__)

@swaps_bp.route('/request/<target_id>', methods=['POST'])
@jwt_required()
def request_swap(target_id):
    db = get_db()
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if user_id == target_id: return jsonify({"msg": "Cannot swap with yourself"}), 400
    
    target = db.users.find_one({"_id": ObjectId(target_id)})
    if not target: return jsonify({"msg": "User not found"}), 404

    requester = db.users.find_one({"_id": ObjectId(user_id)})
    
    # Check if a pending request or active swap already exists
    existing = db.skill_swaps.find_one({
        "$or": [
            {"requester_id": ObjectId(user_id), "target_id": ObjectId(target_id), "status": {"$in": ["pending", "active"]}},
            {"requester_id": ObjectId(target_id), "target_id": ObjectId(user_id), "status": {"$in": ["pending", "active"]}}
        ]
    })
    
    if existing:
        return jsonify({"msg": "Skill swap request or active swap already exists"}), 400
    
    swap_req = {
        "requester_id": ObjectId(user_id),
        "target_id": ObjectId(target_id),
        "skills_offered": data.get('skills_offered', []),
        "skills_wanted": data.get('skills_wanted', []),
        "message": data.get('message', ''),
        "status": "pending",
        "created_at": datetime.datetime.utcnow(),
        "updated_at": datetime.datetime.utcnow()
    }
    
    res = db.skill_swaps.insert_one(swap_req)
    
    # Notify target
    db.notifications.insert_one({
        "user_id": ObjectId(target_id),
        "title": "New Skill Swap Request",
        "message": f"{requester.get('name', 'Someone')} wants to skill swap with you.",
        "type": "skill_swap_request",
        "read": False,
        "created_at": datetime.datetime.utcnow(),
        "timestamp": "Just now",
        "related_id": str(res.inserted_id)
    })
    
    return jsonify({"msg": "Skill swap request sent"}), 201

@swaps_bp.route('/requests/incoming', methods=['GET'])
@jwt_required()
def get_incoming_requests():
    db = get_db()
    user_id = get_jwt_identity()
    
    reqs = list(db.skill_swaps.find({"target_id": ObjectId(user_id), "status": "pending"}))
    result = []
    for r in reqs:
        requester = db.users.find_one({"_id": r["requester_id"]}, {"password": 0})
        if requester:
            requester["_id"] = str(requester["_id"])
            r_data = {
                "_id": str(r["_id"]),
                "requester": requester,
                "skills_offered": r.get('skills_offered', []),
                "skills_wanted": r.get('skills_wanted', []),
                "message": r.get('message', ''),
                "created_at": r["created_at"]
            }
            result.append(r_data)
            
    return jsonify(result), 200

@swaps_bp.route('/requests/sent', methods=['GET'])
@jwt_required()
def get_sent_requests():
    db = get_db()
    user_id = get_jwt_identity()
    
    reqs = list(db.skill_swaps.find({"requester_id": ObjectId(user_id), "status": "pending"}))
    result = []
    for r in reqs:
        target = db.users.find_one({"_id": r["target_id"]}, {"password": 0})
        if target:
            target["_id"] = str(target["_id"])
            r_data = {
                "_id": str(r["_id"]),
                "target": target,
                "skills_offered": r.get('skills_offered', []),
                "skills_wanted": r.get('skills_wanted', []),
                "message": r.get('message', ''),
                "created_at": r["created_at"]
            }
            result.append(r_data)
            
    return jsonify(result), 200

@swaps_bp.route('/request/<req_id>/accept', methods=['POST'])
@jwt_required()
def accept_request(req_id):
    db = get_db()
    user_id = get_jwt_identity()
    
    req = db.skill_swaps.find_one({"_id": ObjectId(req_id), "target_id": ObjectId(user_id), "status": "pending"})
    if not req: return jsonify({"msg": "Request not found"}), 404
    
    db.skill_swaps.update_one(
        {"_id": ObjectId(req_id)},
        {"$set": {
            "status": "active", 
            "updated_at": datetime.datetime.utcnow(),
            "milestones": [],
            "sessions": []
        }}
    )
    
    target = db.users.find_one({"_id": ObjectId(user_id)})
    
    # Notify requester
    db.notifications.insert_one({
        "user_id": req["requester_id"],
        "title": "Skill Swap Accepted",
        "message": f"{target.get('name', 'Someone')} accepted your skill swap request.",
        "type": "skill_swap_accepted",
        "read": False,
        "created_at": datetime.datetime.utcnow(),
        "timestamp": "Just now",
        "related_id": str(req_id)
    })
    
    return jsonify({"msg": "Request accepted, swap is now active"}), 200

@swaps_bp.route('/request/<req_id>/reject', methods=['POST'])
@jwt_required()
def reject_request(req_id):
    db = get_db()
    user_id = get_jwt_identity()
    
    req = db.skill_swaps.find_one({"_id": ObjectId(req_id), "target_id": ObjectId(user_id), "status": "pending"})
    if not req: return jsonify({"msg": "Request not found"}), 404
    
    db.skill_swaps.update_one({"_id": ObjectId(req_id)}, {"$set": {"status": "rejected", "updated_at": datetime.datetime.utcnow()}})
    
    return jsonify({"msg": "Request rejected"}), 200

@swaps_bp.route('/', methods=['GET'])
@jwt_required()
def get_swaps():
    db = get_db()
    user_id = get_jwt_identity()
    
    swaps = list(db.skill_swaps.find({
        "$or": [{"requester_id": ObjectId(user_id)}, {"target_id": ObjectId(user_id)}],
        "status": {"$in": ["active", "completed"]}
    }))
    
    result = []
    for s in swaps:
        other_id = s["target_id"] if str(s["requester_id"]) == user_id else s["requester_id"]
        other_user = db.users.find_one({"_id": other_id}, {"password": 0})
        
        if other_user:
            other_user["_id"] = str(other_user["_id"])
            s_data = {
                "_id": str(s["_id"]),
                "partner": other_user,
                "role": "requester" if str(s["requester_id"]) == user_id else "target",
                "skills_offered": s.get('skills_offered', []),
                "skills_wanted": s.get('skills_wanted', []),
                "message": s.get('message', ''),
                "status": s.get('status'),
                "milestones": s.get('milestones', []),
                "sessions": s.get('sessions', []),
                "created_at": s.get("created_at"),
                "updated_at": s.get("updated_at")
            }
            result.append(s_data)
            
    return jsonify(result), 200

@swaps_bp.route('/<swap_id>/sessions', methods=['POST'])
@jwt_required()
def add_session(swap_id):
    db = get_db()
    user_id = get_jwt_identity()
    data = request.get_json()
    
    swap = db.skill_swaps.find_one({"_id": ObjectId(swap_id)})
    if not swap: return jsonify({"msg": "Swap not found"}), 404
    if str(swap['requester_id']) != user_id and str(swap['target_id']) != user_id:
        return jsonify({"msg": "Unauthorized"}), 403
        
    session = {
        "id": str(ObjectId()),
        "notes": data.get("notes", ""),
        "created_by": user_id,
        "date": datetime.datetime.utcnow().isoformat()
    }
    
    db.skill_swaps.update_one(
        {"_id": ObjectId(swap_id)},
        {"$push": {"sessions": session}, "$set": {"updated_at": datetime.datetime.utcnow()}}
    )
    
    # Notify other user
    other_id = swap["target_id"] if str(swap["requester_id"]) == user_id else swap["requester_id"]
    current_user = db.users.find_one({"_id": ObjectId(user_id)})
    db.notifications.insert_one({
        "user_id": other_id,
        "title": "New Swap Session Logged",
        "message": f"{current_user.get('name', 'Someone')} logged a new session.",
        "type": "skill_swap_update",
        "read": False,
        "created_at": datetime.datetime.utcnow(),
        "timestamp": "Just now",
        "related_id": swap_id
    })
    
    return jsonify(session), 200

@swaps_bp.route('/<swap_id>/complete', methods=['POST'])
@jwt_required()
def complete_swap(swap_id):
    db = get_db()
    user_id = get_jwt_identity()
    
    swap = db.skill_swaps.find_one({"_id": ObjectId(swap_id)})
    if not swap: return jsonify({"msg": "Swap not found"}), 404
    if str(swap['requester_id']) != user_id and str(swap['target_id']) != user_id:
        return jsonify({"msg": "Unauthorized"}), 403
        
    db.skill_swaps.update_one(
        {"_id": ObjectId(swap_id)},
        {"$set": {"status": "completed", "updated_at": datetime.datetime.utcnow()}}
    )
    
    # Update stats for both users
    db.users.update_many(
        {"_id": {"$in": [swap['requester_id'], swap['target_id']]}},
        {"$inc": {"stats.skillSwaps": 1, "xp": 50}}
    )
    
    # Notify other user
    other_id = swap["target_id"] if str(swap["requester_id"]) == user_id else swap["requester_id"]
    current_user = db.users.find_one({"_id": ObjectId(user_id)})
    db.notifications.insert_one({
        "user_id": other_id,
        "title": "Skill Swap Completed",
        "message": f"{current_user.get('name', 'Someone')} marked your skill swap as completed. (+50 XP)",
        "type": "skill_swap_update",
        "read": False,
        "created_at": datetime.datetime.utcnow(),
        "timestamp": "Just now",
        "related_id": swap_id
    })
    
    return jsonify({"msg": "Swap completed"}), 200
