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

import re

def filtrar_secoes_relevantes(texto: str) -> str:
    secoes_relevantes = [
        "Identificação", "Formação acadêmica/titulação", "Atuação Profissional",
        "Linhas de pesquisa", "Projetos de pesquisa", "Áreas de atuação",
        "Produção bibliográfica",
    ]
    secoes_descartar = [
        "Bancas", "Orientações", "Eventos", "Produção técnica",
        "Educação e Popularização de C & T", "Organização de eventos",
    ]

    marcadores = secoes_relevantes + secoes_descartar
    posicoes = []
    for marcador in marcadores:
        for m in re.finditer(re.escape(marcador), texto):
            posicoes.append((m.start(), marcador))
    posicoes.sort()

    partes = {}
    for i, (idx, marcador) in enumerate(posicoes):
        fim = posicoes[i + 1][0] if i + 1 < len(posicoes) else len(texto)
        # só guarda a PRIMEIRA ocorrência de cada seção
        if marcador not in partes:
            partes[marcador] = texto[idx:fim].strip()

    return "\n\n".join(partes[s] for s in secoes_relevantes if s in partes)

def get_json(pdf_path):
    text = extract_text(pdf_path)
    text = filtrar_secoes_relevantes(text)
    str_json = get_json_from_raw_text(text)
    return parse_llm_json(str_json)