import os
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()
client = OpenAI(base_url='https://integrate.api.nvidia.com/v1', api_key=os.getenv('NVIDIA_API_KEY'))
for m in [m.id for m in client.models.list().data]:
  try:
    res = client.chat.completions.create(model=m, messages=[{'role':'user', 'content':'Hi'}], max_tokens=5)
    print('SUCCESS:', m)
    break
  except: pass
print('DONE')
