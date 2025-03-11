from fastapi import APIRouter, Request
from .api import HelloWorld

router = APIRouter()

@router.get("/hh")
async def hh(request: Request):
    r = await HelloWorld(request=request).run()
    return r
