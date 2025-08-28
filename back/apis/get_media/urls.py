import os
from fastapi import APIRouter, Request
from fastapi.responses import FileResponse
from .api import GetMedia
from core.conf.settings import MEDIA_DIR

router = APIRouter()

@router.get("/{ruta:path}", response_class=FileResponse)
async def gm(request: Request, ruta: str):
    print(MEDIA_DIR)
    file = MEDIA_DIR + '/' + ruta
    print(file)
    if not os.path.isabs(file):
        return {"error": "Invalid file path"}
    if not file.startswith(MEDIA_DIR):
        return {"error": "Invalid file path"}
    if not os.path.exists(file):
        return {"error": "File not found"}
    if not os.path.isfile(file):
        return {"error": "Path is not a file"}
    return FileResponse(file)
    