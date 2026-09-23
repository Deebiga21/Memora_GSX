import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("NVIDIA_API_KEY")

client = OpenAI(
  base_url = "https://integrate.api.nvidia.com/v1",
  api_key = api_key
)

try:
    completion = client.chat.completions.create(
      model="meta/llama-3.1-8b-instruct",
      messages=[{"role":"user","content":"Hello"}],
      temperature=0.2,
      top_p=0.7,
      max_tokens=1024,
      stream=False
    )
    print("NVIDIA SUCCESS: " + completion.choices[0].message.content)
except Exception as e:
    print(f"NVIDIA ERROR: {e}")
