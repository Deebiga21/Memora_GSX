import os, time
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()
client = OpenAI(base_url='https://integrate.api.nvidia.com/v1', api_key=os.getenv('NVIDIA_API_KEY'))
t0=time.time()
res = client.chat.completions.create(model='deepseek-ai/deepseek-v4.1-flash', messages=[{'role':'user', 'content':'Respond with a 50 word summary of why water is wet.'}], max_tokens=2048)
print('Time:', time.time()-t0)
print(res.choices[0].message.content)
