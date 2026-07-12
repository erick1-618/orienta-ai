from fastapi import FastAPI
from app.routes.researcher import router as researcher_router

app = FastAPI()

app.include_router(researcher_router)

@app.get("/")
async def root():
    return {"message": "Orienta.Ai API"}