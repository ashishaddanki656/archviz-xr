import os
import json
import math
import pytesseract
from PIL import Image
from dotenv import load_dotenv
import spacy
import requests

load_dotenv()

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

nlp = spacy.load("en_core_web_sm")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"


def extract_text_from_image(image_path: str) -> str:
    img = Image.open(image_path)
    text = pytesseract.image_to_string(img)
    return text.strip()


def extract_entities_and_relations(text: str) -> dict:
    doc = nlp(text)
    nodes = []
    seen = set()

    for ent in doc.ents:
        if ent.text not in seen:
            nodes.append({
                "id": ent.text.lower().replace(" ", "_"),
                "label": ent.text,
                "type": ent.label_
            })
            seen.add(ent.text)

    for chunk in doc.noun_chunks:
        if chunk.text not in seen and len(chunk.text.split()) <= 4:
            nodes.append({
                "id": chunk.text.lower().replace(" ", "_"),
                "label": chunk.text,
                "type": "component"
            })
            seen.add(chunk.text)

    edges = []
    for token in doc:
        if token.dep_ in ("nsubj", "dobj", "prep") and token.head.text != token.text:
            edges.append({
                "from": token.text.lower().replace(" ", "_"),
                "to": token.head.text.lower().replace(" ", "_"),
                "label": token.dep_
            })

    return {"nodes": nodes[:20], "edges": edges[:30]}


def assign_coordinates(nodes: list) -> list:
    total = len(nodes)
    for i, node in enumerate(nodes):
        angle = (2 * math.pi * i) / max(total, 1)
        node["x"] = round(math.cos(angle) * 1.5, 2)
        node["y"] = round(i * 0.4 - total * 0.2, 2)
        node["z"] = round(math.sin(angle) * 1.5, 2)
    return nodes


def call_gemini(text: str) -> dict:
    if not GEMINI_API_KEY:
        return {"explanation": "Gemini API key not set.", "quiz": []}

    prompt = f"""You are an educational AI. Given this text extracted from a research diagram:

\"\"\"{text}\"\"\"

Return a JSON object with exactly these two keys:
1. "explanation": a 2-3 sentence plain English explanation of what this diagram shows.
2. "quiz": a list of 3 multiple choice questions, each with keys "q", "options" (list of 4), "answer" (0-indexed int).

Return only valid JSON. No markdown, no extra text."""

    headers = {"Content-Type": "application/json"}
    body = {"contents": [{"parts": [{"text": prompt}]}]}

    try:
        res = requests.post(
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            headers=headers,
            json=body,
            timeout=30
        )
        raw = res.json()
        content = raw["candidates"][0]["content"]["parts"][0]["text"]
        content = content.strip().strip("```json").strip("```").strip()
        return json.loads(content)
    except Exception as e:
        return {"explanation": f"Gemini call failed: {str(e)}", "quiz": []}


def run_pipeline(image_path: str) -> dict:
    print(f"[pipeline] Running on: {image_path}")

    text = extract_text_from_image(image_path)
    print(f"[pipeline] OCR text: {text[:100]}")

    graph = extract_entities_and_relations(text)
    graph["nodes"] = assign_coordinates(graph["nodes"])

    gemini_output = call_gemini(text)

    return {
        "nodes": graph["nodes"],
        "edges": graph["edges"],
        "explanation": gemini_output.get("explanation", ""),
        "quiz": gemini_output.get("quiz", [])
    }


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python pipeline.py <image_path>")
    else:
        output = run_pipeline(sys.argv[1])
        print(json.dumps(output, indent=2))