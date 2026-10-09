from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import get_db
from bson.objectid import ObjectId
import datetime

projects_bp = Blueprint('projects_bp', __name__)

@projects_bp.route('/', methods=['GET'])
@jwt_required()
def get_projects():
    db = get_db()
    search = request.args.get('q', '').lower()
    query = {}
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"tags": {"$regex": search, "$options": "i"}},
        ]
    projects = list(db.projects.find(query))
    
    # Embed owner info
    for p in projects:
        p['_id'] = str(p['_id'])
        p['owner_id'] = str(p['owner_id'])
        owner = db.users.find_one({"_id": ObjectId(p['owner_id'])}, {"name":1, "avatar":1, "university":1})
        p['owner'] = {
            "name": owner.get("name") if owner else "Unknown",
            "avatar": owner.get("avatar"),
            "school": owner.get("university")
        }
        # Serialize ObjectIds in members and applicants
        p['members'] = [str(m) for m in p.get('members', [])]
        p['applicants'] = [str(a) for a in p.get('applicants', [])]
        
    return jsonify(projects), 200

@projects_bp.route('/', methods=['POST'])
@jwt_required()
def create_project():
    db = get_db()
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('title'):
        return jsonify({"msg": "Title is required"}), 400
        
    proj = {
        "title": data.get('title'),
        "description": data.get('description', ''),
        "tags": data.get('tags', []),
        "requiredRoles": data.get('requiredRoles', []),
        "owner_id": ObjectId(user_id),
        "status": "Actively Recruiting",
        "members": [ObjectId(user_id)],
        "applicants": [],
        "created_at": datetime.datetime.utcnow()
    }
    
    res = db.projects.insert_one(proj)
    proj['_id'] = str(res.inserted_id)
    proj['owner_id'] = str(proj['owner_id'])
    proj['members'] = [str(m) for m in proj['members']]
    
    return jsonify(proj), 201

@projects_bp.route('/<proj_id>', methods=['DELETE'])
@jwt_required()
def delete_project(proj_id):
    db = get_db()
    user_id = get_jwt_identity()
    
    proj = db.projects.find_one({"_id": ObjectId(proj_id)})
    if not proj: return jsonify({"msg": "Project not found"}), 404
    
    if str(proj.get('owner_id')) != user_id:
        return jsonify({"msg": "Not authorized to delete this project"}), 403
        
    db.projects.delete_one({"_id": ObjectId(proj_id)})
    db.tasks.delete_many({"project_id": ObjectId(proj_id)})
    return jsonify({"msg": "Project deleted successfully"}), 200

@projects_bp.route('/<proj_id>/apply', methods=['POST'])
@jwt_required()
def apply_project(proj_id):
    db = get_db()
    user_id = get_jwt_identity()
    
    proj = db.projects.find_one({"_id": ObjectId(proj_id)})
    if not proj: return jsonify({"msg": "Project not found"}), 404
    
    if ObjectId(user_id) in proj.get('members', []):
        return jsonify({"msg": "Already a member"}), 400
        
    if ObjectId(user_id) in proj.get('applicants', []):
        return jsonify({"msg": "Already applied"}), 400
        
    db.projects.update_one({"_id": ObjectId(proj_id)}, {"$push": {"applicants": ObjectId(user_id)}})
    return jsonify({"msg": "Application submitted"}), 200

@projects_bp.route('/<proj_id>/tasks', methods=['GET'])
@jwt_required()
def get_tasks(proj_id):
    db = get_db()
    user_id = get_jwt_identity()
    proj = db.projects.find_one({"_id": ObjectId(proj_id)})
    if not proj or ObjectId(user_id) not in proj.get('members', []):
        return jsonify({"msg": "Not authorized or project not found"}), 403
    tasks = list(db.tasks.find({"project_id": ObjectId(proj_id)}))
    for t in tasks:
        t['_id'] = str(t['_id'])
        t['project_id'] = str(t['project_id'])
        t['assignee_id'] = str(t['assignee_id']) if t.get('assignee_id') else None
    return jsonify(tasks), 200

@projects_bp.route('/<proj_id>/tasks', methods=['POST'])
@jwt_required()
def create_task(proj_id):
    db = get_db()
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Check membership
    proj = db.projects.find_one({"_id": ObjectId(proj_id)})
    if not proj or ObjectId(user_id) not in proj.get('members', []):
        return jsonify({"msg": "Not authorized or project not found"}), 403
        
    task = {
        "project_id": ObjectId(proj_id),
        "title": data.get('title'),
        "description": data.get('description', ''),
        "status": data.get('status', 'todo'),
        "priority": data.get('priority', 'medium'),
        "tag": data.get('tag', ''),
        "assignee_id": ObjectId(user_id), # Default to creator for now
        "created_at": datetime.datetime.utcnow()
    }
    
    res = db.tasks.insert_one(task)
    task['_id'] = str(res.inserted_id)
    task['project_id'] = str(task['project_id'])
    task['assignee_id'] = str(task['assignee_id'])
    
    return jsonify(task), 201

@projects_bp.route('/tasks/<task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    db = get_db()
    user_id = get_jwt_identity()
    data = request.get_json()
    
    task = db.tasks.find_one({"_id": ObjectId(task_id)})
    if not task: return jsonify({"msg": "Task not found"}), 404
    
    proj = db.projects.find_one({"_id": task['project_id']})
    if not proj or ObjectId(user_id) not in proj.get('members', []):
        return jsonify({"msg": "Not authorized"}), 403
        
    update = {}
    if 'status' in data: update['status'] = data['status']
    if 'title' in data: update['title'] = data['title']
    
    db.tasks.update_one({"_id": ObjectId(task_id)}, {"$set": update})
    return jsonify({"msg": "Task updated"}), 200

@projects_bp.route('/tasks/<task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    db = get_db()
    user_id = get_jwt_identity()
    
    task = db.tasks.find_one({"_id": ObjectId(task_id)})
    if not task: return jsonify({"msg": "Task not found"}), 404
    
    # Task can be deleted if user is assignee or project owner
    proj = db.projects.find_one({"_id": task['project_id']})
    is_owner = proj and str(proj.get('owner_id')) == user_id
    is_assignee = str(task.get('assignee_id')) == user_id
    
    if not is_owner and not is_assignee:
        return jsonify({"msg": "Not authorized to delete this task"}), 403
        
    db.tasks.delete_one({"_id": ObjectId(task_id)})
    return jsonify({"msg": "Task deleted successfully"}), 200
