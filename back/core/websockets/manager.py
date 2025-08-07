# core/websockets/manager.py
from typing import List, Dict
from fastapi import WebSocket

class ConnectionManager:
    """
    Gestiona conexiones WebSocket activas, organizadas por grupos.
    """
    def __init__(self):
        # Usamos un diccionario para mapear group_id -> [conexiones]
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, group_id: str):
        """Añade una conexión a un grupo específico."""
        await websocket.accept()
        # Si el grupo no existe, lo creamos
        if group_id not in self.active_connections:
            self.active_connections[group_id] = []
        self.active_connections[group_id].append(websocket)

    def disconnect(self, websocket: WebSocket, group_id: str):
        """Elimina una conexión de un grupo."""
        if group_id in self.active_connections:
            self.active_connections[group_id].remove(websocket)
            # Si el grupo queda vacío, lo eliminamos para no guardar basura
            if not self.active_connections[group_id]:
                del self.active_connections[group_id]

    async def broadcast_to_group(self, message: str, group_id: str):
        """Envía un mensaje a todos los miembros de un grupo."""
        if group_id in self.active_connections:
            # Hacemos una copia para evitar problemas si alguien se desconecta
            # mientras estamos en el bucle.
            for connection in self.active_connections[group_id][:]:
                await connection.send_text(message)

# La instancia única sigue siendo la misma.
manager = ConnectionManager()