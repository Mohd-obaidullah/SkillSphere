from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import get_db
from bson.objectid import ObjectId
import datetime

events_bp = Blueprint('events_bp', __name__)

@events_bp.route('/', methods=['GET'])
@jwt_required()
def get_events():
    db = get_db()
    if db is None: return jsonify({"msg": "Database not configured."}), 503
    
    events = list(db.events.find().sort("date", 1))
    for ev in events:
        ev['_id'] = str(ev['_id'])
        
    # If no events exist, seed some dummy events
    if not events:
        dummy_events = [
            {
                "title": "Hackathon 2026: AI for Good",
                "date": (datetime.datetime.utcnow() + datetime.timedelta(days=10)).isoformat(),
                "type": "Hackathon",
                "description": "Join us for a 48-hour hackathon focused on AI solutions for social impact.",
                "attendees": []
            },
            {
                "title": "React Performance Workshop",
                "date": (datetime.datetime.utcnow() + datetime.timedelta(days=3)).isoformat(),
                "type": "Workshop",
                "description": "Deep dive into React 18 performance optimization and concurrent rendering.",
                "attendees": []
            }
        ]
        db.events.insert_many(dummy_events)
        events = list(db.events.find().sort("date", 1))
        for ev in events:
            ev['_id'] = str(ev['_id'])
            
    return jsonify(events), 200

@events_bp.route('/', methods=['POST'])
@jwt_required()
def create_event():
    db = get_db()
    if db is None: return jsonify({"msg": "Database not configured."}), 503
    
    data = request.get_json()
    if not data.get('title') or not data.get('date'):
        return jsonify({"msg": "Title and date are required"}), 400
        
    new_event = {
        "title": data.get('title'),
        "date": data.get('date'),
        "type": data.get('type', 'General'),
        "description": data.get('description', ''),
        "attendees": [],
        "created_by": get_jwt_identity(),
        "created_at": datetime.datetime.utcnow()
    }
    
    result = db.events.insert_one(new_event)
    new_event['_id'] = str(result.inserted_id)
    return jsonify(new_event), 201

@events_bp.route('/<event_id>/register', methods=['POST'])
@jwt_required()
def register_event(event_id):
    db = get_db()
    if db is None: return jsonify({"msg": "Database not configured."}), 503
    
    user_id = get_jwt_identity()
    
    event = db.events.find_one({"_id": ObjectId(event_id)})
    if not event:
        return jsonify({"msg": "Event not found"}), 404
        
    if user_id in event.get('attendees', []):
        return jsonify({"msg": "Already registered"}), 400
        
    db.events.update_one(
        {"_id": ObjectId(event_id)},
        {"$addToSet": {"attendees": user_id}}
    )
    return jsonify({"msg": "Successfully registered"}), 200

@events_bp.route('/<event_id>/unregister', methods=['POST'])
@jwt_required()
def unregister_event(event_id):
    db = get_db()
    if db is None: return jsonify({"msg": "Database not configured."}), 503
    
    user_id = get_jwt_identity()
    
    event = db.events.find_one({"_id": ObjectId(event_id)})
    if not event:
        return jsonify({"msg": "Event not found"}), 404
        
    db.events.update_one(
        {"_id": ObjectId(event_id)},
        {"$pull": {"attendees": user_id}}
    )
    return jsonify({"msg": "Successfully unregistered"}), 200
