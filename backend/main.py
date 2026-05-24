import os
import sys
import uuid
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.params import Body
from pydantic import BaseModel
from dotenv import load_dotenv
import motor.motor_asyncio
from groq import Groq

load_dotenv()

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from nlp.pipeline import run_pipeline

app = FastAPI(title="ArchViz-XR API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/archviz")
client_db = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI)
db = client_db.archviz

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


class VoiceQuery(BaseModel):
    session_id: str
    question: str


@app.get("/")
async def root():
    return {"status": "ArchViz-XR API is running"}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    allowed = ["image/png", "image/jpeg", "image/jpg", "image/webp"]
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Only image files allowed")

    session_id = str(uuid.uuid4())
    temp_path = f"temp_{session_id}.png"

    try:
        contents = await file.read()
        with open(temp_path, "wb") as f:
            f.write(contents)

        result = run_pipeline(temp_path)
        result["session_id"] = session_id

        try:
            await db.sessions.insert_one({
                "_id": session_id,
                "filename": file.filename,
                "result": result
            })
        except Exception:
            pass

        return result

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/voice-query")
async def voice_query(body: VoiceQuery):
    session = await db.sessions.find_one({"_id": body.session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    context = session["result"].get("explanation", "")

    prompt = f"""You are an AR education assistant explaining a research diagram.

Context about the diagram: {context}

User question: {body.question}

Answer in 2-3 sentences, simply and clearly."""

    try:
        response = groq_client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=300
        )
        answer = response.choices[0].message.content
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/session/{session_id}")
async def get_session(session_id: str):
    session = await db.sessions.find_one({"_id": Body.session_id})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.pop("_id", None)
    return session