import os
import time
import requests

API_URL = "http://localhost:8000"

def run_tests():
    print("Testing backend API...")
    
    # Wait for server to start
    for _ in range(10):
        try:
            res = requests.get(f"{API_URL}/health")
            if res.status_code == 200:
                print("Server is up!")
                break
        except requests.exceptions.ConnectionError:
            time.sleep(1)
    else:
        print("Server did not start in time.")
        return
        
    pdf_path = "d:/GSX/memora/datasets/03_committee_meeting.pdf"
    
    # 1. Upload
    print("1. Uploading PDF...")
    with open(pdf_path, "rb") as f:
        files = {"file": (os.path.basename(pdf_path), f, "application/pdf")}
        res = requests.post(f"{API_URL}/documents/upload", files=files)
        
    if res.status_code != 200:
        print(f"Upload failed: {res.text}")
        return
        
    doc_id = res.json()["id"]
    print(f"Uploaded successfully. Document ID: {doc_id}")
    
    # 2. Process
    print(f"2. Processing Document ID: {doc_id}...")
    res = requests.post(f"{API_URL}/documents/{doc_id}/process")
    if res.status_code != 200:
        print(f"Process failed: {res.text}")
        return
        
    print(f"Process results: {res.json()}")
    
    # 3. Check memory
    res = requests.get(f"{API_URL}/people")
    print(f"People populated: {len(res.json())}")
    
    res = requests.get(f"{API_URL}/decisions")
    print(f"Decisions populated: {len(res.json())}")
    
    # 4. Ask a question
    print("3. Asking memory...")
    res = requests.post(f"{API_URL}/ask", json={"message": "What happened to the hardware testing?"})
    print(f"Ask response: {res.json()['answer']}")
    
    # 5. Check evidence
    print("4. Checking evidence...")
    # Find evidence belonging to the document
    # Getting evidence 1 might fail if DB has no evidence with id=1, but the endpoint should work.
    res = requests.get(f"{API_URL}/evidence/1")
    if res.status_code == 200:
        print(f"Evidence 1: {res.json()}")
    else:
        print(f"Evidence 1 not found: {res.status_code}")
        
    print("All tests completed successfully.")

if __name__ == "__main__":
    run_tests()
