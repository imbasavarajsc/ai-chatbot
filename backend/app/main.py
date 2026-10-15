from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app import chat
from app.config import settings



app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Chatbot router
app.include_router(chat.router)


@app.get("/")
def health_check():
    return {
        "status": "ok",
        "app": settings.APP_NAME
    }