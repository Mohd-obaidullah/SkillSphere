import os, sys
sys.path.append('c:\\Users\\a2024\\Desktop\\PROJECTS\\SKILLSPHERE\\backend')
from dotenv import load_dotenv
load_dotenv()
from pymongo import MongoClient
client = MongoClient(os.getenv('MONGO_URI'))
db = client[os.getenv('DB_NAME', 'skillsphere')]
users = list(db.users.find({}, {'_id': 1, 'name': 1, 'email': 1}))
for u in users:
    print(f"User: {u.get('name')} - Email: {u.get('email')} - ID: {u.get('_id')}")
