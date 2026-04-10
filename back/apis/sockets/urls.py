from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json

from .api import ChatSocketApi
from core.websockets.manager import manager
from core.simulation.world_engine import world_engine_instance

router = APIRouter()

@router.websocket("/simulation")
async def simulation_socket_endpoint(websocket: WebSocket):
    await manager.connect(websocket, "simulation_group")
    
    async def receive_commands():
        try:
            while True:
                data = await websocket.receive_text()
                msg = json.loads(data)
                cmd = msg.get("command")
                
                if cmd == "PAUSE":
                    world_engine_instance.stop()
                elif cmd == "RESUME":
                    if not world_engine_instance.running:
                        await world_engine_instance.start()
                elif cmd == "SPEED":
                    world_engine_instance.time_scale = float(msg.get("value", 1.0))
                elif cmd == "RESET":
                    world_engine_instance.reset_world()
        except:
            pass

    command_task = asyncio.create_task(receive_commands())
    
    try:
        while True:
            # Send world state
            world_state = {
                "agents": [a.to_dict() for a in world_engine_instance.agents],
                "env_objects": [obj.to_dict() for obj in world_engine_instance.env_objects],
                "chat_logs": world_engine_instance.chat_logs[-15:], # send last 15 messages/events
                "game_time": world_engine_instance.game_time,
                "size_x": world_engine_instance.size_x,
                "size_y": world_engine_instance.size_y,
                "time_scale": world_engine_instance.time_scale,
                "is_running": world_engine_instance.running,
                "biome_seeds": world_engine_instance.biome_seeds,
                "biomes_config": world_engine_instance.biomes_config
            }
            await websocket.send_text(json.dumps(world_state))
            await asyncio.sleep(0.1) # 10 FPS updates
    except WebSocketDisconnect:
        manager.disconnect(websocket, "simulation_group")
        command_task.cancel()
    except Exception as e:
        print(f"WS error: {e}")
        manager.disconnect(websocket, "simulation_group")
        command_task.cancel()

@router.websocket("/{chat_id}")
async def chat_socket_endpoint(websocket: WebSocket, chat_id: str):
    handler = ChatSocketApi(
        websocket=websocket, 
        manager=manager, 
        chat_id=chat_id
    )
    await handler.handle_connection()
