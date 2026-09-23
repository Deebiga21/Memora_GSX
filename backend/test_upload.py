import requests
import time

base_url = "http://127.0.0.1:8000"

print("Uploading document...")
with open("sample_data/05_project_decision.pdf", "rb") as f:
    res = requests.post(f"{base_url}/api/documents/upload", files={"file": ("05_project_decision.pdf", f, "application/pdf")})

doc = res.json()
print("Upload response:", doc)
doc_id = doc["id"]

print("Processing document...")
res = requests.post(f"{base_url}/api/documents/{doc_id}/process")
stats = res.json()
print("Process stats:", stats)

print("Fetching memory nodes...")
res = requests.get(f"{base_url}/api/documents/{doc_id}/extracted_flow")
flow = res.json()
print("Extracted people:", len(flow.get('people', [])))
print("Extracted flow items:", len(flow.get('flow', [])))

print("Asking memory...")
res = requests.post(f"{base_url}/api/ask", json={"message": "What decision was made about LiDAR?"})
qa = res.json()
print("QA Answer:", qa.get("answer"))
print("QA Evidence:", qa.get("evidence"))
