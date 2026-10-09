import pytest
from app import create_app
from config import Config
import mongomock

class TestConfig(Config):
    TESTING = True
    MONGO_URI = 'mongodb://localhost:27017/test_db'
    DB_NAME = 'test_db'
    SECRET_KEY = 'test_secret'
    JWT_SECRET_KEY = 'test_jwt_secret'

@pytest.fixture
def app():
    app = create_app()
    app.config.from_object(TestConfig)
    
    # Mock database
    import database
    database.db_client = mongomock.MongoClient()
    database.db = database.db_client[TestConfig.DB_NAME]
    database.db.users.create_index("email", unique=True)
    
    yield app
    
    # Clean up
    database.db_client = None
    database.db = None

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_token(client):
    res = client.post('/api/auth/register', json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123",
        "university": "Test Uni",
        "major": "CS"
    })
    return res.get_json()['token']
