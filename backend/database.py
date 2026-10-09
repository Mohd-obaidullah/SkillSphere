from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from config import Config
import logging

db_client = None
db = None

def init_db(app):
    global db_client, db
    uri = app.config.get('MONGO_URI')
    
    if not uri or 'mongodb+srv://<username>' in uri:
        logging.warning("MONGO_URI is not set or uses placeholders. Database operations will fail unless mocked in tests.")
        return

    try:
        db_client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        # Test connection
        db_client.admin.command('ping')
        db = db_client[app.config.get('DB_NAME', 'skillsphere')]
        
        # Setup indexes
        db.users.create_index("email", unique=True)
        logging.info("Connected to MongoDB successfully.")
    except ConnectionFailure as e:
        logging.error(f"Failed to connect to MongoDB: {e}")
        db_client = None
        db = None
    except Exception as e:
        logging.error(f"MongoDB setup error: {e}")
        db_client = None
        db = None

def get_db():
    return db
