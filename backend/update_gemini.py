import re

def update_file(filename):
    with open(filename, 'r') as f:
        code = f.read()

    code = code.replace('from openai import OpenAI', 'import google.generativeai as genai')
    code = code.replace('os.getenv("NVIDIA_API_KEY")', '(os.getenv("GEMINI_API_KEY") or os.getenv("NVIDIA_API_KEY"))')
    
    code = re.sub(
        r'    client = OpenAI\(\n.*?api_key=api_key\n    \)', 
        '    genai.configure(api_key=api_key)\n    model = genai.GenerativeModel("gemini-2.5-flash")', 
        code, flags=re.DOTALL
    )
    
    code = re.sub(
        r'        response = client\.chat\.completions\.create\(\n.*?messages=\[\{"role": "user", "content": prompt\}\],\n.*?max_tokens=.*?\n        \)\n        content = response\.choices\[0\]\.message\.content',
        '        response = model.generate_content(prompt)\n        content = response.text',
        code, flags=re.DOTALL
    )
    
    with open(filename, 'w') as f:
        f.write(code)

update_file('app/services/retrieval_service.py')
update_file('app/services/ai_service.py')
