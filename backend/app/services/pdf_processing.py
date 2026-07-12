from liteparse import LiteParse
from app.services.gemini import get_json_from_raw_text
import json

def extract_text(pdf_path):
    parser = LiteParse()
    result = parser.parse(pdf_path)
    return result.text

def parse_llm_json(raw: str) -> dict:
    """Remove markdown fences (```json ... ```) que o LLM às vezes adiciona apesar da instrução."""
    cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    return json.loads(cleaned)

def get_json(pdf_path):
    text = extract_text(pdf_path)
    str_json = get_json_from_raw_text(text)
    return parse_llm_json(str_json)