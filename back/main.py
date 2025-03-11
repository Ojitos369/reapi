from fastapi import FastAPI
from apis.urls import apis

app = FastAPI()
app.include_router(apis, prefix="/api")
