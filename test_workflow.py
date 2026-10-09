import requests
import json
import uuid

base_url = "http://localhost:5000/api"

# Unique emails
email_a = f"studentA_{uuid.uuid4().hex[:6]}@example.com"
email_b = f"studentB_{uuid.uuid4().hex[:6]}@example.com"
password = "password"

# Register Student A
res_a = requests.post(f"{base_url}/auth/register", json={
    "name": "Student A",
    "email": email_a,
    "university": "Uni A",
    "major": "CS",
    "password": password,
    "confirmPassword": password
})
print("Register A:", res_a.status_code, res_a.json())
token_a = res_a.json().get('token')

# Register Student B
res_b = requests.post(f"{base_url}/auth/register", json={
    "name": "Student B",
    "email": email_b,
    "university": "Uni A",
    "major": "CS",
    "password": password,
    "confirmPassword": password
})
print("Register B:", res_b.status_code, res_b.json())
token_b = res_b.json().get('token')

headers_a = {"Authorization": f"Bearer {token_a}"}
headers_b = {"Authorization": f"Bearer {token_b}"}

res_me_b = requests.get(f"{base_url}/auth/me", headers=headers_b)
me_data = res_me_b.json()
print("Auth ME B:", res_me_b.status_code)
id_b = me_data['user']['_id']
print("ID B:", id_b)

# Student A requests B
res_req = requests.post(f"{base_url}/peers/request/{id_b}", headers=headers_a)
try:
    print("A requests B:", res_req.status_code, res_req.json())
except:
    print("A requests B (text):", res_req.status_code, res_req.text)

# Student B gets incoming
res_inc = requests.get(f"{base_url}/peers/requests/incoming", headers=headers_b)
print("B incoming:", res_inc.status_code)
incoming = res_inc.json()
print("Requests found:", len(incoming))

if incoming:
    req_id = incoming[0]['_id']
    # Student B accepts
    res_acc = requests.post(f"{base_url}/peers/request/{req_id}/accept", headers=headers_b)
    print("B accepts A:", res_acc.status_code, res_acc.json())
    
    # Check A's notifications
    res_notif = requests.get(f"{base_url}/notifications/", headers=headers_a)
    notifs = res_notif.json()
    print("A notifications count:", len(notifs))
    if notifs:
        print("A notification:", notifs[0]['title'])
