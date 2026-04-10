import asyncio
import math
import random
import uuid
import json
import os
from typing import List, Dict, Any
from .agent_model import Agent
from .llm_service import generate_dialogue, generate_action, generate_writing, generate_command

DATA_DIR = "back/data"
os.makedirs(DATA_DIR, exist_ok=True)

class EnvObject:
    def __init__(self, name: str, x: float, y: float, type: str, emoji: str, metadata: dict = None, amount: int = 10, width: int = 0, height: int = 0):
        self.id = str(uuid.uuid4())
        self.name = name
        self.x = x
        self.y = y
        self.type = type
        self.emoji = emoji
        self.amount = amount # Depletable resources
        self.width = width
        self.height = height
        self.history = [f"Spawneado el mundo: {name}"]
        self.metadata = metadata or {}

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "x": self.x,
            "y": self.y,
            "type": self.type,
            "emoji": self.emoji,
            "amount": self.amount,
            "width": self.width,
            "height": self.height,
            "history": self.history,
            "metadata": self.metadata
        }
    
    @classmethod
    def from_dict(cls, data):
        obj = cls(
            data["name"], data["x"], data["y"], data["type"], data["emoji"], 
            data.get("metadata"), data.get("amount", 10),
            data.get("width", 0), data.get("height", 0)
        )
        obj.id = data.get("id", str(uuid.uuid4()))
        obj.history = data.get("history", [])
        return obj

class WorldEngine:
    def __init__(self, size_x: int = 2000, size_y: int = 2000):
        self.size_x = size_x
        self.size_y = size_y
        self.agents: List[Agent] = []
        self.env_objects: List[EnvObject] = []
        self.running = False
        self.time_scale = 1.0 # For speed control
        self.chat_logs = []
        self.available_names = [
            "Ada", "Ali", "Amy", "Ash", "Ava", "Axl", "Bao", "Bea", "Bix", "Bo",
            "Cai", "Cal", "Cam", "Che", "Cid", "Cy", "Dax", "Dex", "Dot", "Dru",
            "Ed", "Eva", "Eve", "Ezra", "Fay", "Finn", "Fox", "Flo", "Flynn", "Fae",
            "Gage", "Gem", "Gia", "Gil", "Guy", "Hal", "Hux", "Hugo", "Hank", "Hali",
            "Ida", "Ike", "Ila", "Iva", "Jax", "Jay", "Jed", "Jet", "Joy", "Judd",
            "Kai", "Kip", "Kit", "Knox", "Koa", "Lea", "Leo", "Levi", "Lia", "Liv",
            "Lou", "Luc", "Lux", "Mac", "Mae", "Max", "Mia", "Moe", "Mya", "Nash",
            "Ned", "Neo", "Nia", "Noa", "Nya", "Oak", "Oda", "Ola", "Oma", "Pam",
            "Pax", "Paz", "Poe", "Pip", "Rae", "Ray", "Red", "Rex", "Rey", "Rio",
            "Roa", "Roy", "Rue", "Sam", "Shay", "Sia", "Sky", "Sly", "Sue", "Syd",
            "Tad", "Taj", "Teo", "Tex", "Tia", "Tom", "Ty", "Uma", "Val", "Van",
            "Vix", "Wes", "Wyn", "Zac", "Zan", "Zed", "Zeke", "Zen", "Zev", "Ziv"
        ]
        self.historical_best = [] 
        self.global_writings = [] 
        self.current_generation = 0
        self.game_time = 0
        
        # Biomes Configuration
        self.biomes_config = {
            "Pradera": {"color": "#2d6a4f", "secondary": "#1b4332", "effect": "normal"},
            "Desierto": {"color": "#e9c46a", "secondary": "#bc6c25", "effect": "heat"},
            "Tundra": {"color": "#a2d2ff", "secondary": "#e0fbfc", "effect": "cold"},
            "Bosque Oscuro": {"color": "#1b4332", "secondary": "#081c15", "effect": "dark"}
        }
        
        # Voronoi Seeds for irregular biomes
        self.biome_seeds = []
        self._generate_biome_seeds()
        
        # Dynamic Data
        self.recipes = {
            "Axe": {"wood": 3, "stone": 2},
            "Pickaxe": {"wood": 2, "stone": 3},
            "Spear": {"wood": 4},
            "Bucket": {"iron": 5},
            "Gold Ring": {"gold": 3},
            "Iron Ingot": {"stone": 5, "wood": 2},
            "Hammer": {"wood": 2, "iron": 2},
            "Sword": {"iron": 5, "wood": 1},
            "Shield": {"wood": 10, "iron": 2},
            "Compass": {"iron": 3, "gold": 1},
            "Lantern": {"iron": 2, "resin": 2}
        }
        self.discovery_table = {
            "Apple Tree": ["Food", "Wood"],
            "Pine Tree": ["Wood", "Resin"],
            "Stone Rock": ["Stone", "Iron"],
            "Iron Ore": ["Iron", "Gold"],
            "Gold Vein": ["Gold", "Gemstone"],
            "Crystal Cave": ["Gemstone", "Mana"],
            "Berry Bush": ["Food", "Seed"],
            "Clay Pit": ["Clay", "Stone"],
        }
        
        self.load_state()
        if not self.agents:
            self._initialize_objects()
            self._initialize_agents()

    def save_state(self):
        state = {
            "agents": [a.to_dict() for a in self.agents],
            "env_objects": [o.to_dict() for o in self.env_objects],
            "recipes": self.recipes,
            "discovery_table": self.discovery_table,
            "current_generation": self.current_generation,
            "game_time": self.game_time,
            "time_scale": self.time_scale,
            "historical_best": self.historical_best,
            "biome_seeds": self.biome_seeds
        }
        with open(os.path.join(DATA_DIR, "world_state.json"), "w") as f:
            json.dump(state, f, indent=2)

    def load_state(self):
        path = os.path.join(DATA_DIR, "world_state.json")
        if not os.path.exists(path):
            return
        
        try:
            with open(path, "r") as f:
                state = json.load(f)
                
            self.recipes = state.get("recipes", self.recipes)
            self.discovery_table = state.get("discovery_table", self.discovery_table)
            self.current_generation = state.get("current_generation", 0)
            self.game_time = state.get("game_time", 0)
            self.time_scale = state.get("time_scale", 1.0)
            self.historical_best = state.get("historical_best", [])
            self.biome_seeds = state.get("biome_seeds", self.biome_seeds)
            
            self.env_objects = [EnvObject.from_dict(o) for o in state.get("env_objects", [])]
            
            for a_data in state.get("agents", []):
                agent = Agent(a_data["name"], a_data["x"], a_data["y"], a_data["dna"], a_data["generation"])
                agent.id = a_data.get("id", str(uuid.uuid4()))
                agent.energy = a_data.get("energy", 100)
                agent.inventory = a_data.get("inventory", {})
                agent.tools = a_data.get("tools", [])
                agent.discovered_recipes = a_data.get("discovered_recipes", [])
                agent.needs = a_data.get("needs", agent.needs)
                agent.age = a_data.get("age", 0)
                agent.fitness = a_data.get("fitness", 0)
                agent.xp = a_data.get("xp", 0)
                agent.level = a_data.get("level", 1)
                agent.memories = a_data.get("memories", [])
                agent.personality = a_data.get("personality", agent.personality)
                self.agents.append(agent)
                
        except Exception as e:
            print(f"Error loading state: {e}")

    def _generate_biome_seeds(self):
        # Generate 15 random seeds for biomes
        biome_types = list(self.biomes_config.keys())
        for _ in range(15):
            self.biome_seeds.append({
                "x": random.randint(0, self.size_x),
                "y": random.randint(0, self.size_y),
                "type": random.choice(biome_types)
            })

    def get_biome_at(self, x, y):
        # Closest seed determines biome (Voronoi)
        best_dist = float('inf')
        best_type = "Pradera"
        for seed in self.biome_seeds:
            dist = math.hypot(x - seed["x"], y - seed["y"])
            if dist < best_dist:
                best_dist = dist
                best_type = seed["type"]
        return best_type

    def _initialize_objects(self):
        self.env_objects = []
        
        # Add some "Walls" and "Mountains" for relief
        for _ in range(15):
            w, h = (random.randint(150, 400), 30) if random.random() > 0.5 else (30, random.randint(150, 400))
            self.env_objects.append(EnvObject("Wall", random.randint(200, self.size_x-200), random.randint(200, self.size_y-200), "structure", "🧱", width=w, height=h))

        for _ in range(12):
            self.env_objects.append(EnvObject("Mountain", random.randint(100, self.size_x-100), random.randint(100, self.size_y-100), "terrain", "⛰️", width=random.randint(100, 200), height=random.randint(100, 200)))

        # Expanded resources per biome
        resource_map = {
            "Pradera": [
                ("Apple Tree", "🍎", 20), ("Berry Bush", "🫐", 15), ("Stone Rock", "🪨", 20), 
                ("Tall Grass", "🌿", 5), ("Flower", "🌻", 2), ("Wheat", "🌾", 15),
                ("Sheep", "🐑", 10), ("Beehive", "🐝", 8), ("Cow", "🐄", 20)
            ],
            "Desierto": [
                ("Cactus", "🌵", 10), ("Oasis", "🏝️", 999), ("Clay Pit", "🏺", 20), 
                ("Palm Tree", "🌴", 15), ("Sand Dune", "🏜️", 0), ("Scorpion", "🦂", 5),
                ("Ancient Bones", "🦴", 10), ("Gold Mine", "🪙", 20), ("Dry Bush", "🎋", 5)
            ],
            "Tundra": [
                ("Pine Tree", "🌲", 25), ("Snow Rock", "❄️", 20), ("Frozen Pond", "🧊", 999), 
                ("Ice Spike", "💎", 5), ("Polar Bear", "🐻\u200d❄️", 10), ("Ice Crystal", "🔮", 15),
                ("Snowman", "☃️", 5), ("Igloo", "🛖", 999)
            ],
            "Bosque Oscuro": [
                ("Dead Tree", "🪵", 15), ("Mushrooms", "🍄", 10), ("Obelisk", "🗿", 0), 
                ("Dark Crystal", "🔮", 10), ("Thorns", "🥀", 5), ("Ghost", "👻", 0),
                ("Witch Cauldron", "🧪", 10), ("Spider Web", "🕸️", 5), ("Cursed Totem", "🗿", 0)
            ]
        }

        # Distribute 500 resources using get_biome_at(x, y) for high density
        for _ in range(500):
            rx = random.randint(50, self.size_x - 50)
            ry = random.randint(50, self.size_y - 50)
            biome_type = self.get_biome_at(rx, ry)
            
            options = resource_map.get(biome_type, [("Stone Rock", "🪨", 20)])
            name, emoji, amount = random.choice(options)
            self.env_objects.append(EnvObject(name, rx, ry, "resource", emoji, amount=amount))

        # Add more global survival objects
        for _ in range(12):
            self.env_objects.append(EnvObject("Water Well", random.randint(50, self.size_x-50), random.randint(50, self.size_y-50), "resource", "🚰", amount=999))
            self.env_objects.append(EnvObject("Campfire", random.randint(50, self.size_x-50), random.randint(50, self.size_y-50), "resource", "🔥", amount=999))

    def _initialize_agents(self):
        for i in range(15):
            name = random.choice(self.available_names)
            agent = Agent(
                name=name, 
                x=random.randint(100, self.size_x - 100),
                y=random.randint(100, self.size_y - 100)
            )
            self.agents.append(agent)

    def reset_world(self):
        self.agents = []
        self.env_objects = []
        self.chat_logs = []
        self.current_generation = 0
        self.game_time = 0
        self.historical_best = []
        self.global_writings = []
        
        # Clear the save file if it exists
        path = os.path.join(DATA_DIR, "world_state.json")
        if os.path.exists(path):
            os.remove(path)
            
        self._initialize_objects()
        self._initialize_agents()
        self.save_state()
        return {"status": "success", "message": "Mundo reiniciado correctamente"}

    async def start(self):
        self.running = True
        asyncio.create_task(self._loop())

    def stop(self):
        self.running = False

    async def _loop(self):
        tick_count = 0
        while self.running:
            # Run multiple updates per sleep if time_scale > 1
            updates = max(1, int(self.time_scale))
            sleep_time = 0.05 / (self.time_scale if self.time_scale <= 1 else 1)
            
            for _ in range(updates):
                self.update_world()
                tick_count += 1
                self.game_time += 1
                if tick_count % 100 == 0:
                    self.save_state()
            
            await asyncio.sleep(sleep_time)

    def update_world(self):
        # Move and update agents
        dead_agents = []
        for agent in self.agents:
            # Update current biome
            agent.biome = self.get_biome_at(agent.x, agent.y)
            
            # Deplete needs (passive) - 100 is good, 0 is bad
            # Reduce depletion by 50% when talking, interacting, thinking or writing
            multiplier = 0.5 if agent.status in ["talking", "interacting", "thinking_action", "writing"] else 1.0
            
            agent.needs["hunger"] = max(0, agent.needs["hunger"] - 0.05 * multiplier)
            agent.needs["thirst"] = max(0, agent.needs["thirst"] - 0.08 * multiplier)
            agent.needs["social"] = max(0, agent.needs["social"] - 0.03 * multiplier)
            agent.needs["rest"] = max(0, agent.needs["rest"] - 0.02 * multiplier)
            
            # Passive energy drain increases with age and unmet needs
            drain = agent.dna["energy_loss_rate"]
            if agent.needs["hunger"] < 20: drain *= 2
            if agent.needs["thirst"] < 20: drain *= 3
            
            agent.energy -= drain * multiplier
            
            agent.age += 1
            
            # Life/Death Logic
            if agent.energy <= 0 or agent.age >= agent.max_age or agent.needs["hunger"] <= 0 or agent.needs["thirst"] <= 0:
                dead_agents.append(agent)
                continue
            
            if agent.status in ["talking", "interacting", "sleeping", "building", "thinking_action", "writing"]:
                continue

            # Algorithmic Action Controller
            if agent.status == "idle":
                 self.handle_agent_decision_algorithmic(agent)
                 continue

            # Movement
            if agent.status == "moving":
                dx = agent.dest_x - agent.x
                dy = agent.dest_y - agent.y
                dist = math.hypot(dx, dy)
                if dist > agent.speed:
                    agent.x += (dx / dist) * agent.speed
                    agent.y += (dy / dist) * agent.speed
                else:
                    agent.status = "idle"

        # Handle death and record history
        for agent in dead_agents:
            if agent in self.agents:
                reason = "deshidratación" if agent.needs["thirst"] <= 0 else ("hambre" if agent.needs["hunger"] <= 0 else ("vejez" if agent.age >= agent.max_age else "agotamiento"))
                self.chat_logs.append({"type": "death", "time": self.game_time, "agent": agent.name, "text": f"ha muerto por {reason}."})
                
                # Save to historical pool if they were successful
                if agent.fitness > 10:
                    self.historical_best.append({
                        "dna": agent.dna,
                        "fitness": agent.fitness,
                        "name": agent.name,
                        "generation": agent.generation
                    })
                    # Limit historical best pool size
                    self.historical_best = sorted(self.historical_best, key=lambda x: x["fitness"], reverse=True)[:10]
                
                self.agents.remove(agent)
                
                if agent.fitness > 20:
                     new_grave = EnvObject(f"Tumba de {agent.name}", agent.x, agent.y, "memorial", "🪦")
                     new_grave.history.append(f"Aquí yace {agent.name}, un gran pionero.")
                     self.env_objects.append(new_grave)

        # Trigger Repopulation if everyone is dying
        if len(self.agents) < 2 and self.running:
             self.repopulate()

        # Process collisions purely to trigger intended actions
        for agent in self.agents:
            if getattr(agent, "current_intent", None) and agent.status == "moving":
                intent = agent.current_intent
                target_id = intent.get("target_id")
                action_type = intent.get("action")
                
                # Reached object?
                if target_id and action_type in ["gather", "read"]:
                    target_obj = next((o for o in self.env_objects if o.id == target_id), None)
                    if target_obj:
                        dist = math.hypot(agent.x - target_obj.x, agent.y - target_obj.y)
                        if dist < 35:
                            if action_type == "gather":
                                asyncio.create_task(self.handle_object_interaction(agent, target_obj))
                            elif action_type == "read":
                                asyncio.create_task(self.handle_reading(agent, target_obj))
                            
                # Reached agent?
                elif target_id and action_type in ["talk", "reproduce"]:
                    target_agent = next((a for a in self.agents if a.id == target_id), None)
                    if target_agent and target_agent.status not in ["talking", "building", "writing"]:
                        dist = math.hypot(agent.x - target_agent.x, agent.y - target_agent.y)
                        if dist < 45:
                            if action_type == "talk":
                                asyncio.create_task(self.handle_agent_interaction(agent, target_agent))
                            elif action_type == "reproduce":
                                asyncio.create_task(self.handle_reproduction(agent, target_agent))

    def repopulate(self):
        self.current_generation += 1
        self.chat_logs.append({"type": "birth", "time": self.game_time, "agent": "Sistema", "text": f"Una nueva generación (G{self.current_generation}) está surgiendo a partir de los ancestros más fuertes."})
        
        # Gather all knowledge from previous generation
        available_knowledge = [o.metadata.get("content") for o in self.env_objects if o.type == "knowledge"]
        
        count = 6 - len(self.agents)
        for i in range(count):
            # Seed from historical best or random
            parent_dna = None
            if self.historical_best:
                # Weighted choice based on fitness? For now just pick one from top 5
                parent_data = random.choice(self.historical_best[:5])
                parent_dna = parent_data["dna"].copy()
            
            new_agent = Agent(
                name=random.choice(self.available_names),
                x=random.randint(50, self.size_x - 50),
                y=random.randint(50, self.size_y - 50),
                dna=parent_dna,
                generation=self.current_generation
            )
            
            # Mutate for variety
            if parent_dna:
                new_agent.dna = new_agent.mutate()
            
            # Inherit knowledge as starting memories
            if available_knowledge:
                for k in random.sample(available_knowledge, min(len(available_knowledge), 3)):
                    new_agent.add_memory("knowledge", f"Heredado: {k}")

            self.agents.append(new_agent)

    def handle_agent_decision_algorithmic(self, agent: Agent):
        # Decision based on DNA and state
        # Weights for different actions
        weights = {
            "gather_food": 0,
            "gather_water": 0,
            "socialize": agent.dna["sociability"] * 0.3,
            "build": agent.dna["work_ethic"] * 0.2,
            "explore": agent.dna["curiosity"] * 0.3,
            "reproduce": agent.dna["libido"] * 0.5,
            "write": 0.05,
            "brainstorm": agent.dna["curiosity"] * 0.8
        }
        
        # URGENT: Hunger and Thirst are survival priorities
        if agent.needs["thirst"] < 60:
            weights["gather_water"] += (60 - agent.needs["thirst"]) * 0.5
        if agent.needs["hunger"] < 50:
            weights["gather_food"] += (50 - agent.needs["hunger"]) * 0.4
            
        # Critical priority
        if agent.needs["thirst"] < 20: weights["gather_water"] += 20.0
        if agent.needs["hunger"] < 15: weights["gather_food"] += 15.0
            
        # Social need
        if agent.needs["social"] < 30: weights["socialize"] += 2.0
            
        # Libido only if well fed, hydrated and has food reserves
        if agent.energy > 60 and agent.needs["hunger"] > 70 and agent.inventory["food"] >= 15:
            weights["reproduce"] += agent.dna["libido"] * 8.0

        # Choose best action
        best_action = max(weights, key=weights.get)
        
        if best_action == "gather_food":
            food_sources = [o for o in self.env_objects if o.name in ["Apple Tree", "Farm"]]
            if food_sources:
                target = min(food_sources, key=lambda o: math.hypot(agent.x - o.x, agent.y - o.y))
                agent.current_intent = {"action": "gather", "target_id": target.id}
                agent.dest_x, agent.dest_y = target.x, target.y
                agent.status = "moving"
            else:
                best_action = "explore"

        elif best_action == "gather_water":
             wells = [o for o in self.env_objects if o.name == "Water Well"]
             if wells:
                 target = min(wells, key=lambda o: math.hypot(agent.x - o.x, agent.y - o.y))
                 agent.current_intent = {"action": "gather", "target_id": target.id}
                 agent.dest_x, agent.dest_y = target.x, target.y
                 agent.status = "moving"
             else:
                 best_action = "explore"

        elif best_action == "socialize":
             nearby_agents = [a for a in self.agents if a.id != agent.id and a.status == "idle"]
             if nearby_agents:
                 target = min(nearby_agents, key=lambda a: math.hypot(agent.x - a.x, agent.y - a.y))
                 agent.current_intent = {"action": "talk", "target_id": target.id}
                 agent.dest_x, agent.dest_y = target.x, target.y
                 agent.status = "moving"
             else:
                 best_action = "explore"

        elif best_action == "reproduce":
             nearby_agents = [a for a in self.agents if a.id != agent.id and a.status == "idle" and a.energy > 50]
             if nearby_agents:
                 target = min(nearby_agents, key=lambda a: math.hypot(agent.x - a.x, agent.y - a.y))
                 agent.current_intent = {"action": "reproduce", "target_id": target.id}
                 agent.dest_x, agent.dest_y = target.x, target.y
                 agent.status = "moving"
             else:
                 best_action = "explore"

        elif best_action == "build":
            # Decide what to build
            build_type = "House" if agent.inventory["wood"] >= 5 else "Farm"
            asyncio.create_task(self.handle_building(agent, build_type))

        elif best_action == "write":
             if agent.dna["cognitive_level"] >= 0.5:
                asyncio.create_task(self.handle_writing(agent))
             else:
                self.chat_logs.append({"type": "thinking", "time": self.game_time, "agent": agent.name, "text": "trata de escribir pero no sabe cómo."})

        elif best_action == "brainstorm":
             if agent.dna["cognitive_level"] >= 0.3:
                asyncio.create_task(self.handle_brainstorm(agent))
             else:
                asyncio.create_task(self.handle_random_discovery(agent))

        elif best_action == "explore":
             agent.dest_x = max(20, min(self.size_x - 20, agent.x + random.randint(-150, 150)))
             agent.dest_y = max(20, min(self.size_y - 20, agent.y + random.randint(-150, 150)))
             agent.status = "moving"
             agent.current_intent = None

    async def handle_random_discovery(self, agent: Agent):
        # Purely algorithmic discovery
        agent.status = "thinking_action"
        await asyncio.sleep(1)
        
        nearby = [o for o in self.env_objects if math.hypot(agent.x - o.x, agent.y - o.y) < 100]
        if nearby and random.random() < 0.2:
            obj = random.choice(nearby)
            drops = self.discovery_table.get(obj.name, ["Piedra"])
            found = random.choice(drops)
            self.chat_logs.append({"type": "knowledge", "time": self.game_time, "agent": agent.name, "text": f"por accidente descubrió {found} en {obj.name}!"})
            res_key = found.lower()
            if res_key in agent.inventory:
                agent.inventory[res_key] += 1
            agent.gain_xp(10)
        
        agent.status = "idle"

        # Check if there's knowledge nearby to read (high curiosity increases this)
        nearby_knowledge = [o for o in self.env_objects if o.type == "knowledge" and math.hypot(agent.x - o.x, agent.y - o.y) < 150]
        if nearby_knowledge and random.random() < agent.dna["curiosity"]:
             target = random.choice(nearby_knowledge)
             agent.current_intent = {"action": "read", "target_id": target.id}
             agent.dest_x, agent.dest_y = target.x, target.y
             agent.status = "moving"
             return # Skip explore

        if agent.status == "idle":
             agent.dest_x = max(20, min(self.size_x - 20, agent.x + random.randint(-150, 150)))
             agent.dest_y = max(20, min(self.size_y - 20, agent.y + random.randint(-150, 150)))
             agent.status = "moving"
             agent.current_intent = None

    async def handle_brainstorm(self, agent: Agent):
        agent.status = "thinking_action"
        
        # Gather environment info
        nearby_objs = [o.name for o in self.env_objects if math.hypot(agent.x - o.x, agent.y - o.y) < 200]
        inv_str = ", ".join([f"{k}: {v}" for k, v in agent.inventory.items() if v > 0]) or "Vacío"
        surr_str = ", ".join(set(nearby_objs)) or "Campo abierto"
        
        self.chat_logs.append({"type": "thinking", "time": self.game_time, "agent": agent.name, "text": "está analizando su entorno y recursos..."})
        
        result = await generate_command(agent, inv_str, surr_str)
        thought = result.get("thought", "No sé qué hacer.")
        command = result.get("command", "IDLE").upper()
        
        # Update thought in logs
        if self.chat_logs and self.chat_logs[-1]["type"] == "thinking" and self.chat_logs[-1]["agent"] == agent.name:
            self.chat_logs[-1]["text"] = thought
            
        await asyncio.sleep(2)
        await self.handle_command(agent, command)
        agent.status = "idle"

    async def handle_command(self, agent: Agent, command: str):
        if command.startswith("CRAFT:"):
            item = command.replace("CRAFT:", "").strip()
            recipe = self.recipes.get(item)
            if recipe:
                # Check resources
                can_craft = True
                for res, amt in recipe.items():
                    if agent.inventory.get(res, 0) < amt:
                        can_craft = False
                        break
                
                if can_craft:
                    for res, amt in recipe.items():
                        agent.inventory[res] -= amt
                    
                    if item not in agent.tools:
                        agent.tools.append(item)
                    if item not in agent.discovered_recipes:
                        agent.discovered_recipes.append(item)
                        
                    msg = f"ha crafteado un {item} con éxito!"
                    self.chat_logs.append({"type": "action", "time": self.game_time, "agent": agent.name, "text": msg})
                    agent.fitness += 5
                    agent.gain_xp(50)
                else:
                    self.chat_logs.append({"type": "thinking", "time": self.game_time, "agent": agent.name, "text": f"intentó craftear {item} pero le faltan recursos."})
            else:
                self.chat_logs.append({"type": "thinking", "time": self.game_time, "agent": agent.name, "text": f"intentó craftear {item} pero no sabe cómo."})

        elif command.startswith("DISCOVER:"):
             target_name = command.replace("DISCOVER:", "").strip()
             nearby = [o for o in self.env_objects if o.name in target_name and math.hypot(agent.x - o.x, agent.y - o.y) < 100]
             if nearby:
                 obj = nearby[0]
                 possible_drops = self.discovery_table.get(obj.name, ["Piedra"])
                 found = random.choice(possible_drops)
                 msg = f"ha descubierto cómo obtener {found} de {obj.name}!"
                 self.chat_logs.append({"type": "knowledge", "time": self.game_time, "agent": agent.name, "text": msg})
                 agent.fitness += 3
                 agent.gain_xp(30)
                 res_key = found.lower()
                 if res_key in agent.inventory:
                     agent.inventory[res_key] += 1
             else:
                 self.chat_logs.append({"type": "thinking", "time": self.game_time, "agent": agent.name, "text": f"intentó investigar {target_name} pero no hay nada cerca."})

        elif command.startswith("BUILD:"):
             structure = command.replace("BUILD:", "").strip()
             await self.handle_building(agent, structure)

    async def handle_reproduction(self, agent_a: Agent, agent_b: Agent):
        # Strict requirement: 10 food and 60 energy
        if agent_a.inventory["food"] < 10 or agent_b.inventory["food"] < 10 or agent_a.energy < 60 or agent_b.energy < 60:
            agent_a.status = "idle"
            agent_b.status = "idle"
            return

        agent_a.status = "interacting"
        agent_b.status = "interacting"
        
        self.chat_logs.append({"type": "birth", "time": self.game_time, "agent": f"{agent_a.name} y {agent_b.name}", "text": "están fundando una nueva generación."})
        await asyncio.sleep(3)
        
        # Create offspring
        child_dna = {}
        for key in agent_a.dna:
            child_dna[key] = (agent_a.dna[key] + agent_b.dna[key]) / 2
        
        # Mutation
        if random.random() < 0.2:
             mutated_key = random.choice(list(child_dna.keys()))
             child_dna[mutated_key] += random.uniform(-0.2, 0.2)
             child_dna[mutated_key] = max(0, min(2.0 if mutated_key == "strength" else 1.0, child_dna[mutated_key]))

        child_name = random.choice(self.available_names) + " Jr."
        child = Agent(name=child_name, x=agent_a.x, y=agent_a.y, dna=child_dna, generation=max(agent_a.generation, agent_b.generation) + 1)
        
        self.agents.append(child)
        agent_a.energy -= 40
        agent_b.energy -= 40
        agent_a.inventory["food"] -= 10
        agent_b.inventory["food"] -= 10
        agent_a.fitness += 15
        agent_b.fitness += 15
        agent_a.gain_xp(100)
        agent_b.gain_xp(100)
        agent_a.needs["social"] = 100
        agent_b.needs["social"] = 100
        
        agent_a.status = "idle"
        agent_b.status = "idle"

    async def handle_writing(self, agent: Agent):
        agent.status = "writing"
        topic = "supervivencia"
        if agent.inventory["food"] > 10: topic = "agricultura"
        if agent.inventory["wood"] > 10: topic = "construcción"
        
        content = await generate_writing(agent, topic)
        
        new_book = EnvObject(f"Escrito de {agent.name}", agent.x, agent.y, "knowledge", "📜", {"content": content, "author": agent.name})
        self.env_objects.append(new_book)
        
        self.chat_logs.append({"type": "knowledge", "time": self.game_time, "agent": agent.name, "text": f"ha dejado un escrito sobre {topic}."})
        agent.gain_xp(40)
        await asyncio.sleep(2)
        agent.status = "idle"

    async def handle_reading(self, agent: Agent, book: EnvObject):
        agent.status = "interacting"
        content = book.metadata.get("content", "Las letras están borrosas.")
        author = book.metadata.get("author", "Alguien")
        
        self.chat_logs.append({"type": "knowledge", "time": self.game_time, "agent": agent.name, "text": f"lee el escrito de {author}: '{content}'"})
        
        # Reading gives a small boost or changes dna slightly? 
        # For now, just a memory and fitness
        agent.add_memory("knowledge", f"Leí de {author}: {content}")
        agent.fitness += 1
        agent.gain_xp(20)
        
        await asyncio.sleep(3)
        agent.status = "idle"

    async def handle_building(self, agent: Agent, build_type: str = "House"):
        agent.status = "building"
        
        if build_type == "House":
            agent.inventory["wood"] -= 5
            agent.inventory["stone"] -= 5
            agent.energy -= 10 / agent.dna["strength"]
            action_text = "ha construido una Casa."
            emoji = "🛖"
        elif build_type == "Farm":
            agent.inventory["wood"] -= 3
            agent.inventory["food"] -= 1
            agent.energy -= 15 / agent.dna["strength"]
            action_text = "ha construido una Granja."
            emoji = "🌾"
        else:
            action_text = f"ha construido {build_type}."
            emoji = "🏗️"

        agent.add_memory("action", action_text)
        agent.fitness += 2
        agent.gain_xp(50)
        self.chat_logs.append({"type": "build", "time": self.game_time, "agent": agent.name, "text": action_text})
        
        await asyncio.sleep(4) # Building time
        
        new_building = EnvObject(f"{build_type} de {agent.name}", agent.x, agent.y, "building", emoji)
        new_building.history.append(f"Construido por {agent.name}.")
        self.env_objects.append(new_building)
        
        agent.status = "idle"
        agent.current_intent = None

    async def handle_object_interaction(self, agent: Agent, obj: EnvObject):
        agent.status = "interacting"
        action_text = f"ha interactuado con {obj.name}"
        
        # Adjust yield based on strength and tools
        strength_mod = agent.dna["strength"]
        has_axe = "Axe" in agent.tools
        has_pickaxe = "Pickaxe" in agent.tools
        
        if obj.name == "Campfire":
            action_text = "se ha calentado en la Fogata."
            agent.energy = min(100, agent.energy + 15)
            agent.needs["rest"] = min(100, agent.needs["rest"] + 20)
            obj.history.append(f"{agent.name} se calentó aquí.")
        elif obj.name == "Water Well":
            action_text = "ha bebido agua del Pozo."
            agent.energy = min(100, agent.energy + 5)
            agent.needs["thirst"] = 100
            obj.history.append(f"{agent.name} bebió agua.")
        elif obj.name == "Apple Tree":
            action_text = "ha recolectado manzanas."
            yield_mod = 2 * strength_mod * (2 if has_axe else 1)
            agent.inventory["food"] += int(yield_mod)
            agent.needs["hunger"] = min(100, agent.needs["hunger"] + 40)
            agent.energy -= 2
            obj.history.append(f"{agent.name} recolectó comida.")
            agent.fitness += 1
            agent.gain_xp(10)
        elif obj.name == "Pine Tree":
            action_text = "ha talado madera."
            yield_mod = 2 * strength_mod * (2 if has_axe else 1)
            agent.inventory["wood"] += int(yield_mod)
            agent.energy -= 5 / strength_mod
            obj.history.append(f"{agent.name} taló madera.")
            agent.fitness += 1
            agent.gain_xp(10)
        elif obj.name == "Stone Rock":
            action_text = "ha minado piedra."
            yield_mod = 2 * strength_mod * (2 if has_pickaxe else 1)
            agent.inventory["stone"] += int(yield_mod)
            if has_pickaxe or random.random() < 0.2:
                agent.inventory["iron"] += 1
            agent.energy -= 5 / strength_mod
            obj.history.append(f"{agent.name} picó piedra.")
            agent.fitness += 1
            agent.gain_xp(10)
        elif obj.name == "Iron Ore":
            action_text = "ha picado veta de hierro."
            yield_mod = 1 * strength_mod * (2 if has_pickaxe else 1)
            agent.inventory["iron"] += int(yield_mod)
            if has_pickaxe and random.random() < 0.3:
                agent.inventory["gold"] += 1
            agent.energy -= 7 / strength_mod
            obj.history.append(f"{agent.name} minó hierro.")
            agent.fitness += 2
            agent.gain_xp(15)
        elif "House" in obj.name:
            action_text = f"descansó en {obj.name}."
            agent.energy = min(100, agent.energy + 40)
            agent.needs["rest"] = 100
            obj.history.append(f"{agent.name} descansó aquí.")
        elif obj.name == "Gold Vein":
            action_text = "ha minado oro."
            yield_mod = 1 * strength_mod * (2 if has_pickaxe else 1)
            agent.inventory["gold"] += int(yield_mod)
            if random.random() < 0.2:
                agent.inventory["gemstone"] += 1
            agent.energy -= 10 / strength_mod
            obj.history.append(f"{agent.name} minó oro.")
            agent.fitness += 3
            agent.gain_xp(20)
        elif obj.name == "Berry Bush":
            action_text = "ha recolectado bayas."
            agent.inventory["food"] += 5
            if random.random() < 0.3:
                agent.inventory["seed"] += 1
            agent.needs["hunger"] = min(100, agent.needs["hunger"] + 20)
            agent.energy -= 1
            obj.history.append(f"{agent.name} recolectó bayas.")
            agent.fitness += 1
            agent.gain_xp(5)
        elif obj.name == "Clay Pit":
            action_text = "ha extraído arcilla."
            agent.inventory["clay"] += 3 * strength_mod
            agent.energy -= 5 / strength_mod
            obj.history.append(f"{agent.name} extrajo arcilla.")
            agent.fitness += 1
            agent.gain_xp(8)
        elif obj.name == "Wheat":
            action_text = "ha cosechado trigo."
            agent.inventory["food"] += 3
            agent.needs["hunger"] = min(100, agent.needs["hunger"] + 15)
            obj.history.append(f"{agent.name} cosechó trigo.")
            agent.fitness += 1
            agent.gain_xp(5)
        elif obj.name == "Sheep":
            action_text = "ha esquilado una oveja."
            agent.inventory["resin"] += 2 # Representing wool/materials
            agent.energy -= 2
            obj.history.append(f"{agent.name} esquiló una oveja.")
            agent.fitness += 1
        elif obj.name == "Beehive":
            action_text = "ha recolectado miel."
            agent.inventory["food"] += 5
            agent.needs["hunger"] = min(100, agent.needs["hunger"] + 25)
            agent.energy -= 5 # Risky
            obj.history.append(f"{agent.name} recolectó miel.")
            agent.fitness += 2
        elif obj.name == "Cow":
            action_text = "ha ordeñado una vaca."
            agent.inventory["food"] += 4
            agent.needs["hunger"] = min(100, agent.needs["hunger"] + 20)
            obj.history.append(f"{agent.name} ordeñó una vaca.")
            agent.fitness += 1
        elif obj.name == "Gold Mine":
            action_text = "ha extraído pepitas de oro."
            agent.inventory["gold"] += 2
            agent.energy -= 8 / strength_mod
            obj.history.append(f"{agent.name} minó oro.")
            agent.fitness += 3
        elif obj.name == "Ice Crystal":
            action_text = "ha recolectado cristales de hielo."
            agent.inventory["gemstone"] += 1
            if random.random() < 0.3: agent.inventory["mana"] += 1
            agent.energy -= 5
            obj.history.append(f"{agent.name} recolectó cristales.")
            agent.fitness += 2
        elif obj.name == "Igloo":
            action_text = "se ha refugiado en el iglú."
            agent.energy = min(100, agent.energy + 25)
            agent.needs["rest"] = 100
            obj.history.append(f"{agent.name} descansó en el iglú.")
        elif obj.name == "Witch Cauldron":
            action_text = "ha bebido de un caldero misterioso."
            if random.random() > 0.3:
                agent.energy = 100
                agent.inventory["mana"] += 2
                action_text += " ¡Se siente poderoso!"
            else:
                agent.energy -= 20
                action_text += " ... No se siente muy bien."
            obj.history.append(f"{agent.name} bebió de la poción.")
            agent.fitness += 2
        elif obj.name == "Cactus":
            action_text = "ha extraído agua de un Cactus."
            agent.needs["thirst"] = min(100, agent.needs["thirst"] + 20)
            agent.energy -= 2
            obj.history.append(f"{agent.name} bebió del cactus.")
            agent.fitness += 1
        elif obj.name == "Oasis":
            action_text = "ha descansado en el Oasis."
            agent.needs["thirst"] = 100
            agent.needs["rest"] = min(100, agent.needs["rest"] + 10)
            agent.energy = min(100, agent.energy + 5)
            obj.history.append(f"{agent.name} usó el oasis.")
            agent.fitness += 1
        elif obj.name == "Snow Rock":
            action_text = "ha picado una Roca Nevada."
            agent.inventory["stone"] += int(2 * strength_mod)
            if random.random() < 0.3:
                agent.inventory["iron"] += 1
            agent.energy -= 6 / strength_mod
            obj.history.append(f"{agent.name} picó nieve y roca.")
            agent.fitness += 1
            agent.gain_xp(10)
        elif obj.name == "Dead Tree":
            action_text = "ha recolectado leña seca."
            agent.inventory["wood"] += int(1 * strength_mod)
            agent.energy -= 3 / strength_mod
            obj.history.append(f"{agent.name} recogió madera muerta.")
            agent.fitness += 1
            agent.gain_xp(10)
        elif obj.name == "Mushrooms":
            action_text = "ha recolectado setas."
            agent.inventory["food"] += 3
            agent.needs["hunger"] = min(100, agent.needs["hunger"] + 15)
            agent.energy -= 1
            obj.history.append(f"{agent.name} comió setas.")
            agent.fitness += 1
            agent.gain_xp(5)
        elif obj.name == "Crystal Cave":
            action_text = "ha explorado la cueva de cristal."
            agent.inventory["gemstone"] += 1
            if random.random() < 0.1:
                agent.inventory["mana"] += 1
            agent.energy -= 15 / strength_mod
            obj.history.append(f"{agent.name} exploró cristales.")
            agent.fitness += 5
            agent.gain_xp(30)
        elif obj.name in ["Wall", "Mountain"]:
            action_text = f"chocó con {obj.name}."
            agent.energy -= 1
            obj.history.append(f"{agent.name} chocó aquí.")
            agent.status = "idle"
            agent.current_intent = None
            return # Don't proceed to general interaction
        elif "Farm" in obj.name:
            action_text = f"cosechó en {obj.name}."
            yield_mod = 5 * strength_mod
            agent.inventory["food"] += int(yield_mod)
            agent.needs["hunger"] = 100
            agent.energy -= 5
            obj.history.append(f"{agent.name} cosechó trigo.")
            agent.fitness += 2
            
        agent.add_memory("action", action_text)
        self.chat_logs.append({
             "type": "action",
             "time": self.game_time,
             "agent": agent.name,
             "text": action_text
        })
        
        # Deplete resource
        if obj.type == "resource" and obj.amount < 900: # 999 is infinite
            obj.amount -= 1
            if obj.amount <= 0:
                self.chat_logs.append({"type": "action", "time": self.game_time, "agent": "Mundo", "text": f"El recurso {obj.name} se ha agotado."})
                if obj in self.env_objects:
                    self.env_objects.remove(obj)
        
        await asyncio.sleep(2) # interaction time
        agent.status = "idle"
        agent.current_intent = None

    async def handle_agent_interaction(self, agent_a: Agent, agent_b: Agent):
        agent_a.status = "talking"
        agent_b.status = "talking"
        agent_a.talking_to = agent_b.id
        agent_b.talking_to = agent_a.id
        
        # Social interaction satisfies social need and gives fitness
        agent_a.needs["social"] = min(100, agent_a.needs["social"] + 30)
        agent_b.needs["social"] = min(100, agent_b.needs["social"] + 30)
        agent_a.fitness += 2
        agent_b.fitness += 2
        
        turns = random.randint(1, 2)
        current_speaker = agent_a
        current_listener = agent_b
        recent_context = f"Te acabas de cruzar con {agent_b.name}. Salúdalo."
        
        for turn in range(turns):
            # Show thinking indicator
            self.chat_logs.append({
                "type": "thinking",
                "time": self.game_time,
                "agent": current_speaker.name,
                "text": "está pensando..."
            })
            
            response_dict = await generate_dialogue(current_speaker, current_listener, recent_context)
            dialogue = response_dict.get("text", "")
            thought = response_dict.get("thought", "")
            
            # Update the thinking indicator to the actual thought if we got one
            if thought:
                if self.chat_logs and self.chat_logs[-1]["type"] == "thinking" and self.chat_logs[-1]["agent"] == current_speaker.name:
                    self.chat_logs[-1]["text"] = thought
            else:
                if self.chat_logs and self.chat_logs[-1]["type"] == "thinking" and self.chat_logs[-1]["agent"] == current_speaker.name:
                    self.chat_logs.pop()

            current_speaker.current_dialogue = dialogue
            self.chat_logs.append({"type": "dialogue", "time": self.game_time, "a": current_speaker.name, "b": current_listener.name, "text": dialogue})
            await asyncio.sleep(2.5) # Wait showing text
            
            current_speaker.add_memory("dialogue", f"Dijo a {current_listener.name}: {dialogue}")
            current_speaker.current_dialogue = None
            
            recent_context = f"{current_speaker.name} te acaba de decir: '{dialogue}'. Respóndele."
            current_speaker, current_listener = current_listener, current_speaker
        
        agent_a.status = "idle"
        agent_b.status = "idle"
        agent_a.current_intent = None
        agent_b.current_intent = None
        agent_a.talking_to = None
        agent_b.talking_to = None

world_engine_instance = WorldEngine()
