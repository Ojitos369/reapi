from fastapi import APIRouter
from .base.urls import router as base_router

apis = APIRouter()

apis.include_router(base_router, prefix="/base")
