from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apis.urls import apis
from core.conf.settings import allow_origins, allow_credentials, allow_methods, allow_headers

app = FastAPI()

app.add_middleware(
    CORSMiddleware, 
    allow_origins=allow_origins,
    allow_credentials=allow_credentials,
    allow_methods=allow_methods,
    allow_headers=allow_headers
)

app.include_router(apis, prefix="/api")

# uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# uvicorn main:app --host 0.0.0.0 --port 8369 --reload

""" 

"""