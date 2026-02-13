import os
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq
import re

# -------------------------------------------------
# Load environment variables
# -------------------------------------------------
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY not found in .env")

# -------------------------------------------------
# Initialize Groq client
# -------------------------------------------------
client = Groq(api_key=GROQ_API_KEY)

# -------------------------------------------------
# FastAPI app
# -------------------------------------------------
app = FastAPI(title="Alice AI Backend (Groq + Web Search)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# Request / Response Models
# -------------------------------------------------
class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

# -------------------------------------------------
# FREE Web Search (DuckDuckGo)
# -------------------------------------------------
def web_search(query: str) -> str:
    url = "https://api.duckduckgo.com/"
    params = {
        "q": query,
        "format": "json",
        "no_html": 1,
        "no_redirect": 1
    }

    try:
        res = requests.get(url, params=params, timeout=5)
        data = res.json()

        if data.get("AbstractText"):
            return data["AbstractText"]

        if data.get("RelatedTopics"):
            texts = []
            for item in data["RelatedTopics"][:5]:
                if isinstance(item, dict) and "Text" in item:
                    texts.append(item["Text"])
            if texts:
                return " ".join(texts)

        return "No clear web result found."

    except Exception:
        return "Web search failed."

# -------------------------------------------------
# Routes
# -------------------------------------------------
@app.get("/")
def root():
    return {"status": "Alice backend is running 🚀"}

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        # 1️⃣ Get web info
        web_info = web_search(request.message)

        # 2️⃣ Ask Groq to answer using web info
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are Alice, a smart voice assistant. "
                        "Use the provided web information when relevant, "
                        "and answer clearly and concisely."
                    )
                },
                {
                    "role": "user",
                    "content": (
                        f"User question: {request.message}\n\n"
                        f"Web information: {web_info}"
                    )
                }
            ],
            temperature=0.5,
            max_tokens=512
        )

        reply = completion.choices[0].message.content
        return {"response": reply}

    except Exception as e:
        return {"response": f"Error: {str(e)}"}
    


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

