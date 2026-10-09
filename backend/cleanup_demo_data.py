import os
import sys
import argparse
from dotenv import load_dotenv
from pymongo import MongoClient

# Add current directory to path if needed
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def is_demo_email(email):
    email = email.lower()
    if email == 'demo@skillsphere.edu':
        return True
    if email == 'ai@a.com':
        return True
    if email == 'testuser@example.com':
        return True
    if email.startswith('studenta_') and email.endswith('@example.com'):
        return True
    if email.startswith('studentb_') and email.endswith('@example.com'):
        return True
    return False

def get_demo_user_ids(db):
    demo_ids = []
    users = list(db.users.find({}, {"_id": 1, "email": 1, "name": 1}))
    for u in users:
        if is_demo_email(u.get('email', '')):
            demo_ids.append(u['_id'])
    return demo_ids

def cleanup_demo_data(dry_run=True):
    load_dotenv()
    MONGO_URI = os.getenv('MONGO_URI')
    DB_NAME = os.getenv('DB_NAME', 'skillsphere')
    
    if not MONGO_URI:
        print("MONGO_URI not found.")
        return

    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    
    print(f"--- DEMO DATA CLEANUP SCRIPT ({'DRY RUN' if dry_run else 'ACTIVE'}) ---")
    
    demo_ids = get_demo_user_ids(db)
    
    if not demo_ids:
        print("No demo users found.")
        return
        
    print(f"Identified {len(demo_ids)} demo user(s).")
    
    # We will track what to delete
    # Users
    users_to_delete = {"_id": {"$in": demo_ids}}
    users_count = db.users.count_documents(users_to_delete)
    
    # Projects: where owner_id is in demo_ids
    projects_to_delete = {"owner_id": {"$in": [str(d) for d in demo_ids]}}
    projects_count = db.projects.count_documents(projects_to_delete)
    
    # Connections: requester or target is in demo_ids
    connections_to_delete = {"$or": [{"requester": {"$in": [str(d) for d in demo_ids]}}, {"target": {"$in": [str(d) for d in demo_ids]}}]}
    connections_count = db.connections.count_documents(connections_to_delete)
    
    # Notifications: user_id is in demo_ids
    notifications_to_delete = {"user_id": {"$in": [str(d) for d in demo_ids]}}
    notifications_count = db.notifications.count_documents(notifications_to_delete)
    
    # Rooms: owner_id is in demo_ids
    rooms_to_delete = {"owner_id": {"$in": [str(d) for d in demo_ids]}}
    rooms_count = db.rooms.count_documents(rooms_to_delete)
    
    # Events: created_by is in demo_ids
    events_to_delete = {"created_by": {"$in": [str(d) for d in demo_ids]}}
    events_count = db.events.count_documents(events_to_delete)
    
    # Evidence: user_id is in demo_ids
    evidence_to_delete = {"user_id": {"$in": [str(d) for d in demo_ids]}}
    evidence_count = db.evidence.count_documents(evidence_to_delete)
    
    # Skill Swaps: requester_id or partner_id is in demo_ids
    swaps_to_delete = {"$or": [{"requester_id": {"$in": [str(d) for d in demo_ids]}}, {"partner_id": {"$in": [str(d) for d in demo_ids]}}]}
    swaps_count = db.skill_swaps.count_documents(swaps_to_delete)
    
    print("\nRecords identified for removal:")
    print(f" - Users: {users_count}")
    print(f" - Projects: {projects_count}")
    print(f" - Connections: {connections_count}")
    print(f" - Notifications: {notifications_count}")
    print(f" - Rooms: {rooms_count}")
    print(f" - Events: {events_count}")
    print(f" - Evidence: {evidence_count}")
    print(f" - Skill Swaps: {swaps_count}")
    
    if dry_run:
        print("\nThis was a DRY RUN. No records were deleted.")
        print("To actually delete these records, run: python cleanup_demo_data.py --confirm")
    else:
        print("\nDeleting records...")
        db.users.delete_many(users_to_delete)
        db.projects.delete_many(projects_to_delete)
        db.connections.delete_many(connections_to_delete)
        db.notifications.delete_many(notifications_to_delete)
        db.rooms.delete_many(rooms_to_delete)
        db.events.delete_many(events_to_delete)
        db.evidence.delete_many(evidence_to_delete)
        db.skill_swaps.delete_many(swaps_to_delete)
        print("Demo data cleanup completed successfully.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Cleanup demo data from MongoDB.")
    parser.add_argument('--confirm', action='store_true', help="Execute the destructive cleanup")
    args = parser.parse_args()
    
    cleanup_demo_data(dry_run=not args.confirm)
