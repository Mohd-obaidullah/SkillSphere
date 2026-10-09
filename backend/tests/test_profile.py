def test_get_profile(client, auth_token):
    res = client.get('/api/profile/', headers={"Authorization": f"Bearer {auth_token}"})
    assert res.status_code == 200
    assert res.get_json()['name'] == "Test User"

def test_update_profile(client, auth_token):
    res = client.put('/api/profile/', json={"bio": "New bio"}, headers={"Authorization": f"Bearer {auth_token}"})
    assert res.status_code == 200
    assert res.get_json()['bio'] == "New bio"

def test_add_skill(client, auth_token):
    res = client.post('/api/profile/skills', json={"name": "Python", "level": 80}, headers={"Authorization": f"Bearer {auth_token}"})
    assert res.status_code == 201
    assert res.get_json()['name'] == "Python"
    
    # Check if added
    res2 = client.get('/api/profile/skills', headers={"Authorization": f"Bearer {auth_token}"})
    assert len(res2.get_json()) == 1

def test_delete_skill(client, auth_token):
    res = client.post('/api/profile/skills', json={"name": "Java", "level": 50}, headers={"Authorization": f"Bearer {auth_token}"})
    skill_id = res.get_json()['id']
    
    res2 = client.delete(f'/api/profile/skills/{skill_id}', headers={"Authorization": f"Bearer {auth_token}"})
    assert res2.status_code == 200
    
    res3 = client.get('/api/profile/skills', headers={"Authorization": f"Bearer {auth_token}"})
    assert len(res3.get_json()) == 0
