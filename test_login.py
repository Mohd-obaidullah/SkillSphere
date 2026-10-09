import requests

data = {
    "email": "mohdobaidullah70@gmail.com",
    "password": "Obaid@786"
}

res = requests.post("http://localhost:5000/api/auth/login", json=data)
print(res.status_code)
print(res.json())
