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
        member_ids = [ObjectId(m) for m in p.get('members', [])]
        members_data = list(db.users.find({"_id": {"$in": member_ids}}, {"name": 1, "avatar": 1}))
        p['members'] = [{"_id": str(m["_id"]), "name": m.get("name"), "avatar": m.get("avatar")} for m in members_data]
        p['applicants'] = [str(a) for a in p.get('applicants', [])]
        
        # Attach my application status if any
        user_id = get_jwt_identity()
        app = db.project_applications.find_one({"project_id": p['_id'], "applicant_id": ObjectId(user_id)})
        if app:
            p['my_application_status'] = app['status']
            
        # Attach room_id if member
        if any(m["_id"] == str(user_id) for m in p['members']):
            room = db.rooms.find_one({"project_id": str(p['_id'])})
            if room:
                p['room_id'] = str(room['_id'])

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
    
    room = db.rooms.find_one({"project_id": str(proj_id)})
    if room:
        db.rooms.delete_one({"_id": room["_id"]})
        db.discussions.delete_many({"room_id": room["_id"]})
        db.files.delete_many({"room_id": room["_id"]})
        
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
        
    existing_app = db.project_applications.find_one({
        "project_id": str(proj_id),
        "applicant_id": ObjectId(user_id)
    })
    if existing_app:
        return jsonify({"msg": "Already applied"}), 400
        
    app_doc = {
        "project_id": str(proj_id),
        "applicant_id": ObjectId(user_id),
        "owner_id": proj.get("owner_id"),
        "status": "pending",
        "created_at": datetime.datetime.utcnow()
    }
    res = db.project_applications.insert_one(app_doc)
    
    # Send notification to owner
    applicant = db.users.find_one({"_id": ObjectId(user_id)})
    db.notifications.insert_one({
        "user_id": str(proj.get("owner_id")),
        "title": "New Project Application",
        "message": f"{applicant.get('name')} applied to your project '{proj.get('title')}'.",
        "type": "project_application",
        "related_id": str(res.inserted_id),
        "project_id": str(proj_id),
        "read": False,
        "created_at": datetime.datetime.utcnow()
    })
    
    # Also push to legacy applicants array for backwards compatibility if any
    db.projects.update_one({"_id": ObjectId(proj_id)}, {"$push": {"applicants": ObjectId(user_id)}})
    return jsonify({"msg": "Application submitted"}), 200

@projects_bp.route('/<proj_id>/applications', methods=['GET'])
@jwt_required()
def get_project_applications(proj_id):
    db = get_db()
    user_id = get_jwt_identity()
    
    proj = db.projects.find_one({"_id": ObjectId(proj_id)})
    if not proj: return jsonify({"msg": "Project not found"}), 404
    if str(proj.get("owner_id")) != user_id:
        return jsonify({"msg": "Not authorized"}), 403
        
    applications = list(db.project_applications.find({"project_id": str(proj_id)}))
    for app in applications:
        app['_id'] = str(app['_id'])
        app['applicant_id'] = str(app['applicant_id'])
        app['owner_id'] = str(app['owner_id'])
        # Embed applicant info
        applicant = db.users.find_one({"_id": ObjectId(app['applicant_id'])})
        if applicant:
            app['applicant'] = {
                "name": applicant.get("name"),
                "avatar": applicant.get("avatar"),
                "university": applicant.get("university"),
                "skills": applicant.get("skills", []),
                "bio": applicant.get("bio")
            }
    return jsonify(applications), 200

@projects_bp.route('/applications/<app_id>/accept', methods=['POST'])
@jwt_required()
def accept_application(app_id):
    db = get_db()
    user_id = get_jwt_identity()
    
    app = db.project_applications.find_one({"_id": ObjectId(app_id)})
    if not app: return jsonify({"msg": "Application not found"}), 404
    if str(app.get("owner_id")) != user_id: return jsonify({"msg": "Not authorized"}), 403
    if app.get("status") != "pending": return jsonify({"msg": "Already processed"}), 400
    
    db.project_applications.update_one({"_id": ObjectId(app_id)}, {"$set": {"status": "accepted"}})
    db.projects.update_one(
        {"_id": ObjectId(app['project_id'])}, 
        {"$addToSet": {"members": ObjectId(app['applicant_id'])}}
    )
    
    proj = db.projects.find_one({"_id": ObjectId(app['project_id'])})
    
    # Ensure room exists for this project
    room = db.rooms.find_one({"project_id": str(proj['_id'])})
    if not room:
        room_doc = {
            "title": proj.get("title") + " - Team Room",
            "description": proj.get("description", ""),
            "subject": "Project",
            "project_id": str(proj['_id']),
            "owner_id": proj.get("owner_id"),
            "members": [proj.get("owner_id"), ObjectId(app['applicant_id'])],
            "created_at": datetime.datetime.utcnow(),
            "active": True
        }
        db.rooms.insert_one(room_doc)
    else:
        db.rooms.update_one(
            {"_id": room["_id"]},
            {"$addToSet": {"members": ObjectId(app['applicant_id'])}}
        )
    
    db.notifications.insert_one({
        "user_id": str(app['applicant_id']),
        "title": "Application Accepted",
        "message": f"You were accepted into the project '{proj.get('title')}'.",
        "type": "project",
        "read": False,
        "created_at": datetime.datetime.utcnow()
    })
    
    return jsonify({"msg": "Accepted"}), 200

@projects_bp.route('/applications/<app_id>/reject', methods=['POST'])
@jwt_required()
def reject_application(app_id):
    db = get_db()
    user_id = get_jwt_identity()
    
    app = db.project_applications.find_one({"_id": ObjectId(app_id)})
    if not app: return jsonify({"msg": "Application not found"}), 404
    if str(app.get("owner_id")) != user_id: return jsonify({"msg": "Not authorized"}), 403
    if app.get("status") != "pending": return jsonify({"msg": "Already processed"}), 400
    
    db.project_applications.update_one({"_id": ObjectId(app_id)}, {"$set": {"status": "rejected"}})
    
    proj = db.projects.find_one({"_id": ObjectId(app['project_id'])})
    db.notifications.insert_one({
        "user_id": str(app['applicant_id']),
        "title": "Application Update",
        "message": f"Your application to '{proj.get('title')}' was not accepted.",
        "type": "project",
        "read": False,
        "created_at": datetime.datetime.utcnow()
    })
    
    return jsonify({"msg": "Rejected"}), 200

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
