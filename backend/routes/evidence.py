from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import get_db
from bson.objectid import ObjectId
import datetime

evidence_bp = Blueprint('evidence_bp', __name__)

@evidence_bp.route('/', methods=['GET'])
@jwt_required()
def get_evidence():
    db = get_db()
    user_id = get_jwt_identity()
    items = list(db.evidence.find({"owner_id": ObjectId(user_id)}))
    for item in items:
        item['_id'] = str(item['_id'])
        item['owner_id'] = str(item['owner_id'])
    return jsonify(items), 200

@evidence_bp.route('/', methods=['POST'])
@jwt_required()
def add_evidence():
    db = get_db()
    user_id = get_jwt_identity()
    data = request.get_json()
    
    item = {
        "owner_id": ObjectId(user_id),
        "title": data.get('title'),
        "type": data.get('type', 'link'), # link, attachment, github
        "reference": data.get('reference', ''),
        "skills": data.get('skills', []),
        "status": "Self-Declared",
        "created_at": datetime.datetime.utcnow()
    }
    
    res = db.evidence.insert_one(item)
    item['_id'] = str(res.inserted_id)
    item['owner_id'] = str(item['owner_id'])
    
    return jsonify(item), 201

@evidence_bp.route('/<item_id>', methods=['DELETE'])
@jwt_required()
def delete_evidence(item_id):
    db = get_db()
    user_id = get_jwt_identity()
    
    item = db.evidence.find_one({"_id": ObjectId(item_id)})
    if not item or str(item['owner_id']) != str(user_id):
        return jsonify({"msg": "Not authorized"}), 403
        
    db.evidence.delete_one({"_id": ObjectId(item_id)})
    return jsonify({"msg": "Deleted"}), 200
