import os
import secrets
from fastapi import Header, HTTPException

ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN")

def verificar_admin(authorization: str = Header(None)):
    if authorization is None or not authorization.startswith("Bearer "):
        print(authorization)
        raise HTTPException(401, "Não autorizado")

    token = authorization.removeprefix("Bearer ")

    if not ADMIN_TOKEN or not secrets.compare_digest(token, ADMIN_TOKEN):
        raise HTTPException(401, "Token inválido")