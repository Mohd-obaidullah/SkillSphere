import requests
import json
import uuid

base_url = "http://localhost:5000/api"

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
print("Register A:", res_a.status_code)
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
print("Register B:", res_b.status_code)
token_b = res_b.json().get('token')

headers_a = {"Authorization": f"Bearer {token_a}"}
headers_b = {"Authorization": f"Bearer {token_b}"}

res_me_b = requests.get(f"{base_url}/auth/me", headers=headers_b)
id_b = res_me_b.json()['user']['_id']

# Student A requests Swap
swap_data = {
    "skills_offered": ["React", "CSS"],
    "skills_wanted": ["Python", "Flask"],
    "message": "Let's learn together!"
}
res_req = requests.post(f"{base_url}/swaps/request/{id_b}", headers=headers_a, json=swap_data)
try:
    print("A requests Swap:", res_req.status_code, res_req.json())
except:
    print("A requests Swap:", res_req.status_code, res_req.text)

# Student B gets incoming
res_inc = requests.get(f"{base_url}/swaps/requests/incoming", headers=headers_b)
print("B incoming:", res_inc.status_code)
incoming = res_inc.json()
print("Requests found:", len(incoming))

if incoming:
    req_id = incoming[0]['_id']
    # Student B accepts
    res_acc = requests.post(f"{base_url}/swaps/request/{req_id}/accept", headers=headers_b)
    print("B accepts Swap:", res_acc.status_code, res_acc.json())
    
    # Both fetch swaps
    res_swaps_a = requests.get(f"{base_url}/swaps/", headers=headers_a)
    print("A active swaps:", len(res_swaps_a.json()))
    
    # Student A adds session
    if res_swaps_a.json():
        swap_id = res_swaps_a.json()[0]['_id']
        res_sess = requests.post(f"{base_url}/swaps/{swap_id}/sessions", headers=headers_a, json={"notes": "First session went great!"})
        print("A logs session:", res_sess.status_code)
        
        # Student B completes swap
        res_comp = requests.post(f"{base_url}/swaps/{swap_id}/complete", headers=headers_b)
        print("B completes swap:", res_comp.status_code)
