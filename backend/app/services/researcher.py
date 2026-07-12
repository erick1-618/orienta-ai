from filelock import FileLock
from datetime import datetime, timezone
from app.services.pdf_processing import get_json
import json
import os
import uuid

DB_PATH = "app/data/professores.json"
LOCK_PATH = "app/data/professores.json.lock"

def _ler_professores(db_path=DB_PATH):
    try:
        with open(db_path, "r", encoding="utf-8") as f:
            conteudo = f.read().strip()
            return json.loads(conteudo) if conteudo else []
    except FileNotFoundError:
        return []

def _escrever_professores(professores, db_path=DB_PATH):
    tmp_path = f"{db_path}.tmp"
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(professores, f, ensure_ascii=False, indent=2)
    os.replace(tmp_path, db_path)

def salvar_professor(perfil, professor_id=None, db_path=DB_PATH):
    """Insere um novo professor (professor_id=None) ou atualiza um existente."""
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    lock = FileLock(LOCK_PATH, timeout=10)

    with lock:
        professores = _ler_professores(db_path)
        agora = datetime.now(timezone.utc).isoformat()

        if professor_id is None:
            professor_id = str(uuid.uuid4())
            perfil["id"] = professor_id
            perfil["criado_em"] = agora
            perfil["atualizado_em"] = agora
            professores.append(perfil)
        else:
            idx = next((i for i, p in enumerate(professores) if p.get("id") == professor_id), None)
            if idx is None:
                raise ValueError(f"Professor com id {professor_id} não encontrado")

            perfil["id"] = professor_id
            perfil["criado_em"] = professores[idx].get("criado_em", agora)
            perfil["atualizado_em"] = agora
            professores[idx] = perfil

        _escrever_professores(professores, db_path)

    return professor_id

def listar_professores(db_path=DB_PATH):
    return _ler_professores(db_path)

def deletar_professor(professor_id, db_path=DB_PATH):
    lock = FileLock(LOCK_PATH, timeout=10)

    with lock:
        professores = _ler_professores(db_path)

        idx = next((i for i, p in enumerate(professores) if p.get("id") == professor_id), None)
        if idx is None:
            raise ValueError(f"Professor com id {professor_id} não encontrado")

        professores.pop(idx)
        _escrever_professores(professores, db_path)

def criar_professor(pdf_path):
    """pdf_path: caminho local do PDF (temp file criado pela rota, ou arquivo de teste)."""
    perfil = get_json(pdf_path)
    professor_id = salvar_professor(perfil)
    return professor_id, perfil

def atualizar_professor(pdf_path, professor_id):
    """Reprocessa o PDF e sobrescreve o registro existente."""
    perfil = get_json(pdf_path)
    salvar_professor(perfil, professor_id=professor_id)
    return perfil