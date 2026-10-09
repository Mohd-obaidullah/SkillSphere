from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import get_db
from bson.objectid import ObjectId
import datetime

profile_bp = Blueprint('profile_bp', __name__)

@profile_bp.route('/', methods=['GET'])
@jwt_required()
def get_profile():
    db = get_db()
    if db is None: return jsonify({"msg": "Database not configured."}), 503
    
    user_id = get_jwt_identity()
    user = db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    if not user: return jsonify({"msg": "User not found"}), 404
    user['_id'] = str(user['_id'])
    
    return jsonify(user), 200

@profile_bp.route('/', methods=['PUT'])
@jwt_required()
def update_profile():
    db = get_db()
    if db is None: return jsonify({"msg": "Database not configured."}), 503
    
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data: return jsonify({"msg": "Missing JSON"}), 400
    
    allowed_fields = ['name', 'university', 'major', 'bio', 'avatar']
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    update_data['updated_at'] = datetime.datetime.utcnow()
    
    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    
    user = db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    user['_id'] = str(user['_id'])
    return jsonify(user), 200

@profile_bp.route('/skills', methods=['GET'])
@jwt_required()
def get_skills():
    db = get_db()
    if db is None: return jsonify({"msg": "Database not configured."}), 503
    
    user_id = get_jwt_identity()
    user = db.users.find_one({"_id": ObjectId(user_id)}, {"skills": 1})
    if not user: return jsonify({"msg": "User not found"}), 404
    
    return jsonify(user.get("skills", [])), 200

@profile_bp.route('/skills', methods=['POST'])
@jwt_required()
def add_skill():
    db = get_db()
    if db is None: return jsonify({"msg": "Database not configured."}), 503
    
    user_id = get_jwt_identity()
    data = request.get_json()
    
    skill_name = data.get('name')
    level = data.get('level', 0)
    category = data.get('category', 'General')
    
    if not skill_name:
        return jsonify({"msg": "Skill name is required"}), 400
        
    skill_doc = {
        "id": f"skill-{int(datetime.datetime.utcnow().timestamp())}",
        "name": skill_name,
        "level": level,
        "category": category,
        "verified": False
    }
    
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"skills": skill_doc}, "$set": {"updated_at": datetime.datetime.utcnow()}}
    )
    
    return jsonify(skill_doc), 201

@profile_bp.route('/skills/<skill_id>', methods=['DELETE'])
@jwt_required()
def delete_skill(skill_id):
    db = get_db()
    if db is None: return jsonify({"msg": "Database not configured."}), 503
    
    user_id = get_jwt_identity()
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$pull": {"skills": {"id": skill_id}}, "$set": {"updated_at": datetime.datetime.utcnow()}}
    )
    
    return jsonify({"msg": "Skill removed"}), 200

@profile_bp.route('/badges', methods=['POST'])
@jwt_required()
def add_badge():
    db = get_db()
    if db is None: return jsonify({"msg": "Database not configured."}), 503
    
    user_id = get_jwt_identity()
    data = request.get_json()
    badge_name = data.get('badgeName')
    
    if not badge_name:
        return jsonify({"msg": "Badge name is required"}), 400
        
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {
            "$addToSet": {"verifiedBadges": badge_name},
            "$inc": {"xp": 300},
            "$set": {"updated_at": datetime.datetime.utcnow()}
        }
    )
    
    user = db.users.find_one({"_id": ObjectId(user_id)}, {"password": 0})
    user['_id'] = str(user['_id'])
    return jsonify(user), 200
