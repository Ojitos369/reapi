from fastapi import APIRouter, WebSocket
from .api import ChatSocketApi
from core.websockets.manager import manager

router = APIRouter()

@router.websocket("/{group_id}/{client_id}")
async def chat_socket_endpoint(websocket: WebSocket, group_id: str, client_id: int):
    """
    Este es el endpoint que expone el WebSocket.
    Crea una instancia de nuestro manejador lógico y le cede el control.
    """
    print("client_id", client_id)
    handler = ChatSocketApi(
        websocket=websocket, 
        manager=manager, 
        group_id=group_id, 
        client_id=client_id
    )
    await handler.handle_connection()