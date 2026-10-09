import pytest
from app import create_app
from config import Config
import mongomock
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
    # Create User 1
    client.post('/api/auth/register', json={
        "name": "User One", "email": "1@a.com", "password": "password",
        "university": "Uni A", "major": "CS"
    })
    res1 = client.post('/api/auth/login', json={"email": "1@a.com", "password": "password"})
    token1 = res1.get_json()['token']
    
    # Create User 2
    client.post('/api/auth/register', json={
        "name": "User Two", "email": "2@a.com", "password": "password",
        "university": "Uni A", "major": "Art"
    })
    res2 = client.post('/api/auth/login', json={"email": "2@a.com", "password": "password"})
    token2 = res2.get_json()['token']
    
    return token1, token2

def test_peers_discovery(client, auth_tokens):
    t1, t2 = auth_tokens
    
    # Add common skill to user 2
    client.post('/api/profile/skills', json={"name": "Python"}, headers={"Authorization": f"Bearer {t2}"})
    # Add common skill to user 1
    client.post('/api/profile/skills', json={"name": "Python"}, headers={"Authorization": f"Bearer {t1}"})
    
    res = client.get('/api/peers/', headers={"Authorization": f"Bearer {t1}"})
    assert res.status_code == 200
    peers = res.get_json()
    assert len(peers) == 1
    assert peers[0]['name'] == "User Two"
    assert peers[0]['match_score'] > 0
    assert "Python" in peers[0]['match_reason']
    
def test_projects_flow(client, auth_tokens):
    t1, t2 = auth_tokens
    
    # User 1 creates project
    res = client.post('/api/projects/', json={"title": "Test Proj", "tags": ["React"]}, headers={"Authorization": f"Bearer {t1}"})
    assert res.status_code == 201
    proj_id = res.get_json()['_id']
    
    # User 2 applies
    res2 = client.post(f'/api/projects/{proj_id}/apply', headers={"Authorization": f"Bearer {t2}"})
    assert res2.status_code == 200
    
    # User 1 fetches projects
    res3 = client.get('/api/projects/', headers={"Authorization": f"Bearer {t1}"})
    projects = res3.get_json()
    assert len(projects[0]['applicants']) == 1

def test_tasks_flow(client, auth_tokens):
    t1, t2 = auth_tokens
    
    # User 1 creates project
    res = client.post('/api/projects/', json={"title": "Test Proj"}, headers={"Authorization": f"Bearer {t1}"})
    proj_id = res.get_json()['_id']
    
    # Create task
    t_res = client.post(f'/api/projects/{proj_id}/tasks', json={"title": "Do stuff"}, headers={"Authorization": f"Bearer {t1}"})
    assert t_res.status_code == 201
    task_id = t_res.get_json()['_id']
    
    # Update task
    u_res = client.put(f'/api/projects/tasks/{task_id}', json={"status": "done"}, headers={"Authorization": f"Bearer {t1}"})
    assert u_res.status_code == 200
    
    # User 2 (not member) tries to create task
    err_res = client.post(f'/api/projects/{proj_id}/tasks', json={"title": "Hax"}, headers={"Authorization": f"Bearer {t2}"})
    assert err_res.status_code == 403

def test_rooms_and_discussions(client, auth_tokens):
    t1, t2 = auth_tokens
    
    res = client.post('/api/rooms/', json={"title": "Study Group", "subject": "Math"}, headers={"Authorization": f"Bearer {t1}"})
    assert res.status_code == 201
    room_id = res.get_json()['_id']
    
    # Join room as user 2
    res2 = client.post(f'/api/rooms/{room_id}/join', headers={"Authorization": f"Bearer {t2}"})
    assert res2.status_code == 200
    
    # Ask question as user 2
    q_res = client.post(f'/api/rooms/{room_id}/questions', json={"title": "How to do calculus?"}, headers={"Authorization": f"Bearer {t2}"})
    assert q_res.status_code == 201
    
    # List questions
    get_q = client.get(f'/api/rooms/{room_id}/questions', headers={"Authorization": f"Bearer {t1}"})
    assert len(get_q.get_json()) == 1

def test_evidence(client, auth_tokens):
    t1, _ = auth_tokens
    
    res = client.post('/api/evidence/', json={"title": "Hackathon Win", "skills": ["Python"]}, headers={"Authorization": f"Bearer {t1}"})
    assert res.status_code == 201
    ev_id = res.get_json()['_id']
    
    items = client.get('/api/evidence/', headers={"Authorization": f"Bearer {t1}"}).get_json()
    assert len(items) == 1
    
    client.delete(f'/api/evidence/{ev_id}', headers={"Authorization": f"Bearer {t1}"})
    assert len(client.get('/api/evidence/', headers={"Authorization": f"Bearer {t1}"}).get_json()) == 0
