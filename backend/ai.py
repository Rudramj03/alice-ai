from openai import OpenAI
from config import OPENAI_API_KEY, MODEL_NAME

client = OpenAI(api_key=OPENAI_API_KEY)

def get_ai_response(user_input: str) -> str:
    completion = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": "You are a helpful AI virtual assistant."},
            {"role": "user", "content": user_input}
        ],
        temperature=0.6,
        max_tokens=300
    )
    return completion.choices[0].message.content
