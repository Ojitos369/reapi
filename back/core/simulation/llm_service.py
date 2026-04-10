import httpx
import json
import os
import datetime

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL_NAME = "q3508"
LOG_DIR = "back/data/logs"
os.makedirs(LOG_DIR, exist_ok=True)

def log_llm_interaction(agent_name, prompt_type, input_data, output_data):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = {
        "timestamp": timestamp,
        "agent": agent_name,
        "type": prompt_type,
        "input": input_data,
        "output": output_data
    }
    
    # Print to console in real-time
    print(f"\n[LLM] {timestamp} | Agent: {agent_name} | Task: {prompt_type}")
    print(f"  > Input: {str(input_data)[:200]}...")
    print(f"  < Output: {str(output_data)[:200]}...\n")
    
    # Save to file
    log_file = os.path.join(LOG_DIR, "llm_interactions.jsonl")
    with open(log_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")

async def generate_dialogue(agent, other_agent, recent_context: str) -> dict:
    system_prompt = f"Rol: {agent.name}. Personalidad: {', '.join(agent.personality)}. Instrucción: Responde en español con respuestas cortas. NO pienses en voz alta. NO des explicaciones. Solo escribe el diálogo."
    
    user_prompt = f"Contexto: {recent_context}\nTu respuesta debe ser corta:"

    try:
        # We give it unlimited time to respond so the connection NEVER cuts
        async with httpx.AsyncClient(timeout=None) as client:
            response = await client.post(OLLAMA_URL, json={
                "model": MODEL_NAME,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "stream": False,
                "options": {
                    "temperature": 0.9,
                    "num_ctx": 1024
                }
            })
            if response.status_code == 200:
                data = response.json()
                bot_message = data.get("message", {})
                content_raw = bot_message.get("content", "").strip()
                text = content_raw.strip('"').replace('\n', ' ')
                
                thought = bot_message.get("thought", "")
                if not thought and "<think>" in text:
                     parts = text.split("</think>")
                     if len(parts) >= 2:
                         thought = parts[0].replace("<think>", "").strip()
                         text = parts[1].strip()

                if not text:
                    text = "...(mirada silenciosa)"
                
                result = {"text": text, "thought": thought}
                log_llm_interaction(agent.name, "dialogue", {"system": system_prompt, "user": user_prompt}, result)
                return result
            else:
                return {"text": f"...(Error {response.status_code})", "thought": ""}
    except Exception as e:
        print(f"[{agent.name}] Error connecting to Ollama: {e}")
        return {"text": "...(conexión perdida)", "thought": ""}

async def generate_command(agent, inventory_str: str, surrounding_str: str) -> dict:
    system_prompt = f"""Eres {agent.name}. Personalidad: {', '.join(agent.personality)}.
Tu objetivo es descubrir qué puedes hacer con lo que tienes.
Inventario actual: {inventory_str}
Entorno: {surrounding_str}
Recetas ya aprendidas: {', '.join(agent.discovered_recipes) if agent.discovered_recipes else 'Ninguna'}

Debes proponer un comando de descubrimiento, crafteo o construcción.
Responde ÚNICAMENTE con un objeto JSON válido:
{{
  "thought": "Tu razonamiento breve sobre por qué intentas esto",
  "command": "CRAFT: [Item]" o "BUILD: [Nombre]" o "DISCOVER: [Qué quieres intentar con qué objeto]"
}}
Ejemplos: 
- {{"thought": "Tengo madera y piedra, quizás pueda hacer un hacha.", "command": "CRAFT: Axe"}}
- {{"thought": "El pozo está lejos, quizás pueda hacer un balde con este hierro.", "command": "CRAFT: Bucket"}}
"""

    try:
        async with httpx.AsyncClient(timeout=None) as client:
            response = await client.post(OLLAMA_URL, json={
                "model": MODEL_NAME,
                "messages": [{"role": "system", "content": system_prompt}],
                "stream": False,
                "options": {"temperature": 0.8, "num_ctx": 1024}
            })
            if response.status_code == 200:
                data = response.json()
                content = data.get("message", {}).get("content", "").strip()
                content_to_parse = content
                if "</think>" in content: content_to_parse = content.split("</think>")[-1].strip()
                if "```json" in content_to_parse: content_to_parse = content_to_parse.split("```json")[1].split("```")[0].strip()
                elif "```" in content_to_parse: content_to_parse = content_to_parse.split("```")[1].split("```")[0].strip()
                
                try:
                    result = json.loads(content_to_parse)
                    log_llm_interaction(agent.name, "command", system_prompt, result)
                    return result
                except json.JSONDecodeError:
                    log_llm_interaction(agent.name, "command_error", system_prompt, content)
                    return {"thought": "No se me ocurre nada.", "command": "IDLE"}
            return {"thought": "No se me ocurre nada.", "command": "IDLE"}
    except Exception:
        return {"thought": "Estoy confundido.", "command": "IDLE"}

async def generate_writing(agent, topic: str = "supervivencia") -> str:
    system_prompt = f"Eres {agent.name}. Personalidad: {', '.join(agent.personality)}. Escribe una breve reflexión o consejo sobre {topic} para las futuras generaciones. Máximo 2 frases. En español."
    
    try:
        async with httpx.AsyncClient(timeout=None) as client:
            response = await client.post(OLLAMA_URL, json={
                "model": MODEL_NAME,
                "messages": [{"role": "system", "content": system_prompt}],
                "stream": False,
                "options": {"temperature": 0.7, "num_ctx": 512}
            })
            if response.status_code == 200:
                data = response.json()
                content = data.get("message", {}).get("content", "").strip().strip('"').replace('\n', ' ')
                log_llm_interaction(agent.name, "writing", system_prompt, content)
                return content
            return "La supervivencia es dura."
    except Exception:
        return "El conocimiento se perdió en el tiempo."

async def generate_action(agent, visible_objects, nearby_agents) -> dict:
    objects_list = [f"- {obj.name} ({obj.type}) en ID: {obj.id}" for obj in visible_objects]
    agents_list = [f"- {a.name} en ID: {a.id}" for a in nearby_agents if a.id != agent.id]
    
    system_prompt = f"""Eres {agent.name}. Personalidad: {', '.join(agent.personality)}.
Tu energía es {agent.energy:.0f}/100.
Tu inventario: Madera({agent.inventory['wood']}), Piedra({agent.inventory['stone']}), Comida({agent.inventory['food']}).
Debes decidir tu próxima acción basada en tu entorno.

Responde ÚNICAMENTE con un boque JSON válido, sin texto extra, con este formato:
{{
  "action": "gather" o "build" o "talk",
  "target_id": "ID del objeto o agente al que aplicar la acción (o nulo si quieres construir)",
  "build_type": "House" o "Farm" (solo si action es build, requiere madera/piedra)
}}

Objetos a tu alrededor:
{chr(10).join(objects_list) if objects_list else 'Ninguno'}

Agentes a tu alrededor:
{chr(10).join(agents_list) if agents_list else 'Ninguno'}
"""

    try:
        async with httpx.AsyncClient(timeout=None) as client:
            response = await client.post(OLLAMA_URL, json={
                "model": MODEL_NAME,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": "¿Cuál es tu decisión en formato JSON puro?"}
                ],
                "stream": False,
                "options": {
                    "temperature": 0.5,
                    "num_ctx": 1024
                }
            })
            if response.status_code == 200:
                data = response.json()
                bot_message = data.get("message", {})
                content = bot_message.get("content", "").strip()
                
                content_to_parse = content
                # Strip out thinker blocks just in case
                if "</think>" in content:
                    content_to_parse = content.split("</think>")[-1].strip()
                
                # Simple extraction of JSON if wrapped in codeblocks
                if "```json" in content_to_parse:
                    content_to_parse = content_to_parse.split("```json")[1].split("```")[0].strip()
                elif "```" in content_to_parse:
                    content_to_parse = content_to_parse.split("```")[1].split("```")[0].strip()
                
                try:
                    action_data = json.loads(content_to_parse)
                    log_llm_interaction(agent.name, "action", system_prompt, action_data)
                    return action_data
                except json.JSONDecodeError:
                    log_llm_interaction(agent.name, "action_error", system_prompt, content)
                    return {"action": "explore", "target_id": None}
            else:
                return {"action": "explore", "target_id": None}
    except Exception as e:
        print(f"[{agent.name}] Error action: {e}")
        return {"action": "explore", "target_id": None}
