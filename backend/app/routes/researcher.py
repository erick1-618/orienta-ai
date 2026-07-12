import tempfile
import os
from fastapi import APIRouter, UploadFile, HTTPException, Depends, Request

from app.services.researcher import (
    criar_professor,
    atualizar_professor,
    listar_professores,
    deletar_professor,
)
from app.services.gemini import compara_linha_pesquisa
from app.auth import verificar_admin

router = APIRouter(prefix="/professores", tags=["professores"])

MAX_SIZE_MB = 20

async def _salvar_pdf_temp(pdf: UploadFile) -> str:
    if pdf.content_type != "application/pdf":
        raise HTTPException(400, "Arquivo deve ser um PDF")

    conteudo = await pdf.read()
    if len(conteudo) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(413, f"Arquivo excede {MAX_SIZE_MB}MB")

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(conteudo)
        return tmp.name

@router.get("")
def get_professores():
    return listar_professores()

@router.post("/comparar")
async def post_comparar_linha_pesquisa(request: Request):
    body = await request.json()
    linha_pesquisa = body.get("linha_pesquisa")

    if not linha_pesquisa:
        return {"error": "campo 'linha_pesquisa' é obrigatório"}, 400

    professores = listar_professores()
    resultado = compara_linha_pesquisa(linha_pesquisa, professores)
    return resultado

# Rotas do admin

@router.post("", dependencies=[Depends(verificar_admin)])
async def post_professor(pdf: UploadFile):
    tmp_path = await _salvar_pdf_temp(pdf)
    try:
        professor_id, perfil = criar_professor(tmp_path)
    finally:
        os.unlink(tmp_path)

    return {"id": professor_id, "professor": perfil}


@router.put("/{professor_id}", dependencies=[Depends(verificar_admin)])
async def put_professor(professor_id: str, pdf: UploadFile):
    tmp_path = await _salvar_pdf_temp(pdf)
    try:
        perfil = atualizar_professor(tmp_path, professor_id)
    except ValueError as e:
        raise HTTPException(404, str(e))
    finally:
        os.unlink(tmp_path)

    return {"id": professor_id, "professor": perfil}


@router.delete("/{professor_id}", dependencies=[Depends(verificar_admin)])
def delete_professor(professor_id: str):
    try:
        deletar_professor(professor_id)
    except ValueError as e:
        raise HTTPException(404, str(e))

    return {"status": "removido", "id": professor_id}