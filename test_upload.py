import requests
import json

data = {
    "email": "mohdobaidullah70@gmail.com",
    "password": "Obaid@786"
}

res = requests.post("http://localhost:5000/api/auth/login", json=data)
token = res.json().get('token')

headers = {
    "Authorization": f"Bearer {token}"
}

# 1. Test Project Creation
proj_res = requests.post("http://localhost:5000/api/projects/", json={
    "title": "Test Project",
    "description": "desc",
    "tags": ["react"],
    "requiredRoles": ["dev"]
}, headers=headers)
print("Project Create:", proj_res.status_code)

# 2. Test Event Creation
event_res = requests.post("http://localhost:5000/api/events/", json={
    "title": "Test Event",
    "description": "desc",
    "type": "Workshop",
    "registration_url": "http://example.com",
    "date": "2026-10-10"
}, headers=headers)
print("Event Create:", event_res.status_code)

# 3. Test Room Creation
room_res = requests.post("http://localhost:5000/api/rooms/", json={
    "title": "Test Room",
    "description": "desc",
    "subject": "Math"
}, headers=headers)
room_id = room_res.json().get('_id')
print("Room Create:", room_res.status_code)

# 4. Upload file
files = {
    'file': ('test.txt', b'hello world', 'text/plain')
}
data = {
    'room_id': room_id
}
upload_res = requests.post("http://localhost:5000/api/storage/upload/document", files=files, data=data, headers=headers)
print("Upload:", upload_res.status_code)

# 5. Get file URL
if upload_res.status_code == 200:
    print("Upload Response:", upload_res.json())
