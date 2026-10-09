def test_health(client):
    res = client.get('/api/health')
    assert res.status_code == 200
    assert res.get_json()['status'] == 'ok'

def test_register(client):
    res = client.post('/api/auth/register', json={
        "name": "New User",
        "email": "new@example.com",
        "password": "password123",
        "university": "Test Uni",
        "major": "CS"
    })
    assert res.status_code == 201
    assert "token" in res.get_json()

def test_register_duplicate(client):
    data = {
        "name": "Dup User",
        "email": "dup@example.com",
        "password": "password123",
        "university": "Test Uni",
        "major": "CS"
    }
    client.post('/api/auth/register', json=data)
    res2 = client.post('/api/auth/register', json=data)
    assert res2.status_code == 409

def test_login(client):
    client.post('/api/auth/register', json={
        "name": "Login User",
        "email": "login@example.com",
        "password": "password123",
        "university": "Test Uni",
        "major": "CS"
    })
    res = client.post('/api/auth/login', json={
        "email": "login@example.com",
        "password": "password123"
    })
    assert res.status_code == 200
    assert "token" in res.get_json()

def test_login_invalid(client):
    res = client.post('/api/auth/login', json={
        "email": "wrong@example.com",
        "password": "password123"
    })
    assert res.status_code == 401

def test_me_unauthorized(client):
    res = client.get('/api/auth/me')
    assert res.status_code == 401

def test_me_authorized(client, auth_token):
    res = client.get('/api/auth/me', headers={"Authorization": f"Bearer {auth_token}"})
    assert res.status_code == 200
    assert res.get_json()['user']['email'] == "test@example.com"
