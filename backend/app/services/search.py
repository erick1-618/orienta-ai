import unicodedata
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def normalizar_texto(texto: str) -> str:
    """
    Remove acentos, converte para minúsculas e remove caracteres especiais duplicados.
    """
    if not texto:
        return ""
    # Decompor caracteres acentuados (NFD) e filtrar marcas de diacrítico
    nfkd = unicodedata.normalize("NFD", texto)
    sem_acento = "".join([c for c in nfkd if unicodedata.category(c) != "Mn"])
    sem_acento = sem_acento.lower()
    # Substituir qualquer caractere não alfanumérico por espaço
    limpo = re.sub(r"[^\w\s]", " ", sem_acento)
    # Reduzir múltiplos espaços
    return re.sub(r"\s+", " ", limpo).strip()


def montar_documento_professor(professor: dict) -> str:
    """
    Constrói uma representação em texto do perfil do professor com pesos diferenciados
    para campos de maior relevância temática (linhas de pesquisa, palavras-chave).
    """
    linhas_pesquisa = " ".join(professor.get("linhas_de_pesquisa", []))
    palavras_chave = " ".join(professor.get("palavras_chave", []))
    areas_atuacao = " ".join(professor.get("areas_de_atuacao", []))
    resumo = professor.get("resumo", "")
    projetos = " ".join(professor.get("projetos_pesquisa", []))
    publicacoes = " ".join(professor.get("publicacoes_recentes", []))

    # Ponderação multiplicando a frequência de aparição de campos-chave
    partes = [
        (linhas_pesquisa + " ") * 3,
        (palavras_chave + " ") * 3,
        (areas_atuacao + " ") * 2,
        resumo,
        projetos,
        publicacoes,
    ]

    doc_bruto = " ".join(partes)
    return normalizar_texto(doc_bruto)


def pre_filtrar_professores(linha_pesquisa: str, professores: list, top_k: int = 5) -> list:
    """
    Realiza a pré-filtragem dos professores com base na linha de pesquisa do aluno.
    Retorna no máximo `top_k` professores ordenados por aderência sintática/semântica (TF-IDF).
    """
    if not professores:
        return []

    if len(professores) <= top_k:
        return professores

    query_norm = normalizar_texto(linha_pesquisa)
    if not query_norm:
        return professores[:top_k]

    docs_professores = [montar_documento_professor(p) for p in professores]
    corpus = [query_norm] + docs_professores

    try:
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True)
        tfidf_matrix = vectorizer.fit_transform(corpus)

        query_vec = tfidf_matrix[0:1]
        prof_vecs = tfidf_matrix[1:]

        similarities = cosine_similarity(query_vec, prof_vecs).flatten()

        # Parear pontuações com os índices dos professores
        prof_scores = list(enumerate(similarities))
        # Ordenar por maior similaridade
        prof_scores.sort(key=lambda x: x[1], reverse=True)

        top_indices = [idx for idx, _ in prof_scores[:top_k]]
        return [professores[i] for i in top_indices]

    except Exception:
        # Em caso de qualquer falha na vetorização (ex: vocabulário vazio), fallback gracioso
        return professores[:top_k]
