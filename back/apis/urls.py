from fastapi import APIRouter
from .base.urls import router as base_router
from .sockets.urls import router as socket_router

apis = APIRouter()

apis.include_router(base_router, prefix="/base")
apis.include_router(socket_router, prefix="/ws")
