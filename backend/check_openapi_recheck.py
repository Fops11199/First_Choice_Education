
import requests
import json

try:
    resp = requests.get('http://localhost:8080/openapi.json')
    data = resp.json()
    enroll_path = data.get('paths', {}).get('/api/v1/students/me/enrollments', {})
    print(json.dumps(enroll_path, indent=2))
except Exception as e:
    print(f"Error: {e}")
