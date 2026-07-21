from liteparse import LiteParse
from app.services.gemini import get_json_from_raw_text
import json
import re

def extract_text(pdf_path):
    parser = LiteParse()
    result = parser.parse(pdf_path)
    return result.text

def parse_llm_json(raw: str) -> dict:
    """Remove markdown fences (```json ... ```) que o LLM às vezes adiciona apesar da instrução."""
    cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    return json.loads(cleaned)

def filtrar_secoes_relevantes(texto: str) -> str:
    """
    Otimiza textos brutos de PDFs Lattes (incluindo CVs com +100 páginas):
    1. Trunca seções massivas irrelevantes (Bancas, Orientações, Eventos, Cursos, etc.)
    2. Limita o volume da seção de Produção Bibliográfica para os artigos mais recentes
    3. Aplica trava de segurança em no máximo 12.000 caracteres (~3.000 tokens)
    """
    # 1. Cortar seções de grande volume que não impactam a extração do perfil técnico
    padrao_corte = r'\n\s*(Bancas|Orientações|Eventos|Participação em eventos|Organização de eventos|Demais tipos de produção técnica|Prêmios e títulos)\b'
    match = re.search(padrao_corte, texto, re.IGNORECASE)
    if match:
        texto = texto[:match.start()]

    # 2. Se a Produção Bibliográfica for extensa, limitar o trecho (os mais recentes ficam no início)
    prod_match = re.search(r'\n\s*Produção bibliográfica\b', texto, re.IGNORECASE)
    if prod_match:
        inicio_prod = prod_match.start()
        texto = texto[:inicio_prod + 5000]

    # 3. Trava de segurança no comprimento total (~3.000 tokens)
    return texto[:12000].strip()

def get_json(pdf_path):
    text = extract_text(pdf_path)
    text = filtrar_secoes_relevantes(text)
    str_json = get_json_from_raw_text(text)
    return parse_llm_json(str_json)