from fastapi import FastAPI
from app.routes.researcher import router as researcher_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(researcher_router)

@app.get("/")
async def root():
    return {"message": "Orienta.Ai API"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # origem do seu Vite (ajuste se a porta for outra)
    allow_credentials=True,
    allow_methods=["*"],  # ou especifique ["GET", "POST", "OPTIONS"]
    allow_headers=["*"],
)