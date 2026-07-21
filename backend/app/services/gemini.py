from os import getenv
from dotenv import load_dotenv
from groq import Groq
import json
from app.services.search import pre_filtrar_professores

load_dotenv('.env')

client = Groq(api_key=getenv("LLM_API_KEY"))

MODEL = "llama-3.3-70b-versatile"
MODEL_FAST = "llama-3.1-8b-instant"


def get_json_from_raw_text(raw_text):
    PROMPT_BASE = """Você é um extrator de informações estruturadas de currículos Lattes (CNPq).

    Abaixo está o texto bruto extraído de um PDF de currículo Lattes, possivelmente com formatação quebrada, quebras de linha irregulares, numeração de listas e artefatos de conversão de PDF.

    Sua tarefa é ler o texto e retornar APENAS um objeto JSON válido, sem nenhum texto antes ou depois, sem markdown, sem ```json, seguindo exatamente este schema:

    {
    "nome": "string - nome completo do pesquisador",
    "resumo": "string - resumo objetivo das áreas de pesquisa ativas do pesquisador, em 2-4 frases, escrito por você com base no conjunto do currículo (não é uma cópia literal de nenhuma seção)",
    "linhas_de_pesquisa": ["string", "..."],
    "areas_de_atuacao": ["string", "..."],
    "projetos_pesquisa": ["título do projeto", "..."],
    "publicacoes_recentes": ["título do artigo/trabalho", "... (no máximo 15, priorizando os mais recentes e relevantes)"],
    "palavras_chave": ["string - termos técnicos centrais ao trabalho do pesquisador, extraídos ou inferidos do conjunto do currículo, no máximo 10"]
    }

    Regras importantes:
    - IGNORE completamente: participações em banca examinadora, participações em eventos como ouvinte, dados de contato (email, endereço, telefone), formação acadêmica (graduação/mestrado/doutorado em si, apenas mencione a área se ajudar a contextualizar o resumo), idiomas, prêmios e menções honrosas.
    - Se uma seção do schema não existir claramente no texto (ex: não há "linhas de pesquisa" explícitas), infira o conteúdo mais próximo a partir de projetos e publicações, mas NUNCA invente informação que não tem base no texto.
    - Se após tentar inferir ainda não houver informação suficiente para um campo, retorne uma lista vazia [] ou string vazia "" — nunca omita a chave do JSON.
    - Normalize nomes de projetos e publicações removendo numeração de lista, colchetes de referência ou lixo de OCR quando identificável.
    - O campo "resumo" deve ser sua própria síntese, útil para um sistema de matching aluno-orientador — não deve soar como um trecho copiado do currículo.
    - Retorne exclusivamente o JSON. Qualquer texto fora do objeto JSON quebra o parsing.

    TEXTO DO CURRÍCULO:
    """

    PROMPT_FINAL = PROMPT_BASE + raw_text

    response = client.chat.completions.create(
        model=MODEL_FAST,
        messages=[{"role": "user", "content": PROMPT_FINAL}],
        response_format={"type": "json_object"},
    )

    return response.choices[0].message.content


def compara_linha_pesquisa(linha_pesquisa, professores, top_k=5):
    """
    linha_pesquisa: string com o interesse de pesquisa do aluno
    professores: lista de dicts (o JSON com todos os professores)
    top_k: número máximo de candidatos para pré-filtragem (default 5)
    """
    if not professores:
        return {"recomendacoes": []}

    professores_candidatos = pre_filtrar_professores(linha_pesquisa, professores, top_k=top_k)

    contexto = "\n\n---\n\n".join(
        f"PROFESSOR: {p['nome']}\n"
        f"id: {p['id']}\n"
        f"Resumo: {p.get('resumo', '')}\n"
        f"Linhas de pesquisa: {', '.join(p.get('linhas_de_pesquisa', []))}\n"
        f"Áreas de atuação: {', '.join(p.get('areas_de_atuacao', []))}\n"
        f"Projetos: {', '.join(p.get('projetos_pesquisa', []))}\n"
        f"Publicações recentes: {', '.join(p.get('publicacoes_recentes', []))}\n"
        f"Palavras-chave: {', '.join(p.get('palavras_chave', []))}"
        for p in professores_candidatos
    )

    prompt = f"""Você tem os perfis de pesquisa de {len(professores_candidatos)} professores pré-selecionados de um departamento.

    {contexto}

    ---

    Um aluno quer pesquisar sobre: "{linha_pesquisa}"

    Retorne APENAS um objeto JSON, sem texto adicional, sem markdown, seguindo este schema:

    {{
    "recomendacoes": [
        {{
        "nome": "nome do professor",
        "score": "número de 0 a 100 indicando aderência à linha de pesquisa",
        "justificativa": "1-2 frases explicando o porquê, citando o trecho do perfil que embasa",
        "id": "id do professor"
        }}
    ]
    }}

    Liste no máximo os 3 professores mais adequados, em ordem decrescente de score.
    Se nenhum professor tiver relação clara com a linha de pesquisa, retorne a lista "recomendacoes" vazia."""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )

    cleaned = response.choices[0].message.content.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    return json.loads(cleaned)