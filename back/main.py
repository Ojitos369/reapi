from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apis.urls import apis, media
from core.conf.settings import allow_origins, allow_credentials, allow_methods, allow_headers, MEDIA_DIR

app = FastAPI()

app.add_middleware(
    CORSMiddleware, 
    allow_origins=allow_origins,
    allow_credentials=allow_credentials,
    allow_methods=allow_methods,
    allow_headers=allow_headers
)

app.include_router(apis, prefix="/api")
app.include_router(media, prefix="/media")

# index.html: MEDIA_DIR/dist/index.html
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse

@app.get("/", response_class=HTMLResponse)
async def read_index(request: Request):
    with open(f"{MEDIA_DIR}/dist/index.html") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content)

# uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# uvicorn main:app --host 0.0.0.0 --port 8369 --reload

""" 

"""