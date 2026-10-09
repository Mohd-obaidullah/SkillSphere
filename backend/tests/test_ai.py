import pytest
from app import create_app
from config import Config
import mongomock
from unittest.mock import patch, MagicMock
from bson.objectid import ObjectId

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
    
    import database
    database.db_client = mongomock.MongoClient()
    database.db = database.db_client[TestConfig.DB_NAME]
    
    yield app
    
    database.db_client = None
    database.db = None

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_tokens(client, app):
    client.post('/api/auth/register', json={
        "name": "User AI", "email": "ai@a.com", "password": "password",
        "university": "Uni A", "major": "CS"
    })
    res = client.post('/api/auth/login', json={"email": "ai@a.com", "password": "password"})
    return res.get_json()['token']

def test_missing_api_key(client, app, auth_tokens):
    app.config['GEMINI_API_KEY'] = None
    token = auth_tokens
    
    res = client.post('/api/rooms/', json={"title": "AI Room", "subject": "CS"}, headers={"Authorization": f"Bearer {token}"})
    room_id = res.get_json()['_id']
    
    ai_res = client.post(f'/api/rooms/{room_id}/ai-help', json={"question": "Explain binary search"}, headers={"Authorization": f"Bearer {token}"})
    assert ai_res.status_code == 503
    assert "missing" in ai_res.get_json()['msg'].lower()

@patch('services.ai_service.genai.Client')
def test_successful_ai_response(mock_client_class, client, app, auth_tokens):
    app.config['GEMINI_API_KEY'] = 'test_key'
    token = auth_tokens
    
    res = client.post('/api/rooms/', json={"title": "AI Room", "subject": "CS"}, headers={"Authorization": f"Bearer {token}"})
    room_id = res.get_json()['_id']
    
    mock_instance = MagicMock()
    mock_models = MagicMock()
    mock_response = MagicMock()
    mock_response.text = '{"explanation": "A search alg.", "example": "arr = [1,2,3]", "key_points": ["Fast"], "practice_question": "Implement it."}'
    mock_models.generate_content.return_value = mock_response
    mock_instance.models = mock_models
    mock_client_class.return_value = mock_instance
    
    ai_res = client.post(f'/api/rooms/{room_id}/ai-help', json={"question": "Explain binary search"}, headers={"Authorization": f"Bearer {token}"})
    assert ai_res.status_code == 200
    data = ai_res.get_json()
    assert data['explanation'] == "A search alg."

@patch('services.ai_service.genai.Client')
def test_invalid_json_format(mock_client_class, client, app, auth_tokens):
    app.config['GEMINI_API_KEY'] = 'test_key'
    token = auth_tokens
    
    res = client.post('/api/rooms/', json={"title": "AI Room", "subject": "CS"}, headers={"Authorization": f"Bearer {token}"})
    room_id = res.get_json()['_id']
    
    mock_instance = MagicMock()
    mock_models = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "Here is the explanation, but not in JSON."
    mock_models.generate_content.return_value = mock_response
    mock_instance.models = mock_models
    mock_client_class.return_value = mock_instance
    
    ai_res = client.post(f'/api/rooms/{room_id}/ai-help', json={"question": "Explain binary search"}, headers={"Authorization": f"Bearer {token}"})
    assert ai_res.status_code == 400
    assert "invalid response format" in ai_res.get_json()['msg'].lower()

def test_unauthorized_room_access(client, app, auth_tokens):
    app.config['GEMINI_API_KEY'] = 'test_key'
    token = auth_tokens
    
    import database
    res = database.db.rooms.insert_one({"title": "Private", "members": [ObjectId()]})
    room_id = str(res.inserted_id)
    
    ai_res = client.post(f'/api/rooms/{room_id}/ai-help', json={"question": "Explain binary search"}, headers={"Authorization": f"Bearer {token}"})
    assert ai_res.status_code == 403
    assert "not authorized" in ai_res.get_json()['msg'].lower()

def test_invalid_question_length(client, app, auth_tokens):
    app.config['GEMINI_API_KEY'] = 'test_key'
    token = auth_tokens
    
    res = client.post('/api/rooms/', json={"title": "AI Room", "subject": "CS"}, headers={"Authorization": f"Bearer {token}"})
    room_id = res.get_json()['_id']
    
    ai_res = client.post(f'/api/rooms/{room_id}/ai-help', json={"question": "Hi"}, headers={"Authorization": f"Bearer {token}"})
    assert ai_res.status_code == 400
    assert "between 5 and 500" in ai_res.get_json()['msg'].lower()
