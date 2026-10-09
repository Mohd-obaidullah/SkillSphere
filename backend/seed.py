import os
from dotenv import load_dotenv
from database import db_client, db
from werkzeug.security import generate_password_hash
from pymongo import MongoClient

def seed_demo_user():
    load_dotenv()
    
    MONGO_URI = os.getenv('MONGO_URI')
    DB_NAME = os.getenv('DB_NAME', 'skillsphere')
    
    if not MONGO_URI or 'mongodb+srv://<username>' in MONGO_URI:
        print("Invalid or missing MONGO_URI. Please configure .env with real credentials before seeding.")
        return
        
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        database = client[DB_NAME]
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        return

    DEMO_EMAIL = os.getenv('DEMO_EMAIL', 'demo@skillsphere.edu')
    DEMO_PASS = os.getenv('DEMO_PASSWORD', 'demo123')
    
    print(f"Seeding demo user with email: {DEMO_EMAIL}")
    
    existing = database.users.find_one({"email": DEMO_EMAIL})
    if existing:
        print("Demo user already exists.")
        return
        
    demo_user = {
        "name": "Alex Rivera",
        "email": DEMO_EMAIL,
        "password": generate_password_hash(DEMO_PASS),
        "university": "Stanford University",
        "major": "Computer Science",
        "bio": "Passionate full-stack developer & AI enthusiast. Looking to collaborate on open-source web applications & hackathon projects!",
        "skills": [
            { "id": "skill-1", "name": "React / Next.js", "level": 90, "category": "Frontend", "verified": True },
            { "id": "skill-2", "name": "Node.js & Express", "level": 85, "category": "Backend", "verified": True },
            { "id": "skill-3", "name": "Python / PyTorch", "level": 75, "category": "AI & Data", "verified": False }
        ],
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-01T00:00:00Z",
        "xp": 2840,
        "level": 7,
        "levelTitle": "Skill Architect",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
        "stats": {
            "projectsCompleted": 12,
            "collaborations": 8,
            "skillSwaps": 15,
            "endorsements": 42
        }
    }
    
    database.users.insert_one(demo_user)
    print("Demo user seeded successfully!")

if __name__ == "__main__":
    seed_demo_user()
