"""
lattes_parser.py

Pipeline de extração de currículos Lattes (PDF) para JSON estruturado,
usado no Orienta.AI para popular perfis de professores/pesquisadores.

Fluxo:
    PDF -> extract_text (liteparse)
        -> remover_duplicatas       (liteparse costuma duplicar blocos
                                      em CVs com layout colunar/foto)
        -> limpar_boilerplate       (remove rodapé, endereço, telefone etc.)
        -> filtrar_secoes_relevantes (mantém só as seções úteis pro matching)
        -> get_json_from_raw_text   (LLM extrai JSON estruturado)
        -> parse_llm_json           (limpa fences markdown e faz json.loads)
"""

from __future__ import annotations

import json
import logging
import re

from liteparse import LiteParse
from app.services.gemini import get_json_from_raw_text

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# 1. Extração bruta do PDF
# ---------------------------------------------------------------------------

def extract_text(pdf_path: str) -> str:
    """Extrai o texto bruto do PDF via liteparse."""
    parser = LiteParse()
    result = parser.parse(pdf_path)
    return result.text


# ---------------------------------------------------------------------------
# 2. Remoção de duplicatas
# ---------------------------------------------------------------------------
# Muitos currículos Lattes com layout colunar (foto, ícones, campos lado a
# lado) fazem o liteparse extrair o mesmo conteúdo duas vezes: uma vez no
# modo "visual" (blocos tipo "Nome" / valor) e outra em ordem de leitura
# linear, repetindo o texto quase idêntico logo em seguida.

def remover_duplicatas(texto: str, min_len: int = 60) -> str:
    """Remove blocos de texto (separados por linha em branco) que se repetem
    integralmente. Blocos curtos (títulos, números soltos) não entram no
    dedup porque coincidências curtas são esperadas e não indicam duplicação
    real do parser.
    """
    blocos = re.split(r"\n\s*\n", texto)
    vistos: set[str] = set()
    resultado: list[str] = []

    for bloco in blocos:
        chave = " ".join(bloco.split())  # normaliza espaços/quebras de linha
        if len(chave) >= min_len:
            if chave in vistos:
                continue
            vistos.add(chave)
        resultado.append(bloco)

    return "\n\n".join(resultado)


# ---------------------------------------------------------------------------
# 3. Remoção de boilerplate
# ---------------------------------------------------------------------------
# Trechos fixos que aparecem em praticamente todo currículo Lattes e não
# ajudam o LLM a extrair informação relevante (na verdade, só consomem
# tokens e podem confundir o matching de seções).

_BOILERPLATE_PATTERNS = [
    r"Página gerada pelo Sistema Currículo Lattes.*",
    r"Somente os dados identificados como públicos.*",
    r"Configuração de privacidade na Plataforma Lattes",
    r"Endereço para acessar este CV:.*",
    r"ID Lattes:\s*\d+",
    r"Última atualização do currículo em\s*\d{2}/\d{2}/\d{4}",
    r"Telefone:\s*\(\d{2}\)\s*[\d-]+",
    r"http://lattes\.cnpq\.br/\d+",
    r"\(Texto informado pelo autor\)",
]

_BOILERPLATE_RE = re.compile(
    "|".join(_BOILERPLATE_PATTERNS), flags=re.IGNORECASE
)


def limpar_boilerplate(texto: str) -> str:
    texto = _BOILERPLATE_RE.sub("", texto)
    # colapsa múltiplas linhas em branco deixadas pela remoção
    texto = re.sub(r"\n{3,}", "\n\n", texto)
    return texto.strip()


# ---------------------------------------------------------------------------
# 4. Filtro de seções relevantes
# ---------------------------------------------------------------------------
# Os nomes de seção do Lattes são bastante padronizados. Ancoramos o match
# em linha inteira (^...$ com re.MULTILINE) para não confundir o cabeçalho
# de seção com a mesma string aparecendo dentro de uma descrição de projeto
# (ex.: "Formação acadêmica" citado dentro do texto livre de um projeto).

SECOES_RELEVANTES = [
    "Identificação",
    "Formação acadêmica/titulação",
    "Atuação Profissional",
    "Linhas de pesquisa",
    "Projetos de pesquisa",
    "Áreas de atuação",
    "Produção bibliográfica",
]

SECOES_DESCARTAR = [
    "Idiomas",
    "Prêmios e títulos",
    "Bancas",
    "Orientações",
    "Eventos",
    "Produção técnica",
    "Educação e Popularização de C & T",
    "Organização de eventos, congressos, exposições e feiras",
    "Inovação",
]


def _encontrar_marcadores(texto: str, marcadores: list[str]) -> list[tuple[int, str]]:
    posicoes = []
    for marcador in marcadores:
        pattern = rf"(?m)^[ \t]*{re.escape(marcador)}[ \t]*$"
        for m in re.finditer(pattern, texto):
            posicoes.append((m.start(), marcador))
    return posicoes


def filtrar_secoes_relevantes(texto: str) -> str:
    marcadores = SECOES_RELEVANTES + SECOES_DESCARTAR
    posicoes = sorted(_encontrar_marcadores(texto, marcadores))

    if not posicoes:
        # Nenhum marcador encontrado — não filtra, para não descartar tudo
        # silenciosamente (melhor mandar texto "sujo" pro LLM do que nada).
        logger.warning("Nenhuma seção reconhecida no currículo; enviando texto completo.")
        return texto

    partes: dict[str, str] = {}
    for i, (idx, marcador) in enumerate(posicoes):
        fim = posicoes[i + 1][0] if i + 1 < len(posicoes) else len(texto)
        if marcador not in partes:  # só guarda a primeira ocorrência
            partes[marcador] = texto[idx:fim].strip()

    return "\n\n".join(partes[s] for s in SECOES_RELEVANTES if s in partes)


# ---------------------------------------------------------------------------
# 5. Parsing da resposta do LLM
# ---------------------------------------------------------------------------

def parse_llm_json(raw: str) -> dict:
    """Remove fences markdown (```json ... ```) que o LLM às vezes adiciona
    apesar da instrução de responder só com JSON.
    """
    cleaned = (
        raw.strip()
        .removeprefix("```json")
        .removeprefix("```")
        .removesuffix("```")
        .strip()
    )
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        logger.error("Falha ao decodificar JSON retornado pelo LLM: %r", cleaned[:500])
        raise


# ---------------------------------------------------------------------------
# 6. Pipeline principal
# ---------------------------------------------------------------------------

def preprocess_text(text: str) -> str:
    """Aplica toda a cadeia de limpeza sobre o texto bruto extraído do PDF."""
    text = remover_duplicatas(text)
    text = limpar_boilerplate(text)
    text = filtrar_secoes_relevantes(text)
    return text


def get_json(pdf_path: str) -> dict:
    """Ponto de entrada: PDF do currículo Lattes -> dict estruturado."""
    raw_text = extract_text(pdf_path)
    clean_text = preprocess_text(raw_text)

    if not clean_text.strip():
        raise ValueError(f"Texto vazio após pré-processamento para {pdf_path!r}")

    str_json = get_json_from_raw_text(clean_text)
    return parse_llm_json(str_json)